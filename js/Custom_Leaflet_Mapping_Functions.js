
 // This function maps the census JSON file to the properties of the GeoJSON file
 const matchCensusDataToGeoJSON = function(usStatesGeoJSON,populationData){
  const updatedGeoJSONFeature = usStatesGeoJSON;

  // Iterate over each GeoJSON feature
  updatedGeoJSONFeature.features.forEach(feature => {
    // Find corresponding population data for the feature
    const matchingPopulationData = populationData.find(data => data.fipsCode === feature.id);

    // Update the feature with population data
    if (matchingPopulationData) {
      feature.properties.population = matchingPopulationData.population;
    } else {
      console.warn(`No population data found for FIPS code: ${feature.id}`);
    }
  });

  return(updatedGeoJSONFeature)
 };


// This function pulls a GeoJSON file of States
const getGeoJSONData = async () => {
  try {
    const geoJSONURL = 'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json';
    // Fetch GeoJSON data from the provided URL
    const response = await fetch(geoJSONURL);
    const geoJSONData = await response.json();

    return(geoJSONData);
  } catch(error){
    console.error('Error fetching GeoJSON data:', error);
    throw error;
  }
}


// quantile calculation function
// source: https://stackoverflow.com/questions/48719873/how-to-get-median-and-quartiles-percentiles-of-an-array-in-javascript-or-php
const getQuantile = (arr, q) => {
      const sorted = arr;
      const pos = (sorted.length - 1) * q;
      const base = Math.floor(pos);
      const rest = pos - base;
      if (sorted[base + 1] !== undefined) {
          return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
      } else {
          return sorted[base];
      }
};

// Function to generate consecutive numbers in an array
function generateConsecutiveArray(num) {
    // Check if the input is a valid positive integer
    if (typeof num !== 'number' || num < 1 || !Number.isInteger(num)) {
        throw new Error('Input must be a positive integer');
    }

    // Create an array and fill it with consecutive numbers from 1 to num
    const result = Array.from({ length: num }, (_, index) => index + 1);

    return result;
}

// This function creates quantiles based on the population GeoJSON property
const getGeoJSONQuantiles = (geoJSONArray,quantileCount) => {

  // Extract population values from the GeoJSON feature collection
  const populationValues = geoJSONArray.features.map(feature => feature.properties.population);

  // Sort the population values in ascending order
  populationValues.sort((a, b) => a - b);

  // Calculate quantiles using simple-statistics library
  const quantiles = [];
  const numQuantiles = quantileCount;
  const quantilePct = 1/numQuantiles;
  const quantileCountArray = generateConsecutiveArray(quantileCount);
  quantileCountArray.forEach(indexNumber =>{
    quantiles.push(getQuantile(populationValues,quantilePct*indexNumber))
  })

  return(quantiles);
};

// This function returns a color based on a data value and quantile array
function getColor(d,quantileArray) {
    return d > quantileArray[6] ? '#800026' :
           d > quantileArray[5]  ? '#BD0026' :
           d > quantileArray[4]  ? '#E31A1C' :
           d > quantileArray[3]  ? '#FC4E2A' :
           d > quantileArray[2]   ? '#FD8D3C' :
           d > quantileArray[1]   ? '#FEB24C' :
           d > quantileArray[0]   ? '#FED976' :
                      '#FFEDA0';
};

// This function returns a color based on a data value and quantile array
function quantileStyle(feature,quantileArray) {
    return {
        fillColor: getColor(feature.properties.population,quantileArray),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
};

// This function formats the numbers in the legend 
const formatThousands = (num) =>{
  roundedNum = Math.round(num);
  return(roundedNum.toLocaleString());
}


// This function adds a simple legend to the map
const addLegend = function(quantileArray) {

  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend customLegendStyle'),
          grades = quantileArray,
          labels = [];

      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length-1; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i] + 1,quantileArray) + '"></i> ' +
              formatThousands(grades[i]) + (formatThousands(grades[i + 1]) ? '&ndash;' + formatThousands(grades[i + 1]) + '<br>' : '+');
      }

      return div;
  };

  legend.addTo(map);
  mapLegendArray.push(legend);
};


// This function displays the value on hover, highlights the feature
// These functions from the Leaflet tutorial: https://leafletjs.com/examples/choropleth/
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    layer.bringToFront();
    info.update(layer.feature.properties);
}
function resetHighlight(e) {

    var layer = e.target;

    layer.setStyle({
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    });
    geojson.resetStyle(e.target);
    info.update();
}
function onEachFeatureCustom(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });
}


// This function removes the polygon layers from the map
const clearMap = () =>{

  polygonLayerArray.forEach(function (item) {
      map.removeLayer(item)
  });

  mapLegendArray.forEach(function (item) {
      map.removeControl(item)
  });

  polygonLayerArray = [];
  mapLegendArray = [];
};

// This function adds the new layer to our leaflet map
const addLayerToMap = (dataArray) => {

    console.log(dataArray);

    clearMap();

    // Create Colors based on quantiles  
    const quantilePopArray = getGeoJSONQuantiles(dataArray,7);

    // Make data into leaflet layer
    const newLayer = L.geoJSON(dataArray, {
      style: function(feature){
        return quantileStyle(feature,quantilePopArray)
      },
      onEachFeature: onEachFeatureCustom
    })

    // Add New Layer to Map
    newLayer.addTo(map);
    polygonLayerArray.push(newLayer);

    // Add Legend
    addLegend(quantilePopArray);
    
};


// This function regenerates the leaflet map, based on which census variable name is entered
const mapJoinedData = async (census_variable_name) => {
  try {
    // Example usage
    getGeoJSONData()
     .then(stateGeoJSONData =>{
      fetchCensusData(census_variable_name)
        .then(statePopulationData => {      
          const geoJSONDataWithCensusData = matchCensusDataToGeoJSON(stateGeoJSONData,statePopulationData);
          addLayerToMap(geoJSONDataWithCensusData);
        })
        .catch(error => {
          console.error('Error with mapping function');
        });
    });
  } catch(error){
    console.error('Error fetching GeoJSON data before fetching Census Data:', error);
    throw error;
  }
};