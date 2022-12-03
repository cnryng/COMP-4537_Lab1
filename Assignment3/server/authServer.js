const express = require("express")
const cookieParser = require('cookie-parser');
const axios = require('axios');
const { errorHandler } = require("./errorHandler.js")
const { asyncWrapper } = require("./asyncWrapper.js")
const dotenv = require("dotenv")
dotenv.config();
const userModel = require("./pokeUserModel.js")
const { connectDB } = require("./connectDB.js")
const { PokemonDbError, PokemonBadRequest } = require("./errors");

const app = express()

const start = asyncWrapper(async () => {
    await connectDB();
    app.listen(process.env.authServerPORT, (err) => {
        if (err)
            throw new PokemonDbError(err)
        else
            console.log(`Server is running on port: ${process.env.authServerPORT}`);
    })
})
start()

app.use(express.json())
app.use(cookieParser())

app.get('/', asyncWrapper(async (req, res) => {
    const { token } = req.cookies;
    if (!token) {
        res.send("<h1>Welcome. Please register or login.</h1>" +
            "<form action='/login' method='GET'>" +
            "<button type='submit'>Login Here</button>" +
            "</form>" +
            "<form action='/register' method='GET'>" +
            "<button type='submit'>Register Here</button>" +
            "</form>"
        )
    } else {
        //const verified = jwt.verify(token, process.env.TOKEN_SECRET) // nothing happens if token is valid
        const user = await userModel.findOne({ token });
        if(!user) {
            throw new PokemonBadRequest("Token no longer valid");
        }
        const pokemonData = await axios({
            method: 'get',
            url: 'http://localhost:6000/api/v1/pokemons',
            headers: {
                'Access-Control-Allow-Origin': '*',
                "token": token
            }
        })
        console.log(pokemonData);
        res.redirect("http://localhost:3000")
        // res.send("<h1>Successfully logged in</h1>" +
        //     "<form action='/logout' method='POST'>" +
        //     "<button type='submit'>Log out</button>" +
        //     "</form>");
    }
}))

app.get('/register', (req, res) => {
    res.send(
        "<form action='/register' method='POST'>" +
            "<input type='text' name='username' value='' placeholder='username'>" +
            "<input type='password' name='password' value='' placeholder='password'>" +
            "<input type='text' name='email' value='' placeholder='email'>" +
            "<label>Is an Admin?</label>" +
            "<input type='checkbox' name='isAdmin'>" +
            "<button type='submit'>Register</button>" +
        "</form>");
})

app.get('/login', (req, res) => {
    res.send(
        "<form action='/login' method='POST'>" +
        "<input type='text' name='username' value='' placeholder='username'>" +
        "<input type='password' name='password' value='' placeholder='password'>" +
        "<button type='submit'>Login</button>" +
        "</form>");
})

app.use(express.urlencoded());

const bcrypt = require("bcrypt")
app.post('/register', asyncWrapper(async (req, res) => {
    console.log(req.body)
    const { username, password, email } = req.body
    req.body.isAdmin = req.body.isAdmin === 'on'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const userWithHashedPassword = { ...req.body, password: hashedPassword }

    const user = await userModel.create(userWithHashedPassword)
    console.log(user)
    //res.send(user)
    res.redirect("/login")
}))

const jwt = require("jsonwebtoken")
app.post('/login', asyncWrapper(async (req, res) => {
    const { username, password } = req.body
    const user = await userModel.findOne({ username })
    if (!user) {
        throw new PokemonBadRequest("User not found")
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
        throw new PokemonBadRequest("Password is incorrect")
    }

    // Create and assign a token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET)

    await userModel.updateOne({ username }, { $set: { token }})

    //res.header('auth-token', token)
    console.log(token)

    res.cookie('token', token)

    res.redirect("/")
}))

app.post('/logout', asyncWrapper(async (req, res) => {
    const { token } = req.cookies
    await userModel.updateOne( { token }, { $set: { token: null }})
    res.clearCookie("token")
    res.redirect("/")
}))


app.use(errorHandler)
