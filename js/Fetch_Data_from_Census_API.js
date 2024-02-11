const censusApiKey = '';

const fetchCensusData = async (variable_name) => {
  try {
    //
    //const request_url = `https://api.census.gov/data/2022/acs/acs5?get=NAME,`+ variable_name+`&for=state:*&key=${censusApiKey}`;
    const request_url = `https://api.census.gov/data/2022/acs/acs5?get=NAME,${variable_name}&for=state:*&key=${censusApiKey}`;
    //const request_url = `https://api.census.gov/data/2022/acs/acs5?get=NAME,B01001_001E&for=state:*&key=${censusApiKey}`;
    
    console.log(request_url);

    // Make a request to the Census API to get state population data
    const response = await fetch(request_url);
    const data = await response.json();

    // Extract FIPS code and population for each state
    const statePopulationData = data.slice(1).map(entry => ({
      fipsCode: entry[2],
      population: parseInt(entry[1])
    }));

    return statePopulationData;
  } catch (error) {
    console.error('Error fetching Census data:', error);
    throw error;
  }
};
