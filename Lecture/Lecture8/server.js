const express = require('express');
const app = express();
app.listen(5000, () => console.log('Server is listening on port 5000'));

//Note that error handling middlewares need to have their app.use() call after the route definition
app.get('/', async (req, res, next) => {
    try {
        await new Promise(resolve => {
            throw new Error('Broken');
            setTimeout(() => { //will never reach here b/c Error is thrown first
                resolve()
            }, 1000);
        });
        res.send('Hello World');
    } catch (err) {
        console.log("catch");
        next(err)
    }
});

app.use("/", (err, req, res, next) => {
    console.log("my error handler");
    // console.error(err.stack)
    res.status(500).send('Something broke!')
})

//Will trigger the default Express error handler (just logs to stderr) b/c there is no error handling middleware for this route
app.get('/test', async (req, res, next) => {
    try {
        await new Promise(resolve => {
            throw new Error('Broken')
            setTimeout(resolve, 1000)
            res.send('Hello World');
        });
    } catch (err) {
        next(err);
        res.send("I don't care about the error. I still want to send this response");
    }
});

