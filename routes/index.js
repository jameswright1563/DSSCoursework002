const express = require('express');
const router  = express.Router();
//login page
router.get('/', (req,res)=>{
    res.render('pages/index');
})
//register page
router.get('pages/login', (req,res)=>{
    res.render('/views/pages/login');
})

import express from 'express';
import { postImage } from '../controllers/post.controller.js';
import upload from '../middlewares/upload.js'

const router = express.Router();
router.patch('/user/:_id', upload, postImage);

export default router;

module.exports = router;