const mongoose = require('mongoose')
const db = require("./models");
const Role = db.role;

function connection(){
    db.mongoose
        .connect(`mongodb+srv://js_user:4488@cluster0.jp9fi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then(() => {
            console.log("Successfully connect to MongoDB.");
            initial();
        })
        .catch(err => {
            console.error("Connection error", err);
            process.exit();
        });
    return db
}

function initial() {
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            new Role({
                name: "user"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("added 'user' to roles collection");
            });
            new Role({
                name: "moderator"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("added 'moderator' to roles collection");
            });
            new Role({
                name: "admin"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("added 'admin' to roles collection");
            });
        }
    });
}

module.exports = connection()