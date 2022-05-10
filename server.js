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
let passport = require('passport')
let cookie_parser=require('cookie-parser')
app.use(cookie_parser('1234'))
let session = require('express-session')
var cookieSession = require('cookie-session');
let File_Store = require('session-file-store')(session)
const helmet = require("helmet");
let next = require("next")
let auth = require("./routes/auth.routes")
app.use(helmet())
//
let gfs;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileupload());
app.use('/uploads', express.static('uploads'))
app.set('view engine', 'ejs');
app.use(session({
    store: new File_Store(),
    secret: 'hello world',
    resave: true,
    saveUninitialized: true,
}))
app.use(express.static(path.join(__dirname, 'static')));

app.use('/html',express.static('html'));
app.use('/img',express.static('img'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
var loggedin = "Register/Login"
var posts = [];
var db = require("./db.js");
const Role = db.role;
//Get data from database for posts and put in a variable to send to the page.
const conn = mongoose.connection;






app.use('/', require('./routes/index'))
app.use('/pages', require('./routes/index'))

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});