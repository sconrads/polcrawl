var http = require("http");
var cheerio = require('cheerio');

// Vinmonopolets product types
var productTypes = ["R%C3%B8dvin","Hvitvin","Ros%C3%A9vin","Musserende+vin","Fruktvin","Sterkvin","Brennevin","%C3%98l","Alkoholfritt"];

// Loop product types
for (var i = 0; i < productTypes.length; i++)
{
  // Loop each page for every product type. There are 187 pages for Red Wine by 15.09.2013
  for (var j=0;j<200;j++)
  { 
    var page = j+1;

    // The search query
    var url = "http://www.vinmonopolet.no/vareutvalg/sok?query=*&sort=2&sortMode=0&filterIds=25&filterValues=" + productTypes[i] + "&page=" + page;
    console.log(url);

    // Download the page of produtcs
    download(url, function(data) {
    if (data) {

      // The list of products for a specific product type and page as a DOM
      var list = cheerio.load(data);

      // Loop all products in list
      list('.product').each(function() {

        // href to product details
        var urlDetails = list(this).attr("href");

        // Download the detail page
        download(urlDetails, function(data) {
          if (data) {

            // The details for each product DOM
            var details = cheerio.load(data);

            // Product name
            details('.head').each(function(){
              var productName = details(this).find('h1').text();
              console.log(productName);
            });

            // Price
            details('.price').each(function(){
              var price = details(this).find('strong').text();
              console.log(price);
            });

            // Product id
            details('.productData').each(function(){
              var productId = details(this).find('li').first().find('.data').text(); 
              console.log(productId);
            });   

            //TODO Save to Mongo 
          }
          else console.log("error");  
        });
      });

    }
    else console.log("error");  
    });
  }
  // End pages per product type for loop
}
// End product type for loop

// Utility function that downloads a URL and invokes
// callback with the data.
function download(url, callback) {
  http.get(url, function(res) {
    var data = "";
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on("end", function() {
      callback(data);
    });
  }).on("error", function() {
    callback(null);
  });
}





