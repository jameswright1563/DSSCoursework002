const express = require('express');
const auth = require("./auth.routes");
const next = require("next");
const db = require("../db");
const router  = express.Router();
const conn = db.mongoose.connection

//register page
router.get('pages/login', (req,res)=>{
    res.render('/views/pages/login');
})


module.exports = router;