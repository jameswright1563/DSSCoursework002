const db = require("../db");
const express = require("express");
const conn = db.mongoose.connection
var bodyParser = require('body-parser')
const bcrypt = require("bcryptjs");

var router = express.Router();
router.use(bodyParser.json())

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
router.post('/auth', function(request, response,next) {
  // Capture the input fields
  let username = request.body.username;
  let cookie_Stuff=request.signedCookies.user
  let password = request.body.password
//But the user is logging in for the first time so there won't be any appropriate signed cookie for usage.
  if (request.session.auth) { // Tagged with req.session.auth, whether the tag has passed login validation
    response.statusCode = 200
    response.send('You are already authenticated')
  } else {
    conn.collection("users").findOne({username: request.body.username}).then(user => {
      if (user) {
        if (!passVerify(password, user)) {
          let loggedin = "Register/Login";
          let error="Username/Password Incorrect";
          response.render('pages/login', {loggedin:loggedin, error:error})
        } else {
          request.session.email =user.email
          request.session.username = user.username
          request.session.auth = true // Logon success setting marked true
          response.statusCode = 200
          let loggedin = "Profile";
          response.render('pages/index', {loggedin:loggedin, test:test})
        }

      } else { // No user specified
        var err = new Error(`User ${request.body.username} does not exist!`)
        err.status = 403
        next(err)
      }
      // }).catch(err => next(err))
    }).catch(err => {
      console.log(err)
    })
  }
  // Ensure the input fields exists and are not empty - EXTRA CHECKS REQUIRE
});

module.exports = router;
