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
let next = require("next")
let auth = require("./routes/auth.routes")

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
var currentUser;
var currentSession;
let authFn = (req, res) => {
    if (req.session.auth) {
        currentSession=req.session
        console.log(req.session)
        loggedin = "Profile"
        return true
    } else {
        loggedin = "Register/Login"
        return false
    }
}
var test=[]
app.get('/logout', (req, res, next) => {
    if (req.session) {
        req.session.destroy() // Delete session
        res.clearCookie('session-id') // delete cookie
        res.send('Logout success.Redirected things for the front end to do')
    } else {
        var err = new Error('you are not logged in!')
        err.status = 403
        next(err)
    }
})

async function getPosts(){
    await db.Post.find({}).then(post => {
        test=post
    })
}

app.get('/', async function (req, res) {
    await getPosts()
    currentSession = req.session
    if(authFn(req,res)){

        loggedin ="Profile"
    }
    else{
        loggedin ="Register/Login"
    }
    res.render('pages/index', {loggedin: loggedin, test: test});
    res.end()
});




app.get('/login', function(req, res){
    if(loggedin == "Profile"){
        res.render('pages/profile', {loggedin: loggedin, error:"",email:req.session.email, username:req.session.username });
    }else{
        res.render('pages/login', {loggedin: loggedin, error:""});
    }
});
function encryptpass(passw){
    var pass =bcrypt.hashSync(passw, 8)
    return pass
}

async function passVerify(pass, datab) {
    var encypt = await encryptpass(pass)
    bcrypt.compare(encypt, datab["password"], function (err, res) {
        if (typeof err !== "undefined") {
            return false;
        }
        if (res) {
            return true;
        }
        return false;
    })
}
app.post('/auth', function(request, response) {
    // Capture the input fields
    let cookie_Stuff=request.signedCookies.user
    let password = request.body.password
//But the user is logging in for the first time so there won't be any appropriate signed cookie for usage.
    if (request.session.auth) { // Tagged with req.session.auth, whether the tag has passed login validation
        response.statusCode = 200
        response.send('You are already authenticated')
    } else {
        conn.collection("users").findOne({username: request.body.username}).then(user => {
            if (user) {
                currentUser=user
                if (!passVerify(password, user)) {
                    loggedin = "Register/Login";
                    let error="Username/Password Incorrect";
                    response.render('pages/login', {loggedin:loggedin, error:error})
                } else {
                    request.session.email =user.email
                    request.session.username = user.username
                    request.session.auth = true // Logon success setting marked true
                    response.statusCode = 200
                    loggedin = "Profile";
                    response.render('pages/index', {loggedin:loggedin, test:test})
                }

            } else { // No user specified
                var err = new Error(`User ${request.body.username} does not exist!`)
                err.status = 403
            }
            // }).catch(err => next(err))
        }).catch(err => {
            console.log(err)
        })
    }
    // Ensure the input fields exists and are not empty - EXTRA CHECKS REQUIRE
});
app.get('/createpost', function(req, res){
    if(authFn(req,res,next)) {
        loggedin = "Profile"
        res.render('pages/createpost', {loggedin: loggedin, title: currentPost["title"],
            description:currentPost["description"]});
    }
    else{
        res.render('pages/login', {loggedin: loggedin, error:""});

    }
});


// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

var storage = multer.diskStorage({
    destination: function(req,file,cb){
        title=req.body.title;
        desc = req.body.description;
        cb(null, '../uploads/')
    },
    filename: function(req, file, cb) {
        cb(null, Date.now()+file.originalname)
    }
})
var title;
var desc;

function fileFilter(req,res,cb) {
    if(file.mimetype === "image/jpeg"||file.mimetype ==='image/png'||file.mimetype ==='image/webp'){

        cb(null, true);
    }

    else{
        cb(null,false);
    }
}
var upload = multer({
    storage:storage,
    fileFilter: (req, file, cb) => {fileFilter(req, file, cb)}
})

app.post('/makepost', async function(req, res){
    authFn(req,res,next)
    desc = req.body.description;
    title = req.body.title;
    res.render('pages/uploadimage', {loggedin: loggedin, test: test});

});
app.post('/makepostimage', upload.single('form'), async function(req, res){

    if(!req.files)
    {
        console.log("No files were uploaded")
    }
    req.on('data', (data) => {
        console.log(data.toString());
    });
    const file = req.files.image;

    const path = __dirname +"/uploads/"+file.name;
    file.mv(path, (err) => {
        if (err) {
            console.log("success");
        }
    });

    await db.Post.create({
        "author": req.session.username,
        "title": title,
        "img": {
            data: fs.readFileSync(path),
            contentType: file.mimetype
        },
        "description": desc,
    })
    getPosts().then(res.render('pages/index', {loggedin: loggedin, test: test}));


});
var currentPost
app.get("/editpost.ejs", function (req,res){
    if(req.session.username === test[req.query.id]["author"]&&req.session.auth===true){
        res.redirect("/createpost")
        currentPost=test[req.query.id]
    }
    else{
        console.log("No")
    }
})
var error="";

const bcrypt = require('bcryptjs')
const {response} = require("express");

function checkUserExists(username){
    try {
        conn.collection("users").find({"username": username})
            .toArray((err, results) => {
                if (results.length == 0) {
                    console.log("No");
                    return false;
                }
                return true;
            });
    }   catch (e){
        return false;
    }
}


app.post('/signup', function(request, response){
    let username = request.body.username;
    let email = request.body.email;
    let password = request.body.password;
    let confirm = request.body.confirm_password;
    if (confirm===password && username && !checkUserExists(username)){
            db.user.create({"username":username,
                            "email": email,
                            "password": encryptpass(request)});
        getPosts().then(r =>  response.render('pages/index', {loggedin: loggedin, test: test}))

}})