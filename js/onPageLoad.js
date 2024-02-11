// These functions run when the page is loaded

// Create a Leaflet map that takes up the whole page
const map = L.map('map').setView([37.8, -96], 4); // Centered on the United States

// Add a tile layer for the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);


// Create layer group
let polygonLayerArray = [];
let mapLegendArray = [];

// Initialize Map on Load
document.addEventListener('DOMContentLoaded', mapJoinedData("B01001_001E"));

// Add Info to top right
// From Leaflet Tutorial: https://leafletjs.com/examples/choropleth/
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'infoBox'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4></h4>' +  (props ?
        '<b>' + props.name + '</b><br />' + formatThousands(props.population) + ' people'
        : 'Hover over a state');
};

info.addTo(map);