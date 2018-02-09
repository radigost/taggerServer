var express = require('express');
var router = express.Router();
const _ = require('lodash');
const btoa = require('btoa');
let fileUpload = require('express-fileupload');
router.use(fileUpload());
const fs = require('fs');
const path = require('path');
const user = require('../models/user');



const AWS = require('aws-sdk');
const credentials = require('../credentials.json').AWS;

AWS.config.credentials = new AWS.Credentials(credentials);
AWS.config.region = credentials.region;

const s3 = new AWS.S3({
    params: {Bucket: credentials.Bucket},
});
const rekognition = new AWS.Rekognition();


// const file = fs.readFileSync('files/user1/1d654de28e9bb92be0776b35157b1560.jpg');
// const params = {
//     Image: {
//         Bytes:file,
//     },
//     MaxLabels: 123,
//     MinConfidence: 70,
// };
// rekognition.detectLabels(params, (err, data) => {
//     if (err) {
//         console.error(err);
//     }
//     else {
//         console.log(data);
//     }
// });



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
                src:`/files/${file}`}));
            res.json(resFiles);
        }
    });
});





module.exports = router;
