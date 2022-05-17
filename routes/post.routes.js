const path = require('path');

const db = require("../db");
var posts;
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

module.exports = {getPosts, fileFilter, uploadImage}