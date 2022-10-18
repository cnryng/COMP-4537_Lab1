//middleware are functions that occur between the request and response cycle

const express = require('express');
const app = express();
app.listen(5000);

const logger = (req, res, next) => {
    console.log("First middleware");
    console.log("Time:", Date.now());
    next(); //with no params, will move control to next function in the route
}

const urlReqLogger = (req, res, next) => {
    console.log("Second middleware");
    console.log(req.originalUrl);
    next();
}

// app.get('/', logger, (req, res) => {
//     res.send("home");
// }, logger) // notice that if logger is ordered after the other callback, it won't be called because the previous callback didn't call next() to switch control

app.use(logger); //can use app.use to assign middleware to a path
app.use(urlReqLogger);
app.get('/', (req, res) => {
    res.send("home");
});

app.get('/other', (req, res) => {
    res.send("other");
});

app.get('/callbacks', (req, res, next) => {
    console.log("first callback");
    next();
}, (req, res) => {
    console.log("second callback");
    res.send("finished");
})
