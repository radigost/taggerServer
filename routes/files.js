var express = require('express');
var router = express.Router();
const _ = require('lodash');
const btoa = require('btoa');
let fileUpload = require('express-fileupload');
router.use(fileUpload());
const fs = require('fs');
const path = require('path');
const user = require('../models/user');


router.get('/', async function (req, res, next) {
    const userPath = `../files/${user.path}`;
    fs.readdir(path.join(__dirname,userPath),async(err,files)=>{
        if (err) {
            console.error(err);
            next();
        }
        else {
            const resFiles = files.map((file)=>({
                Key:`${file}`,
                src:`localhost:3000/files/${user.path}/${file}`}));
            res.json(resFiles);
        }
    });
});





module.exports = router;
