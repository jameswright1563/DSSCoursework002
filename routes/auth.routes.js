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




module.exports = {authFn , authenticateEmail, encryptpass,loggedin};
