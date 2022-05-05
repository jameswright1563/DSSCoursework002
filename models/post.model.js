const mongoose = require("mongoose");
const Post = mongoose.model(
    "Post",
    new mongoose.Schema({
        author: String,
        title: String,
        image: {
            data: Buffer,
            contentType: String
        },
        description: String,
        roles: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role"
        }]

}
));
module.exports = Post