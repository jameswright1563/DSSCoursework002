require("dotenv").config()
const express = require("express");
const path = require('path')
const app = express();
const fileupload = require("express-fileupload");
const bodyParser = require('body-parser')
let cookie_parser=require('cookie-parser')
app.use(cookie_parser('1234'))
let session = require('express-session')
let File_Store = require('session-file-store')(session)
const helmet = require("helmet");
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileupload());
app.use('/uploads', express.static('uploads'))
app.set('view engine', 'ejs');
app.use(session({
    store: new File_Store(),
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: false,
    httpOnly: true,
    cookie: {
        expires: Date(Date.now + Date(3600000)),
        maxAge:  3600000
    }
}))
app.use(helmet.contentSecurityPolicy({directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "trusted-cdn.com", "https://www.google.com/recaptcha/", "https://www.gstatic.com/recaptcha/", "code.jquery.com", "cdn.jsdelivr.net", "stackpath.bootstrapcdn.com"],
        frameSrc: ["'self'", "https://www.google.com/recaptcha/", "https://recaptcha.google.com/recaptcha/"]
    }}));
app.use(express.static(path.join(__dirname, 'static')));
app.use('/html',express.static('html'));
app.use('/img',express.static('img'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use(express.static('favicon'));
var db = require("./db.js");
const {loggedin} = require("./routes/auth.routes");

app.use('/', require('./routes/index'))
app.use('/pages', require('./routes/index'))

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});