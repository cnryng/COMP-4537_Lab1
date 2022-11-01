const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');

const jwtSecret = "unicorns are awesome and so are rainbows";

app.use(express.json());
app.use(session({
    secret: 'hello world', //random unique key to authenticate session
    resave: true, //enable session to be stored back to session store
    saveUninitialized: true //allow uninitialized session to be sent back to store; uninitialized means session is created but unmodified
}))

app.listen(5000, () => {
    console.log('Server is running on port 5000');
})


app.get('/login', (req, res) => {
    res.send("<form action='/login' method='POST'><input type='text' name='username' value='admin' placeholder='username'><input type='password' name='password' value='1234' placeholder='password'><button type='submit'>Login</button></form>");
})

app.use(express.urlencoded());

app.post('/login', (req, res) => {
    console.log(req.body);
    if (req.body.username === 'admin' && req.body.password === '1234') {
        // res.cookie('auth', 'true');
        // req.session.auth = 'true';

        //res.json({ status: 'success', token: jwt.sign({ username: 'admin' }, jwtSecret) });
        console.log('Login success');
        req.session.token = jwt.sign({ username: 'admin' }, jwtSecret);
        res.redirect('/admin'); // redirect to admin page
    }
    else {
        res.send('Invalid username or password');
    }
})

app.get('/admin', (req, res) => {
    // const { auth } = req.cookies;
    // const { auth } = req.session;
    // if (auth && auth === 'true') {
    //   res.send('Welcome to the protected route, logged in user');
    // }
    // else {
    //   res.redirect('/login');
    // }
    jwt.verify(req.session.token, jwtSecret, function (err, decoded) {

        if (!err) {
            res.send('Welcome to the protected route, logged in user');
        }
        else {
            // res.send('Invalid token');
            console.log('Invalid token');
            // res.redirect('/login');
            res.json('Invalid token')
        }
    })

})
