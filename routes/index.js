const express = require('express');
const next = require("next");
const db = require("../db");
const router  = express.Router();
const path = require('path')
const bcrypt = require("bcryptjs");
const multer = require("multer");
const fs = require("fs");const {response} = require("express");
const User = db.user
//register page

var posts;
let currentUser;
var currentPost;
var profilePicture;

async function getPosts(){
    await db.Post.find({}).then(post => {
        posts= post
    })
    return posts
}
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
router.get('^/$|/index', async (req, res) => {
    posts = await getPosts().then(posts=>{
        if (authFn(req, res)) {
            console.log("User logged in: %s", req.session.username)
        }
        res.render('pages/index.ejs', {loggedin: loggedin, posts: posts, error:"", profilePicture: profilePicture})
    })


})

router.get('/getprofilepicture', function(req ,res){

});

router.get('/login', function(req, res){
    if(req.session.auth){
        res.render('pages/profile', {loggedin: loggedin, error:"",email:req.session.email, username:req.session.username , profilePicture:profilePicture});
    }else{
        res.render('pages/login', {loggedin: loggedin, posts:posts, error:"", profilePicture:profilePicture});
    }
});
router.post('/auth', function(request, response) {
    // Capture the input fields
    let cookie_Stuff=request.signedCookies.user
    let password = request.body.password
//But the user is logging in for the first time so there won't be any appropriate signed cookie for usage.
    if (request.session.auth) { // Tagged with req.session.auth, whether the tag has passed login validation
        response.statusCode = 200
        response.send('You are already authenticated')
    } else {
            User.findOne({username: request.body.username}).then(async user => {
                if (user) {
                    currentUser = user
                    if (!passVerify(password, user)) {
                        profilePicture = "https://i.imgur.com/eMQHsNk.png";
                        loggedin = "Register/Login";
                        let error = "Username/Password Incorrect";
                        response.render('pages/login', {loggedin: loggedin, error: error})
                    } else {
                        request.session.email = user.email
                        request.session.username = user.username
                        request.session.auth = true // Logon success setting marked true
                        response.statusCode = 200
                        profilePicture = "https://i.imgur.com/5jgN0Q9.png";
                        loggedin = "Profile";
                        await getPosts().then(post => {
                            response.render('pages/index', {
                                loggedin: loggedin,
                                posts: posts,
                                error: "",
                                profilePicture: profilePicture
                            })
                        });
                    }

                }
            })
            // }).catch(err => next(err))
        }});
    // Ensure the input fields exists and are not empty - EXTRA CHECKS REQUIRE

router.get('/logout', async (req, res, next) => {
    posts = await getPosts()

    if (req.session) {
        req.session.destroy() // Delete session
        res.clearCookie('session-id') // delete cookie
        loggedin = "Register/Login"
        profilePicture = "https://i.imgur.com/eMQHsNk.png";
        res.render("pages/index", {loggedin: loggedin, posts: posts, error:"", profilePicture:profilePicture})
    } else {
        var err = new Error('you are not logged in!')
        err.status = 403
        next(err)
    }
})

var description, image;
router.post("/textedit", function (req, res){
    title =  req.body.description;
    description = req.body.description;
    res.render("pages/editimage", {loggedin:loggedin})
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
                error: "CANNOT EDIT THAT POST AS YOU ARE NOT LOGGED IN AS THAT USER", profilePicture:profilePicture
            })
        }
    })
})
var upload = multer({
    storage:storage,
    fileFilter: (req, file, cb) => {fileFilter(req, file, cb)}
})
function fileFilter(req,res,cb) {
    if(file.mimetype === "image/jpeg"||file.mimetype ==='image/png'||file.mimetype ==='image/webp'||file.mimetype==='image/jpg'){

        cb(null, true);
    }

    else{
        cb(null,false);
    }
}

router.get("/editpost", async function (req, res) {
    posts = await getPosts().then(posts => {
        if (req.session.username === posts[req.query.id].author && req.session.auth === true) {
            currentPost = posts[req.query.id]
            res.render("pages/editpost", {
                loggedin: loggedin,
                title: currentPost["title"],
                description: currentPost["description"], profilePicture:profilePicture
            })
        } else {
            res.render("pages/index", {
                loggedin: loggedin,
                posts: posts,
                error: "CANNOT EDIT THAT POST AS YOU ARE NOT LOGGED IN AS THAT USER", profilePicture:profilePicture
            })
        }
    })
})

router.post("/editpostimage", upload.single("form"),async function (req, res) {
    if (!req.files) {
        console.log("No files were uploaded")
    }
    req.on('data', (data) => {
        console.log(data.toString());
    });
    const file = req.files.image;

    const paths = path.join(__dirname, '..','uploads', String(file.name));
    await file.mv(paths, (err) => {
        if (err) {
            console.log("success");
        }
    });
    await console.log(fs.readFileSync(paths))
    await db.Post.findOneAndUpdate({currentPost}, {
        "author": req.session.username,
        "title": title,
        "img": {
            data: file.data,
            contentType: file.mimetype,
            filename: file.name
        },
        "description": description,
    })
    res.redirect("/index")
})
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
router.post('/signup', async function (request, response) {
    let username = request.body.username;
    let email = request.body.email;
    let password = request.body.password2;
    let confirm = request.body.confirm_password;
    if (confirm === password && username && !checkUserExists(username)) {
        await User.create({
            "username": username,
            "email": email,
            "password": encryptpass(password)
        });
        request.session.email = email
        request.session.username = username
        request.session.auth = true // Logon success setting marked true
        response.statusCode = 200
        loggedin = "Profile";
        profilePicture = "https://i.imgur.com/5jgN0Q9.png";
        await getPosts().then(post=>response.render('pages/index', {loggedin: loggedin, posts: post, error:""}))
    }
})

router.post('/makepost', async function(req, res){
    authFn(req,res)
    description = req.body.description;
    title = req.body.title;
    res.render('pages/uploadimage', {loggedin: loggedin, profilePicture:profilePicture});

});
router.post('/makepostimage', upload.single('form'), async function(req, res){
    if(!req.files)
    {
        console.log("No files were uploaded")
    }
    req.on('data', (data) => {
        console.log(data.toString());
    });
    const file = req.files.image;

    const paths = path.join(__dirname, '..','uploads', String(file.name));
    await file.mv(paths, (err) => {
        if (err) {
            console.log("success");
        }
    });

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
    await getPosts().then(post=>res.render('pages/index', {loggedin: loggedin, posts:post, error:"", profilePicture:profilePicture}));


});

router.get('/createpost', function(req, res){
    if(authFn(req,res,next)) {
        loggedin = "Profile"
        profilePicture = "https://i.imgur.com/5jgN0Q9.png";
        res.render('pages/createpost', {loggedin: loggedin, title: "",
            description: "", profilePicture:profilePicture});
    }
    else{
        res.render('pages/login', {loggedin: loggedin, error:"", profilePicture:profilePicture});

    }
});
module.exports = router;