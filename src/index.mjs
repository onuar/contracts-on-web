import express from "express";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

app.get("/hi", (req, res) =>
    res.json({ message: 'hello world!' })
);

const server = app.listen(process.env.PORT || 8088, () => {
    console.log(`Listening on port ${server.address().port}.`);
});