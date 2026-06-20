const express=require("express");
require("dotenv").config();
const cors = require("cors");
const{connectToMongoDB}= require('./connect')
const urlRoute= require('./routes/url');
const URL=require('./models/url');
const app=express();
const PORT = process.env.PORT || 8001; 
app.use(cors());
app.use(express.json());
app.use(express.json());
app.use("/url", urlRoute);



app.get("/:shortId", async (req, res) => {
    const entry = await URL.findOneAndUpdate(
        {
            shortId: req.params.shortId,
        },
        {
            $push: {
                visitHistory: {
                    timestamp: Date.now(),
                },
            },
        }
    );

    if (!entry) {
        return res.status(404).send("Short URL not found");
    }

    return res.redirect(entry.redirectURL);
});

connectToMongoDB(process.env.MONGO_URL)
.then(()=> console.log('Mongodb Connected'))
.catch((err) => console.log(err));

app.use("/url", urlRoute);
app.listen(PORT, () => console.log(`Server Started at PORT : ${PORT}`));
