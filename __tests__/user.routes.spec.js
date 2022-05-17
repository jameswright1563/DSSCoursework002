const mockingoose = require("mockingoose");
const User = require("../db").user;
const model = require("../models/user.model");

const {checkUserExists} = require('../routes/user.routes')
function fail(message) {
    throw new Error(message);
}
test("Testing checkUserExists", async () =>{
    const doc = {
        username:"abc",
        email:"abc@gmail.com",
        password:"129846q38w47r890fdsd86"
    }
    mockingoose(model).toReturn(doc, 'find')
    expect(await checkUserExists(doc["username"], doc["email"])).toBeTruthy()

    try {
        model.find({"email": doc["email"]}).exec((err, res) => {
            console.log(res)
            expect(res).toMatchObject(doc)

        })
    }catch (e){
        console.log("No")
        fail(e)
    }

})