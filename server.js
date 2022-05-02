var express = require('express');
var app = express();
var path = require('path')
//these are the modules that are needed for the code to work



process.env.NODE_TLS_REJECT_UNAUTHORIZED='0';
//this turns off SSL certificate checking, as we dont have a SSL certificate


app.get('/', function(req, res){

   res.sendFile(path.join(__dirname, '/html/index.html'))
   app.use('/html',express.static('html'));

   app.use('/img',express.static('img'));
   app.use('/css', express.static('css'))
   app.use('/js', express.static('js'))

   // res.sendFile('img/')

})

var server = app.listen(3000, function () { //setup the server
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
});
