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
var test = "not logged in";

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
    res.render('pages/index', {test: test});
});
app.get('/login', function(req, res){
   //res.sendFile(path.join(__dirname+'/html', '/login.html'))
    res.render('pages/login');
});
app.get('/createpost', function(req, res){
   //res.sendFile(path.join(__dirname+'/html', '/createpost.html'))
    res.render('pages/createpost');
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


app.post('/auth', function(request, response) {
    // Capture the input fields
    let username = request.body.username;
    let password = request.body.password2;
    // Ensure the input fields exists and are not empty - EXTRA CHECKS REQUIRED
    try{
        conn.collection("users").find({"username": username, "password": password})
                                            .toArray((err, results) => {
                                                if (results.length==0){
                                                    console.log("No")
                                                    response.render('pages/login')
                                                }
                                                console.log("yes")
                                                test = "logged in";
                                                response.render('pages/index', {test: test})});
                                            }
    catch (e){
        console.log("No")
        return resolve({error: true, message: "User/Password is incorrect", data:[]});
    }
});

const bcrpt = require('bcryptjs')

function encryptpass(request){
    return bcrpt.hashSync(request.body.password2, 8)
}

app.post('/signup', function(request, response){
    let username = request.body.username;
    let email = request.body.email;
    let password = request.body.password2;
    let confirm = request.body.confirm_password;

    if(username && password){
        db.user.create({"username":username,
                        "email": email,
                        "password": encryptpass(request)});
        response.sendFile(path.join(__dirname+'/html', '/index.html'))
    }
});