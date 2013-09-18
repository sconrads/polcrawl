var http = require("http");
var cheerio = require('cheerio');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/pol');
var async = require('async');

// Vinmonopolets product types
var productTypes = ["R%C3%B8dvin","Hvitvin","Ros%C3%A9vin","Musserende+vin","Fruktvin","Sterkvin","Brennevin","%C3%98l","Alkoholfritt"];

var fetchtime = new Date();
console.log("Fetchtime: " + fetchtime);

// Loop each product type
async.forEachLimit(productTypes, 1, function(productItem, callback) {

  // Create an array from 1 to 200. Used to navigate to each product list page 
  var pages = [];
  for (var i = 1; i <= 200; i++) {
    pages.push(i);
  }

  // Loop each page for every product type. There are 187 pages for Red Wine by 15.09.2013
  async.forEachLimit(pages, 10, function(page, callback) {

      // The search query
      var url = "http://www.vinmonopolet.no/vareutvalg/sok?query=*&sort=2&sortMode=0&filterIds=25&filterValues=" + productItem + "&page=" + page;
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
                productName = details(this).find('h1').text();
                //console.log(productName);
              });

              // Price and volume
              details('.price').each(function(){
                price = details(this).find('strong').text();
                //console.log(price);
                volume = details(this).find('em').text();
                //console.log(volume);
              });

              // Product detail list
              details('.productData').each(function(){

                // Product id
                var productIdObject = details(this).find("li").first().find('.data'); 
                productId = productIdObject.text(); 
                //console.log(productId);

                // Type
                var productTypeObject = productIdObject.parent().next("li").find('.data'); 
                productType = productTypeObject.text(); 
                //console.log(productType);

                // Product choice
                var productChoiceObject = productTypeObject.parent().next("li").find('.data'); 
                productChoice = productChoiceObject.text(); 
                //console.log(productChoice);

                // Contry
                productIdObject.parent().parent().find('.attrib').each(function(){
                  //console.log(details(this).text() + '\n');
                  if ( details(this).text() == "Land/distrikt:" )
                  {
                    var contryObject = details(this).next();
                    contry = contryObject.text(); 
                    //console.log(contry);
                  }
                });

              });  

              // The price and fetch time JSON object
              var priceJson = {
                                price : price.replace(/(\r\n|\n|\r)/gm,"").replace('Kr.',"").trim(),
                                time : fetchtime
                              };

              // Gets the MongoDB collection pol
              var polData = db.get('pol');
             
              // Tries to update with new prices, if product do not exists, it will be inserted
              polData.update( {
                                  _id : productId.trim(),
                                  name : productName.trim(),
                                  type : productType.trim(),
                                  choice : productChoice.trim(),
                                  volume : volume.replace('(',"").replace(')',"").trim(),
                                  contry : contry.replace(/(\r\n|\n|\r)/gm,"").trim() 
                                },
                  { 
                    $push: { prices:  priceJson } 
                  },
                   { upsert: true }
                  ,function (err, doc) {
                    if (err) {
                        console.log("There was a problem adding the information to the database.");
                    }
                  });
             
            }
            else console.log("error");  
          });
        });

      }
      else console.log("error");  
      }); 

  }, function(err) {
    console.log('> done');
  });   

}, function(err) {
  console.log('> done');
});

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





