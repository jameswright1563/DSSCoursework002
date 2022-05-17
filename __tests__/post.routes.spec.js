const mockingoose = require("mockingoose");
const model = require('../models/post.model')
const {getPosts} = require("../routes/post.routes");
test('Test getposts',  async () => {
    const doc = {
        title: "ABC",
        author: "jameswright1563",
        description: "ABC"
    }
        mockingoose(model).toReturn(doc, 'find');
    await getPosts()

    const  results = await model.find()
        console.log(results)
        expect(results).toMatchObject(doc)
    }
);