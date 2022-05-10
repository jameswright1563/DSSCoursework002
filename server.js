require("dotenv").config()
const express = require("express");
const path = require('path')
const app = express();
const mongoose = require("mongoose")
var nodemailer = require("nodemailer");
const fs = require('fs')
const multer = require('multer')
const fileupload = require("express-fileupload");
const Grid = require("gridfs-stream");
const bodyParser = require('body-parser')
let passport = require('passport')
let cookie_parser=require('cookie-parser')
app.use(cookie_parser('1234'))
let session = require('express-session')
let File_Store = require('session-file-store')(session)
const helmet = require("helmet");
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
    secret: "1234",
    resave: true,
    saveUninitialized: false,
    httpOnly: true,
    cookie: {
        expires: Date(Date.now + Date(3600000)),
        maxAge:  3600000
    }
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