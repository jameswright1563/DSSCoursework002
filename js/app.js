function likedislike(x) {
    x.classList.toggle("fa-thumbs-down");
}

function testFunction(){
    console.log("Test Function")
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


