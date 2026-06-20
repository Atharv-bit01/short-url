const { nanoid}=require('nanoid');
const URL=require('../models/url');

async function handlegeneratenewshortURL(req,res){
    const body= req.body;
    if(!body.url) return res.status(400).json({error: 'URL is required'});
    const shortID= nanoid(8);
   await URL.create({
    shortId: shortID,
    redirectURL: body.url,
    visitHistory: [],
});

    return res.json(
        {
            shortUrl: `${process.env.BASE_URL}/${shortID}`
        }
    );

}

async function handleGetAnalytics(req,res) {
    const shortId= req.params.shortId;
    const result= await URL.findOne({ shortId }); 
    return res.json({
        totalClicks: result.visitHistory.length, 
        analytics:result.visitHistory, });
}
module.exports={
    handlegeneratenewshortURL,
    handleGetAnalytics,
 }
