const mongoose = require("mongoose");
const Post = mongoose.model(
    "Post",
    new mongoose.Schema({
        author: String,
        title: String,
        img: {
            data: Buffer,
            contentType: String,
            filename: String
        },
        description: String,
        roles: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role"
        }],


}
),"posts");
module.exports = Post