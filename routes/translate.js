const express = require('express');
const router = express.Router();
const Translate = require('@google-cloud/translate');
const projectId = 'radigost-157806';
const translate = new Translate({projectId});

router.get('/', function (req, res) {

    // The text to translate
    const text = req.query.text;
    // The target language
    const target = 'ru';

    // Translates some text into Russian
    translate
    .translate(text, target)
        .then(results => {
            const translation = results[0];

            console.log(`Text: ${text}`);
            console.log(`Translation: ${translation}`);
            res.json({translation});
        })
        .catch(err => {
            console.error('ERROR:', err);
    });
})



module.exports = router;
