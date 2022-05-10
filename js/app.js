const db = require("../db");
var test
async function getPosts(){
    await db.Post.find({}).then(post => {
        test=post
    })
}
function likedislike(x) {
    x.classList.toggle("fa-thumbs-down");
    console.log("yes")
    getPosts().then(    db.Post.findOneAndUpdate({title:test[i]["title"], description:test[i]["description"]},{likes:test[i]["likes"]+=1}))
}

function profilePicture(x){
    if(x.src === "https://i.imgur.com/eMQHsNk.png"){
        x.style.display  = "none";
    }else{
        x.style.display = "inline";
    }
}

function myFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}

function mongoose() {
    const {MongoClient, ServerApiVersion} = require('mongodb');
    const dbURI = "mongodb+srv://js_user:4488@cluster0.jp9fi.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(dbURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverApi: ServerApiVersion.v1
    });
    client.connect(err => {
        const collection = client.db("test").collection("blogs");
        // perform actions on the collection object
        client.close();
    });

}

