var express = require('express');
var router = express.Router();
const _ = require('lodash');
const btoa = require('btoa');

let fileUpload = require('express-fileupload');
router.use(fileUpload());
const fs = require('fs');
const path = require('path');
const user = require('../models/user');
const userPath = `../files/${user.path}`;
var ip = require('ip');

const host = ip.address() // my ip address

const AWS = require('aws-sdk');
const credentials = {
    "accessKeyId": process.env.AWS_ACCESS_KEY_ID,
    "secretAccessKey": process.env.AWS_SECRET_ACCESS_KEY,
    "region": process.env.AWS_REGION,
    "Bucket": process.env.AWS_BUCKET,
};
AWS.config.credentials = new AWS.Credentials(credentials);
AWS.config.region = credentials.region;

const s3 = new AWS.S3({
    params: {Bucket: credentials.Bucket},
});
const rekognition = new AWS.Rekognition();


const retrieveImage = async (key) => {
    const params = {
        Key: key,
        Bucket: credentials.Bucket,
    };
    const data = await s3.getObject(params).promise();
    return data.Body;
};

const Uint8ToString = (u8a) => {
    const CHUNK_SZ = 0x8000;
    const c = [];
    for (let i = 0; i < u8a.length; i += CHUNK_SZ) {
        c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)));
    }
    return c.join('');
};

const getImage = async (image)=> {
    const retrievedImage = await retrieveImage(image.Key);
    const b64encoded = btoa(Uint8ToString(retrievedImage));
    image.src = `data:image/jpeg;base64,${b64encoded}`;
    return image;
}


/* GET home page. */
router.get('/', async function (req, res, next) {
    if (!fs.existsSync(path.join(__dirname,userPath))){
        try {
            fs.mkdirSync(path.join(__dirname,'../files'));
            fs.mkdirSync(path.join(__dirname,userPath));
          } catch (err) {
              console.error(err);
            if (err.code !== 'EEXIST') throw err
          }
    }
    fs.readdir(path.join(__dirname,userPath),async(err,files)=>{
        if (err) {
            console.error(err);
            next();
        }
        else {
            const resFiles = files.map((file)=>({
                Key:`${file}`,
                src:`http://${host}:3000/files/${file}`})
            );
            res.json(resFiles);
        }
    });
});

router.get('/:name', async function (req, res, next) {
    try {
        const resFile = {
            Key:`${req.params.name}`,
            src:`http://${host}:3000/files/${req.params.name}`
        };
        res.json(resFile);
    }
    catch (err) {
        console.error(err);
        res.json(err);
    }
});

router.get('/:name/rekognize', async function (req, res, next) {
    const file = fs.readFileSync(path.join(__dirname,userPath,req.params.name));
    const stat = fs.statSync(path.join(__dirname,userPath,req.params.name));
    const MAX_SIZE_WITHOUT_BUCKET =  5242880;  
    const params = {
        MaxLabels: 123,
        MinConfidence: 70,
    };

    if(stat.size<MAX_SIZE_WITHOUT_BUCKET){
        params.Image= {
            Bytes:file
        };
    }
    else{
        const par = {
            Key: req.params.name,
            Body: file,
            ACL: 'public-read-write',
        };
        data = await s3.upload(par).promise();
        
        params.Image =  {
            S3Object:{
                Bucket: credentials.Bucket,
                Name: req.params.name,
            }
        };
    }
    rekognition.detectLabels(params, (err, data) => {
        if (err) {
            res.status(500);
            res.render('error', {error: err})
        }
        else {
            res.json(data.Labels);
        }
    });
   
});

router.post('/', async function (req, res, next) {
    let data;
    try {
        const file = req.files.file;
        fs.writeFile(path.join(__dirname,userPath,file.name), file.data, (err) => {  
            if (err) {
                console.error(err);
                throw err;
            }
            res.json({ Key: file.name});
        });
    }
    catch (err) {
        res.status(500);
        res.render('error', {error: err})
    }
});

router.delete('/:key', async function (req, res, next) {
    const params = {
        Bucket: credentials.Bucket,
        Key: req.params.key,
    };
    try{
        const result = await  s3.deleteObject(params)
        .promise();
    fs.unlinkSync(path.join(__dirname,userPath,req.params.key));
    res.json(result);
    }
    catch(err){
        console.error(err);
        res.status(500);
        res.render('error', {error: err})
    }
    
});


module.exports = router;
