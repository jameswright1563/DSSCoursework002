const express = require('express');
const next = require("next");
const db = require("../db");
const router  = express.Router();
const path = require('path')
const bcrypt = require("bcryptjs");
const multer = require("multer");
var {authFn , authenticateEmail, encryptpass,loggedin} = require('./auth.routes')
const {checkUserExists} = require('./user.routes')
const {getPosts, fileFilter, uploadImage} = require('./post.routes')
const User = db.user
//register page
var posts;
let currentUser;
var currentPost;
var profilePicture;
var pagename;
var emailtext;




//Route for the search post function that redirects to index with posts
router.post('/search', async function(req, res){
    pagename="index"
    search = req.body.search;
    posts = await db.Post.find({$text: {$search: search}}).then(posts=>{

            console.log(posts.length)
            if(authFn(req,res)) {
                loggedin = "Profile"
                profilePicture = "https://i.imgur.com/5jgN0Q9.png";
                res.render('pages/index', {loggedin: loggedin, posts: posts, error:"", profilePicture:profilePicture, page_name:pagename});
            }
            else{
                res.render('pages/login', {loggedin: loggedin,posts:posts, error:"", profilePicture:profilePicture, page_name:pagename});

            }
        })


});

async function index(req, res) {
    pagename = "index"
    profilePicture = "https://i.imgur.com/eMQHsNk.png";

    posts = await getPosts().then(post => {
        if (authFn(req, res)) {
            console.log("User logged in: %s", req.session.username)
            loggedin = "Profile"

            res.render('pages/index.ejs', {
                loggedin: loggedin,
                posts: post,
                error: "",
                profilePicture: profilePicture,
                page_name: pagename
            })
        } else {
            loggedin = "Register/Login"
            res.render('pages/index.ejs', {
                loggedin: loggedin,
                posts: post,
                error: "",
                profilePicture: "https://i.imgur.com/eMQHsNk.png",
                page_name: pagename
            })
        }
    })
}
router.get('/', async (req, res) => {
    index(req, res)
})
router.get('/index', async (req, res) =>{
    index(req,res)
})

router.get('/login', function(req, res){
    pagename="login"
    if(req.session.auth){
        res.render('pages/profile', {loggedin: loggedin, error:"",email:req.session.email, username:req.session.username , profilePicture:profilePicture, page_name:pagename});
    }else{
        res.render('pages/login', {loggedin: loggedin, posts:posts, error:"", profilePicture:profilePicture,page_name:pagename});
    }
})

router.get("/change", async function(req, res){
    res.render("pages/changepassword",{loggedin: loggedin,
        profilePicture: profilePicture,
        page_name:pagename})
})

router.post("/changepass",async function(req, res){
    if(req.body.password2===req.body.confirm_password) {
        User.findOneAndUpdate({email: req.session.email}, {password: encryptpass(req.body.password2)}).then(user => {
            console.log("Password changed for "+user["username"])
            res.render('pages/profile', {loggedin: loggedin, error:"Password changed",email:req.session.email, username:req.session.username , profilePicture:profilePicture, page_name:pagename});
        }).catch(err =>{
            console.log(err)
            res.render('pages/profile', {loggedin: loggedin, error:"Password cannot be changed",email:req.session.email, username:req.session.username , profilePicture:profilePicture, page_name:pagename});
        }

    )
    }
})
router.post("/authenticatecode", async function (request, response) {
    pagename="login"
    var authcode = request.body.authcode;
    if (authcode===emailtext) {
        request.session.fa = true
        request.session.auth = true // Logon success setting marked true
        profilePicture = "https://i.imgur.com/5jgN0Q9.png";
        loggedin = "Profile";
        await getPosts().then(post => {
            pagename = "index"
            response.render('pages/index', {
                loggedin: loggedin,
                posts: post,
                error: "",
                profilePicture: profilePicture,
                page_name:pagename
            })
        });
    } else {
        let error = "Wrong code!"
        response.render("pages/authenticate", {
            loggedin: loggedin,
            error: error,
            profilePicture: "",
            page_name: pagename
        })
    }
});


router.get('/forgot', function (req, res){
    res.render('pages/forgotusername', {page_name:pagename, profilePicture:"", loggedin:loggedin})
})
router.post('/forgotuser', function (req, res){
    loggedin = "Register/Login";
    let error = "If account is valid, the username has been sent to the email";
    pagename="login"
    User.findOne({email: req.body.useremail}).then(async user => {
        console.log(user)
        await authenticateEmail(req, req.body.useremail, "Username: "+user["username"])
        res.render('pages/login', {loggedin: loggedin, profilePicture:profilePicture, error: error, page_name: pagename})
        })
        .catch(err => {res.render('pages/login', {loggedin: loggedin, profilePicture:profilePicture, error: error, page_name: pagename})}
        )
})
router.post('/forgotpass', function (req, res){
    loggedin = "Register/Login";
    let error = "If account is valid, a new password has been sent to the email";
    pagename="login"
    let r = (Math.random() + 1).toString(36).substring(7);
    User.findOneAndUpdate({username: req.body.userpass}, {password: encryptpass(r)}).then(async user => {
        console.log(user)
        await authenticateEmail(req, user["email"], "Password: "+r)
        res.render('pages/login', {loggedin: loggedin, profilePicture:profilePicture, error: error, page_name: pagename})
    })
        .catch(err => {res.render('pages/login', {loggedin: loggedin, profilePicture:profilePicture, error: error, page_name: pagename})}
        )
})

function captchaCheck(){

}

router.post('/auth', async function (request, response) {
    // Capture the input fields
    //create variable to collect the captcha response

    let password = request.body.password
    const resKey = request.body['g-recaptcha-response']
    const secret_key = "6LexqfgfAAAAANRRAMB7qvDRs63JuWoJLG3fDG56"
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${resKey}`
    let captchaResponse = false;

    await fetch(url, {
        method: 'post',
    })
        .then((response) => response.json())
        .then((google_response) => {
            if (google_response.success == true) {
                console.log("Captcha success");
                captchaResponse = true;
                //console.log(captchaResponse);

            } else {
                console.log("Captcha failed");
            }
        })
        .catch((error) => {
            return response.json({error})
        })
//But the user is logging in for the first time so there won't be any appropriate signed cookie for usage.
    if (request.session.auth) { // Tagged with req.session.auth, whether the tag has passed login validation
        response.statusCode = 200
        response.send('You are already authenticated')
    } else {
        User.findOne({username: request.body.username}).then(async user => {
            if (user) {
                currentUser = user
                if (!bcrypt.compareSync(password, user["password"]) || captchaResponse === false) {
                    loggedin = "Register/Login";
                    let error = "Username/Password or captcha Incorrect";
                    pagename = "login"
                    response.render('pages/login', {
                        loggedin: loggedin,
                        profilePicture: profilePicture,
                        error: error,
                        page_name: pagename
                    })
                } else {
                    request.session.email = user.email
                    request.session.username = user.username
                    emailtext = (Math.random() + 1).toString(36).substring(7);

                    await authenticateEmail(request, request.session.email, emailtext)
                    pagename = "login"
                    response.render("pages/authenticate", {
                        loggedin: loggedin,
                        error: "",
                        page_name: pagename
                    })
                }

            }
        })
    }
});


// Ensure the input fields exists and are not empty - EXTRA CHECKS REQUIRE

router.get('/logout', async (req, res, next) => {
    posts = await getPosts()
    pagename="index"
    if (req.session) {
        req.session.destroy() // Delete session
        res.clearCookie('session-id') // delete cookie
        loggedin = "Register/Login"
        profilePicture = "https://i.imgur.com/eMQHsNk.png";
        res.render("pages/index", {loggedin: loggedin, posts: posts, error:"", profilePicture:profilePicture,page_name:pagename})
    } else {
        var err = new Error('you are not logged in!')
        err.status = 403
        next(err)
    }
})

var description;
var title
router.post("/textedit", function (req, res){
    title =  req.body.description;
    description = req.body.description;
    pagename="createpost"
    res.render("pages/editimage", {loggedin:loggedin,page_name:pagename})
})
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
router.get("/deletepost", async function (req, res) {
    pagename="index"
    await getPosts().then(posts=>{
        if (req.session.username === posts[req.query.ide].author && req.session.auth === true) {
            currentPost = posts[req.query.ide]
            db.Post.deleteOne(currentPost).then(err => {
                if (err) {
                    console.log("Post %s deleted", currentPost["title"])
                    res.redirect("/index")
                }
            })
        } else {
            res.render("pages/index", {
                loggedin: loggedin,
                posts: posts,
                error: "CANNOT EDIT THAT POST AS YOU ARE NOT LOGGED IN AS THAT USER", profilePicture:profilePicture,
                page_name: pagename
            })
        }
    })
})
var upload = multer({
    storage:storage,
    fileFilter: (req, file, cb) => {fileFilter(req, file, cb)}
})


router.get("/editpost", async function (req, res) {
    pagename="index"
    posts = await getPosts().then(posts => {
        if (req.session.username === posts[req.query.id].author && req.session.auth === true) {
            currentPost = posts[req.query.id]
            res.render("pages/editpost", {
                loggedin: loggedin,
                title: currentPost["title"],
                description: currentPost["description"], profilePicture:profilePicture,page_name:pagename
            })
        } else {
            res.render("pages/index", {
                loggedin: loggedin,
                posts: posts,
                error: "CANNOT EDIT THAT POST AS YOU ARE NOT LOGGED IN AS THAT USER", profilePicture:profilePicture,
                page_name:pagename
            })
        }
    })
})

router.post("/editpostimage", upload.single("form"),async function (req, res) {
    const file = await uploadImage(req)
    await db.Post.findOneAndUpdate({currentPost}, {
        "author": req.session.username,
        "title": title,
        "img": {
            data: file.data,
            contentType: file.mimetype,
            filename: file.name,
            page_name:pagename
        },
        "description": description,
    })
    res.redirect("/index")
})

router.post('/signup', async function (request, response) {
    let username = request.body.username;
    let email = request.body.email;
    let password = request.body.password2;
    let confirm = request.body.confirm_password;
    if (confirm === password && username && await !checkUserExists(username, email)) {
        await User.create({
            "username": username,
            "email": email,
            "password": encryptpass(password)
        });
        request.session.email = email
        request.session.username = username
        request.session.auth = false // Logon success setting marked true
        response.statusCode = 200
        loggedin = "Register/Login";
        pagename="login"
        response.render("pages/authenticate", {
            loggedin: loggedin,
            error: "",
            page_name: pagename
        })
    }
    else{
        loggedin = "Register/Login";
        let error = "Cannot sign up with those details. The username or email may have been used";
        pagename = "login"
        response.render('pages/login', {
            loggedin: loggedin,
            profilePicture: profilePicture,
            error: error,
            page_name: pagename
        })
    }
})

router.post('/makepost', async function(req, res){
    pagename="createpost"
    authFn(req,res)
    description = req.body.description;
    title = req.body.title;
    res.render('pages/uploadimage', {loggedin: loggedin, profilePicture:profilePicture,page_name:pagename});

});
router.post('/makepostimage', upload.single('form'), async function(req, res){
    pagename="createpost"
    const file= await uploadImage(req)

    await db.Post.create({
        "author": req.session.username,
        "title": title,
        "img": {
            data: file.data,
            contentType: file.mimetype,
            filename: file.name
        },
        "description": description,
    })
    await getPosts().then(post=>res.render('pages/index', {loggedin: loggedin, posts:post, error:"", profilePicture:profilePicture,page_name:pagename}));


});

router.get('/createpost', function(req, res){
    pagename="createpost"

    if(authFn(req,res,next)) {
        loggedin = "Profile"
        profilePicture = "https://i.imgur.com/5jgN0Q9.png";
        res.render('pages/createpost', {loggedin: loggedin, title: "",
            description: "", profilePicture:profilePicture,    page_name:pagename
        });
    }
    else{
        res.render('pages/login', {loggedin: loggedin, error:"", profilePicture:profilePicture, page_name:pagename});

    }
});

module.exports = router;