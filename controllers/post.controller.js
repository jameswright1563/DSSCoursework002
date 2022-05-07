import Post from '../models/post.model.js';

export const postImage = async (req, res) => {
    const id = req.params._id;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);

    const path = req.file.path.replace(/\\/g, "/")

    await Post.findByIdAndUpdate(id, req.body = {img: "http://localhost:8080/" + path}, { new: true });
    res.json(postImage());
}