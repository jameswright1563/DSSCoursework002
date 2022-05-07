const upload = require("../middlewares/upload");
const express = require("express");
const router = express.Router();

router.post("/makepost1", upload.single("img"), async (req, res) => {
    if (req.file === undefined) return res.send("you must select a file.");
    const imgUrl = `http://localhost:8080/file/${req.file.filename}`;
    return res.send(imgUrl);
});

module.exports = router;