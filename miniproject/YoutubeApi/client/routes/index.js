const express = require('express');
const axios = require('axios');

const router = express.Router();
const URL = 'http://localhost:8000/v';
axios.defaults.headers.origin = 'http://localhost:4000';

router.get('/result', async(req, res, next) => {
    try {
        const result = await axios.get(`${URL}/result`);
        res.json(result.data);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/', (req,res) => {
    res.render('../views/main.html');
    
});

module.exports = router;