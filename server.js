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
//
let gfs;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileupload());
require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);
app.use('/uploads', express.static('uploads'))
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'static')));

app.use('/html',express.static('html'));
app.use('/img',express.static('img'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
var loggedin = "Register/Login"
var test = [];
var db = require("./db.js");
const Role = db.role;
//Get data from database for posts and put in a variable to send to the page.
const conn = mongoose.connection;
conn.once("open", function () {
    gfs = Grid(conn.db, mongoose);
    gfs.collection("posts");
});

app.get('/', async function (req, res) {
    //res.sendFile(path.join(__dirname+'/html', '/index.html'))
    test = await db.post.find({})
    console.log(test[0]);
    res.render('pages/index', {loggedin: loggedin, test: test});
});


app.get('/login', function(req, res){
    if(loggedin == "Profile"){
        res.render('pages/profile', {loggedin: loggedin, error:""});
        console.log("test")
    }else{
        res.render('pages/login', {loggedin: loggedin, error:""});
    }
});
app.get('/createpost', function(req, res){
    res.render('pages/createpost', {loggedin: loggedin});
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
    if(file.mimetype === "image/jpeg"||file.mimetype ==='image/png'){

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

    await db.post.create({
        "author": "",
        "title": title,
        "img": {
            data: fs.readFileSync(path),
            contentType: file.mimetype
        },
        "description": desc
    })
    res.render('pages/index', {loggedin: loggedin, test: test});

});

var error="";
app.post('/auth', function(request, response) {
    // Capture the input fields
    let username = request.body.username;
    let password = request.body.password;
    // Ensure the input fields exists and are not empty - EXTRA CHECKS REQUIRED
    try{
        conn.collection("users").find({"username": request.body.username})
                                            .toArray((err, results) => {
                                                if (results.length==0){
                                                    console.log("No")
                                                    loggedin = "Register/Login";
                                                    error="Username/Password Incorrect";
                                                    response.render('pages/login', {loggedin:loggedin, error:error})
                                                }
                                                else if(passVerify(password, results)&&results.length>0) {
                                                    console.log("Logged in: %s", results[0]["username"])
                                                    loggedin = "Profile";
                                                    response.render('pages/index', {loggedin:loggedin, test:test})
                                                }
                                                else{
                                                    loggedin = "Register/Login";
                                                    error="Username/Password Incorrect";
                                                    response.render('pages/login', {loggedin:loggedin, error:error})
                                                }
                                            });
                                            }
    catch (e){
        console.log("No")
        return resolve({error: true, message: "User/Password is incorrect", data:[]});
    }
});

const bcrypt = require('bcryptjs')
function encryptpass(passw){
    var pass =bcrypt.hashSync(passw, 8)
    return pass
}

async function passVerify(pass, datab) {
    var encypt = await encryptpass(pass)
    bcrypt.compare(encypt, datab[0]["password"], function (err, res) {
        if (typeof err !== "undefined") {
            return false;
        }
        if (res) {
            return true;
        }
        return false;
    })
}
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
        response.render('pages/index', {loggedin: loggedin, test: test});
}})