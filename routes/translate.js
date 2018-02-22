const express = require('express');
const router = express.Router();
const Translate = require('@google-cloud/translate');
const projectId = 'radigost-157806';
const translate = new Translate({projectId});

router.get('/', function (req, res,next) {
    let text;
    // The text to translate
    if (req.query.text){
        text = Array.from(req.query.text);
    }
    
    // const text = req.query.text;
    // The target language
    const target = 'ru';


    // Translates some text into Russian
    translate
    .translate(text, target)
        .then(results => {
            const translation = results[0];
            console.log(results)
            console.log(`Text: ${text}`);
            console.log(`Translation: ${translation}`);
            res.json({translation});
        })
        .catch(err => {
            console.error('ERROR:', err);
            next();
    });
})


module.exports = router;
