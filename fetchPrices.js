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

var url = "http://www.vinmonopolet.no/vareutvalg/sok?query=*&sort=2&sortMode=0&page=1&filterIds=25&filterValues=R%C3%B8dvin"

download(url, function(data) {
  if (data) {
    //console.log(data);
    $ = cheerio.load(data);
    $('.product').each(function() {
      console.log($(this).text());
      
      $(this).parent().next('p').each(function() {
        console.log($(this).text());    
      });

    });

  }
  else console.log("error");  
});


