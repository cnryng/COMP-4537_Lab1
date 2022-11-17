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
        res.send("Welcome. Please register or login.")
    }
    try {
        //const verified = jwt.verify(token, process.env.TOKEN_SECRET) // nothing happens if token is valid
        const user = await userModel.findOne({ token })
        res.send("<h1>Successfully logged in</h1>" +
            "<form action='/logout' method='POST'>" +
            "<button type='submit'>Log out</button>" +
            "</form>");
        //const pokemonData = await axios.get(`http://localhost:${process.env.PORT}/api/v1/pokemons`);
        //res.json(pokemonData.data);
    } catch (err) {
        res.send(err);
    }
}))

app.get('/register', (req, res) => {
    res.send(
        "<form action='/register' method='POST'>" +
            "<input type='text' name='username' value='' placeholder='username'>" +
            "<input type='password' name='password' value='' placeholder='password'>" +
            "<input type='text' name='email' value='' placeholder='email'>" +
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
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const userWithHashedPassword = { ...req.body, password: hashedPassword }

    const user = await userModel.create(userWithHashedPassword)
    res.send(user)
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

    await userModel.update({ username }, { $set: { token }})

    res.header('auth-token', token)

    res.cookie('token', token)

    res.redirect("/")
}))

app.post('/logout', asyncWrapper(async (req, res) => {

}))


app.use(errorHandler)
