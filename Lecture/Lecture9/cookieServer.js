const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

app.listen(5000, () => console.log('Server is listening on port 5000'));

app.use(cookieParser());
app.get('/', (req, res) => {
    res.cookie("sea", "blue"); //can set key-value of a cookie
    res.cookie("land", "green", { httpOnly: true, maxAge: 6000 }); //third parameter is to add options
    //httpOnly: flag cookie as only readable on server (can't console.log() it on client side)
    //maxAge: expiry time of cookie in milliseconds
    console.log(req.cookies);
    res.send('Hello World');
})

app.get('/login', (req, res) => {
    res.send("<form action='/login' method='POST'>" +
            "<input type='text' name='username' value='admin' placeholder='username'>" +
            "<input type='password' name='password' value='1234' placeholder='password'>" +
            "<button type='submit'>Login</button>" +
        "</form>"
    );
})

//send credentials via post req.body using form-urlencoded
app.use(express.urlencoded());
app.post('/login', (req, res) => {
    console.log(req.body);
    if (req.body.username === 'admin' && req.body.password === '1234') {
        res.cookie('auth', 'true');
        console.log('Login success');
        res.redirect('/admin'); // redirect to admin page
    }
    else {
        res.send('Invalid username or password');
    }
})

app.get('/admin', (req, res) => {
    const { auth } = req.cookies;
    if (auth && auth === 'true') {
        res.send('Welcome to the protected route, logged in user');
    }
    else {
        res.redirect('/login');
    }
})
