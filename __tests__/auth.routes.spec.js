const {authFn, authenticateEmail, encryptpass} = require('../routes/auth.routes')
const {mock} = require('nodemailer')
const bcrypt = require('bcryptjs')
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
    test("Testing encryption", () =>{
        const pass = "Song982.!"
        const encrypt = encryptpass(pass)
        expect(bcrypt.compareSync(pass, encrypt)).toBe(true)
    })
    test("Testing email", async () =>{
        await authenticateEmail("", "jameswright1563@gmail.com", "sadlkh")
        const sentEmails = mock.getSentMail()

        expect(sentEmails.length).toBe(1)
        expect(sentEmails[0].to).toBe("jameswright1563@gmail.com")
    })

})