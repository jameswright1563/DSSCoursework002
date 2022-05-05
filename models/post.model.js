const mongoose = require("mongoose");
const Post = mongoose.Model(
    "Post",
    new mongoose.Schema({
        author: String,
        title: String,
        image: File,
        description: String,
        roles: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role"
        }]

}
));
module.exports(Post)