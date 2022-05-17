const db = require("../db");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const path = require("path");
var posts = [];
let currentUser;
var currentPost;
var profilePicture;
var pagename;
var emailtext;
const User = db.user

var currentSession, loggedin;
let authFn = (req, res) => {
  if (req.session.auth) {
    currentSession=req.session
    console.log(req.session)
    profilePicture = "https://i.imgur.com/5jgN0Q9.png";
    loggedin = "Profile"
    return true
  } else {
    profilePicture = "https://i.imgur.com/eMQHsNk.png";
    loggedin = "Register/Login"
    return false
  }
}

async function getPosts(){
  await db.Post.find({}).then(post => {
    posts= post
    return posts
  }).catch(err => {
    console.log(err);
    posts = [];
    return posts})
  return posts
}

async function authenticateEmail(req, email, message) {
  var emailAccount = nodemailer.createTransport({ //this sets up the email account to send an email from
    service: 'gmail',
    auth: {
      user: 'dssug17@gmail.com',
      pass: 'abc489GHJ'
    }
  });
  var emailDestination = {
    from: 'dssug17@gmail.com',
    to: email,
    subject: 'Authentication code',
    text: message
  };
  await emailAccount.sendMail(emailDestination, async function (error, info) {
    if (error) {
      console.log("Error: "+error);
    } else {
      console.log("Email send: " + info.response);

    }
  })


}
function encryptpass(passw){
  var pass =bcrypt.hashSync(passw, 8)
  return pass
}

async function uploadImage(req) {

  if (!req.files) {
    console.log("No files were uploaded")
  }
  req.on('data', (data) => {
    console.log(data.toString());
  });
  const file = req.files.image;

  const paths = path.join(__dirname, '..', 'uploads', String(file.name));
  await file.mv(paths, (err) => {
    if (err) {
      console.log("success");
    }
  });
  return file
}

function fileFilter(req,res,cb) {
  if(file.mimetype === "image/jpeg"||file.mimetype ==='image/png'||file.mimetype ==='image/webp'||file.mimetype==='image/jpg'){

    cb(null, true);
  }

  else{
    cb(null,false);
  }
}
function checkUserExists(username){
  try {
    User.find({"username": username})
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

module.exports = {authFn, getPosts , authenticateEmail, encryptpass, fileFilter, checkUserExists, uploadImage ,loggedin};
