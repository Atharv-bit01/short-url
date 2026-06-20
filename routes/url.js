const express=require('express');
const{handlegeneratenewshortURL, handleGetAnalytics}=require('../controllers/url')
const router=express.Router();


console.log(handlegeneratenewshortURL);
router.post('/',handlegeneratenewshortURL)
router.get('/analytics/:shortId', handleGetAnalytics)

module.exports= router;
