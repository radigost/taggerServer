const express = require('express');
const router = express.Router();
const axios = require('axios');
const credentials = require('../credentials.json').Shutterstock;


/* GET home page. */
router.get('/', async function (req, res) {
  const findShutterstockImages = async (query, page = 1, category='13') => {
    
    let res = { data: [] };
    try {
      res = await axios.get('https://api.shutterstock.com/v2/images/search',{
        auth: {
          username: credentials.client_id,
          password: credentials.client_secret,
        },
        params: {
          query,
          page,
          sort:'relevance',
          category,
        },
      });
    } catch (err) {
      console.log(err);
    }
    return res.data;
  };
  const result = await findShutterstockImages(req.params.query,req.params.page,req.params.category);
  res.json(result.data);
});

router.get('/:id',async function(req,res){
  const getImageInfo = async (id) => {
    const res = await axios.get(`https://api.shutterstock.com/v2/images/${id}`,{
      auth: {
        username: credentials.client_id,
        password: credentials.client_secret,
      },
      headers:{
        'Accept-Language':'en-EN'
      }
    });
    return res.data;
  }
  const result = await getImageInfo(req.params.id);
  res.json(result);
});

module.exports = router;
