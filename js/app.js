const db = require("../db");
var posts
async function getPosts(){
    await db.Post.find({}).then(post => {
        posts=post
    }).catch()
}
function likedislike(x) {
    x.classList.toggle("fa-thumbs-down");
    console.log("yes")
    getPosts().then(    db.Post.findOneAndUpdate({title:test[i]["title"], description:test[i]["description"]},{likes:test[i]["likes"]+=1}))
}
const searchBar = document.getElementById('searchBar');

searchBar.addEventListener('keyup', (e) => {
    const searchString = e.target.value.toLowerCase();

    const filteredPosts = posts.filter((post) => {
        return (
            post.title.toLowerCase().includes(searchString) ||
            post.description.toLowerCase().includes(searchString)
        );
    });
    document.getElementById("divpost")
    document.createTextNode(searchString)
})

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
document.getElementById("likeButton1").addEventListener("click", function(){
    this.classList.toggle("fa-thumbs-down");
});
