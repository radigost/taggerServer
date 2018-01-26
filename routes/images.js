const fileUpload = require('express-fileupload');
const _ = require('lodash');
const btoa = require('btoa');
const express = require('express');
const router = express.Router();
router.use(fileUpload());

const AWS = require('aws-sdk');
const credentials = require('../credentials.json').AWS;
const s3 = new AWS.S3({
    params: {Bucket: credentials.Bucket},
});
const rekognition = new AWS.Rekognition();


AWS.config.credentials = new AWS.Credentials(credentials);
AWS.config.region = credentials.region;


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
};


router.get('/', async function (req, res) {
    const credentials = require('../credentials.json').AWS;
    const params = {
        Bucket: credentials.Bucket,
    };
    const data = await s3.listObjects(params).promise();
    const files = data.Contents;
    const promises = _.map(files, file => getImage(file));
    const result = await Promise.all(promises);
    res.json(result);
});

router.get('/:name', async function (req, res) {
    try {
        const image = await retrieveImage(req.params.name);
        const b64encoded = btoa(Uint8ToString(image));
        const result = {
            image,
            Key: req.params.name,
            src: `data:image/jpeg;base64,${b64encoded}`,
        };
        res.json(result)
    }
    catch (err) {
        console.error(err);
        res.json(err);
    }
});

router.get('/:name/rekognize', async function (req, res) {
    const params = {
        Image: {
            S3Object: {
                Bucket: credentials.Bucket,
                Name: req.params.name,
            },
        },
        MaxLabels: 123,
        MinConfidence: 70,
    };
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

router.post('/', async function (req, res) {
    const file = req.files.file;
    const params = {
        Key: file.name,
        Body: file.data,
        ACL: 'public-read-write',
    };
    let data;

    try {
        data = await s3.upload(params).promise();
        res.json(data);
    }
    catch (err) {
        res.status(500);
        res.render('error', {error: err})
    }
});

router.delete('/:key', async function (req, res) {
    const params = {
        Bucket: credentials.Bucket,
        Key: req.params.key,
    };
    const result = await  s3.deleteObject(params)
        .promise();
    res.json(result);
});


module.exports = router;