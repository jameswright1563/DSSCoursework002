const express = require("express");
const cors = require("cors");
const path = require('path')
const app = express();
var mongoose = require("mongoose")
require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);

app.set('view engine', 'ejs');
var corsOptions = {
  origin: "http://localhost:8081"
};
var loggedin = "Register/Login"

//Get data from database for posts and put in a variable to send to the page.

var test = [
    {title: 'test1', desc: 'lol1'},
    {title: 'test2', desc: 'lol2'},
    {title: 'test3', desc: 'lol3'}
];


app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use('/html',express.static('html'));
app.use('/img',express.static('img'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.get('/', function(req, res){
   //res.sendFile(path.join(__dirname+'/html', '/index.html'))
    res.render('pages/index', {loggedin: loggedin, test: test});
});
app.get('/login', function(req, res){
   //res.sendFile(path.join(__dirname+'/html', '/login.html'))
    if(loggedin == "Profile"){
        res.render('pages/login', {loggedin: loggedin});
    }else{
        res.render('pages/profile', {loggedin: loggedin});
    }
});
app.get('/createpost', function(req, res){
   //res.sendFile(path.join(__dirname+'/html', '/createpost.html'))
    res.render('pages/createpost', {loggedin: loggedin});
});

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

const db = require("./models");
const Role = db.role;
db.mongoose
  .connect(`mongodb+srv://js_user:4488@cluster0.jp9fi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));


function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'user' to roles collection");
      });
      new Role({
        name: "moderator"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'moderator' to roles collection");
      });
      new Role({
        name: "admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'admin' to roles collection");
      });
    }
  });
}
const session = require('express-session');
const { Session } = require("inspector");
const { resolve } = require("path");

const conn = mongoose.connection;
const loginjs = require('./js/login')

function createPost(request, response){
    try{
        db.post.create({
            "author": request.author,
            "title": request.title,
            "image": request.image,
            "description": request.description
        });
    } catch(e){
        console.log("Error creating Post")
        response.render("pages/createpost", {})
    }
}


app.post('/auth', function(request, response) {
    // Capture the input fields
    let username = request.body.username;
    let password = request.body.password;
    // Ensure the input fields exists and are not empty - EXTRA CHECKS REQUIRED
    try{
        conn.collection("users").find({"username": username, "password": password})
                                            .toArray((err, results) => {
                                                if (results.length==0){
                                                    console.log("No")
                                                    response.render('pages/login')
                                                }
                                                else if(passVerify(request)) {
                                                    console.log("Logged in: %s", results[0]["username"])
                                                    loggedin = "Profile";
                                                    response.render('pages/index', {loggedin:loggedin})
                                                }
                                            });
                                            }
    catch (e){
        console.log("No")
        return resolve({error: true, message: "User/Password is incorrect", data:[]});
    }
});

const bcrypt = require('bcryptjs')

function encryptpass(request){
    return bcrypt.hashSync(request.body.password2, 8)
}

function passVerify(request){
    datab = conn.collection("users").find({"username": request.username}).toArray(err, results);
    bcrypt.compare(request.password, datab[0]["password"], function (err, res){
        if(err){
            return false;
        }
        if(res){
            return true;
        }
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
    let password = request.body.password2;
    let confirm = request.body.confirm_password;
    if (confirm===password && username && !checkUserExists(username)){
            db.user.create({"username":username,
                            "email": email,
                            "password": encryptpass(request)});
            response.sendFile(path.join(__dirname+'/html', '/index.html'))
}})