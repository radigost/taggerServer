const express = require('express');
const router = express.Router();
const axios = require('axios');
const credentials ={
    "client_id": process.env.SHUTTERSTOCK_CLIENT_ID,
    "client_secret": process.env.SHUTTERSTOCK_SECRET,
}

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
          image_type:'photo',
          per_page:40
        },
      });
    } catch (err) {
      console.log(err);
    }
    return res.data;
  };
  const result = await findShutterstockImages(req.query.query,req.query.page,req.query.category);
  res.json(result.data);
});


router.get('/categories', async function (req, res) {
  const getShutterstockCategories = async () => {
    let res = { data: [] };
    try {
      res = await axios.get('https://api.shutterstock.com/v2/images/categories',{
        auth: {
          username: credentials.client_id,
          password: credentials.client_secret,
        },
      });
    } catch (err) {
      console.log(err);
    }
    return res.data;
  };
  const result = await getShutterstockCategories();
  res.json(result.data);
});

router.get('/collections', async function (req, res) {
  const getShutterstockCollections = async () => {
    let res = { data: [] };
    try {
      res = await axios.get('https://api.shutterstock.com/v2/images/collections',{
        auth: {
          username: credentials.client_id,
          password: credentials.client_secret,
        },
      });
    } catch (err) {
      console.error(err);
    }
    return res.data;
  };
  const result = await getShutterstockCollections();
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
