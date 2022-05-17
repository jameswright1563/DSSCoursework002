const {authFn, getPosts,authenticateEmail, encryptpass, fileFilter, checkUserExists} = require('./auth.routes')
const mockingoose = require('mockingoose');
const bcrypt = require('bcryptjs')
const db = require('../db')
describe('Test Handlers', function () {
    test('Test authfn', () => {
        const req = {session: {auth: false}}
        const res = {}
        data = authFn(req, res)
        expect(data).toEqual(false)
    });
    test('Test authfn for true', () => {
        const req = {session: {auth: true}}
        const res = {}
        data = authFn(req, res)
        expect(data).toEqual(true)
    });
    test('Test getposts',  () => {
            mockingoose(db.Post).toReturn([
                {
                    title: "ABC",
                    author: "jameswright1563",
                    description: "ABC"
                }
            ], 'find');
            const results = getPosts();
            console.log(results)
            expect(results.length).toEqual(1)
            expect(results[0].title).toBe("ABC")
        }
    );
    test("Testing encryption", () =>{
        const pass = "Song982.!"
        const encrypt = encryptpass(pass)
        expect(bcrypt.compareSync(pass, encrypt)).toBe(true)
    })
})