require("dotenv").config()
const express = require("express");
const path = require('path')
const app = express();
const mongoose = require("mongoose")
const fs = require('fs')
const multer = require('multer')
const fileupload = require("express-fileupload");
const Grid = require("gridfs-stream");
const bodyParser = require('body-parser')
const helmet = require('helmet')
let passport = require('passport')
let cookie_parser=require('cookie-parser')
app.use(cookie_parser('1234'))
let session = require('express-session')
var cookieSession = require('cookie-session');
let File_Store = require('session-file-store')(session)
let next = require("next")
let auth = require("./routes/auth.routes")

//
let gfs;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileupload());
app.use('/uploads', express.static('uploads'))
app.set('view engine', 'ejs');
app.use('/', require('./routes/index'))
app.use('/pages', require('./routes/index'))
app.use('/css',express.static('css'))
app.use('/js',express.static('js'))
app.use(session({
    store: new File_Store(),
    secret: 'hello world',
    resave: true,
    saveUninitialized: true,
}))
app.use(express.static(path.join(__dirname, 'static')));



// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
app.use(helmet.xssFilter());                // disables browsers' buggy cross-site scripting filter by setting the X-XSS-Protection header to 0
app.use(helmet.contentSecurityPolicy());    // sets the Content-Security-Policy header which helps mitigate cross-site scripting attacks, among other things
app.use(helmet.hsts());                     // tells browsers to prefer HTTPS over insecure HTTP
app.use(helmet.ieNoOpen());                 // forces potentially-unsafe downloads to be saved, mitigating execution of HTML in the site's context

