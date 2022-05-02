var express = require('express');
var app = express();
//these are the modules that are needed for the code to work



process.env.NODE_TLS_REJECT_UNAUTHORIZED='0';
//this turns off SSL certificate checking, as we dont have a SSL certificate


app.use(express.static('html'));//specifies where the static files are
app.use('/img',express.static('img'));
app.use('/css', express.static('css'))
var server = app.listen(3000, function () { //setup the server
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
});
