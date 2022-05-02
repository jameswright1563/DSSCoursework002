const express = require('express');
const session = require('express-session');
const path = require('path');


function alerting(){
    window.alert("Username/Password Incorrect")
}

const app = express();

//app.use(session({
  //  secret: 'secret',
 //   resave: true,
  //  saveUninitialized: true
//}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

// http://localhost:3000/
app.get('/', function(request, response) {
    // Render login template
    response.sendFile(path.join(__dirname + '/login.html'));
});

// http://localhost:3000/auth
app.post('/auth', function(request, response) {
    // Capture the input fields
    let username = request.body.username;
    let password = request.body.password;
    // Ensure the input fields exists and are not empty
    if (username && password) {
        // Execute SQL query that'll select the account from the database based on the specified username and password
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) throw error;
            // If the account exists
            if (results.length > 0) {
                // Authenticate the user
                request.session.loggedin = true;
                request.session.username = username;
                // Redirect to home page
                response.redirect('/home');
            } else {
                response.send('Incorrect Username and/or Password!');
            }
            response.end();
        });
    } else {
        response.send('Please enter Username and Password!');
        response.end();
    }
});
app.post('/signup', function(request, response){
    let username = request.body.username;
    let email = request.body.email;
    let password = request.body.password;
    let confirm = request.body.confirm_password;
        db.user.create({"username":username,
                        "email": email,
                        "password": password})
});