var http = require("http");
var cheerio = require('cheerio');

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

for (var i=0;i<200;i++)
{ 
  var page = i+1;
  var url = "http://www.vinmonopolet.no/vareutvalg/sok?query=*&sort=2&sortMode=0&filterIds=25&filterValues=R%C3%B8dvin&page=" + page;
  console.log(url);
  download(url, function(data) {
  if (data) {
    //console.log(data);
    var list = cheerio.load(data);

    // Loop all products in list
    list('.product').each(function() {
      
      // Product name
      //var productName = list(this).text();
      //console.log(productName);

      // href to product details
      var urlDetails = list(this).attr("href");
      //console.log(urlDetails);

      download(urlDetails, function(data) {
        if (data) {
          //console.log(data);
          var details = cheerio.load(data);

          details('.head').each(function(){
            var productName = details(this).find('h1').text();
            console.log(productName);
          });

          details('.price').each(function(){
            var price = details(this).find('strong').text();
            console.log(price);
          });

          details('.productData').each(function(){
            var productId = details(this).find('li').first().find('.data').text(); 
            console.log(productId);
          });    
        }
        else console.log("error");  
      });
      
      // Product type and id
      //list(this).parent().next('p').each(function() {
      //  console.log(list(this).text());    
      //});

    });

  }
  else console.log("error");  
  });
}


