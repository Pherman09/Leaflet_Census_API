// Function to get the value of the user input
function getInputValue(inputID) {
    // Retrieve the input element by its ID
    const inputElement = document.getElementById(inputID);

    // Get the value of the input element
    const inputValue = inputElement.value;

    return inputValue;
}

// Function that regenerates the map when the user clicks the action button
document.getElementById("submitButton").onclick = function(){
	const myInputValue = getInputValue("censusInput");
	console.log(myInputValue);
	mapJoinedData(myInputValue);
};

// Initialize the map when the page is loaded
document.addEventListener('DOMContentLoaded', mapJoinedData("B01001_001E"));
