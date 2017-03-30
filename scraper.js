// File System Library
const fs = require("fs");

// Screen Scraper Library (3rd-Party)
const osmosis = require("osmosis");

// JSON to CSV Library (3rd-Party)
const converter = require("json2csv");

const baseurl = 'http://shirts4mike.com/';

// Array of retrieved products
var products = [];

// Indication that processing of products has started
var processingProductsStarted = false;

// Create data directory if it doesn't exist
if (!fs.existsSync("./data")) {
fs.mkdirSync("./data");
}

// Make call to website
osmosis.get(baseurl + '/shirts.php')
.find('ul.products li a')
.set('URL', '@href')
.follow('@href')
.set({
	'Price':'span.price',
	'Title':'div.shirt-picture img@alt',
	'ImageURL': 'div.shirt-picture img@src'
})
.data(function (results) {
  // This processing is called for every product asynchronously
  if (products.length < 8) {
  	 // Add product information to array
     products.push(results);
  } 

  // Once we have 8 products, we'll start the processing (if we haven't already)
  if (products.length == 8 && !processingProductsStarted) {
  	processingProductsStarted = true;
  	saveResultsToFile();
  }
})
.error(function (error) {
	// If there is an error, we'll record it using our standard error processing
	logError("Unable to access http://shirts4mike.com/");
});


// Process all of the results
function saveResultsToFile() {
	var fields = ['Title','Price','ImageURL','URL'];
	var result = converter({data: products, fields: fields});
    var now = new Date();
    var filename = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDay() + ".csv";
    console.log("Creating file " + filename);
    // Create File
    fs.writeFile('./data/' + filename, result, function(error) {
    	if (error) {
    		logError(error.message);
    	}
    })
}

// Log error to file
function logError(message) {
   fs.appendFile("scraper-error.log", "[" + new Date() + "] " + message + "\n", function (e) {
		console.log("An error has occured - scraper-error.log created");
	});
}