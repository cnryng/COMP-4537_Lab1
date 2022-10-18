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

//difference between middleware and route callback is that middleware has a third argument "next", which is used to give control to the next function
app.get('/callbacks', (req, res, next) => {
    console.log("first callback");
    next();
}, (req, res) => {
    console.log("second callback");
    res.send("finished");
})


var arr = [];
function sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}
//can have multiple handlers with same route; will get called in order
//next() will execute next the callback; if next() is called in the last middleware, it executes it's own code first,
// then all the other middlewares with remaining code.
app.get('/users', (req, res, next) => {
    console.log("1");
    arr.push(1)
    next()
    sleep(1000); //will get executed after succeeding middleware (and further middlewares if next() is called in them)
    console.log("5")
    arr.push(5)
    //res.send("users2")
}, (req, res, next) => {
    console.log("2");
    arr.push(2)
    // res.send("users2")
    next()
    // console.log("6");
    // arr.push(6)
}, (req, res, next) => {
    console.log("3");
    arr.push(3)
    next()
})

app.get('/users', (req, res, next) => {
    console.log("4");
    arr.push(4)
    next(); //doesn't do anything b/c this is the last middleware
    res.send(arr); //notice how arr is [1,2,3,4] instead of [1,2,3,4,5].
    // This is b/c this line is executed before going back to execute the remaining code in the first middleware
})

app.get('/returnNext', (req, res, next) => {
    console.log("1");
    return next();
    console.log("3"); //doesn't get executed b/c return next() will not return control to this function after succeeding middleware terminates
})
app.get('/returnNext', (req, res, next) => {
    console.log("2");
})
