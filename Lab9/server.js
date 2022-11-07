const mongoose = require('mongoose');
const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const {PokemonDbError} = require("./errors");
const {getTypes} = require("./getTypes");
const {populatePokemons} = require("./populatePokemons");
const {connectDB} = require("./connectDB");

const dotenv = require("dotenv")
dotenv.config();

const userModel = require("./pokeUserModel.js")
const {PokemonNotFoundError} = require("./errors");
const {PokemonBadRequest} = require("./errors");
const app = express()

const asyncWrapper = (fn) => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next)
        } catch (error) {
            next(error)
        }
    }
}

let pokemonModel;
const start = asyncWrapper(async () => {
    await connectDB();
    const pokeSchema = await getTypes();
    pokemonModel = await populatePokemons(pokeSchema);

    app.listen(process.env.PORT, (err) => {
        if (err)
            throw new PokemonDbError(err)
        else
            console.log(`Server is running on port: ${process.env.PORT}`);
    })
})
start()

app.use(express.json())

app.post('/register', asyncWrapper(async (req, res) => {
    const { username, password, email } = req.body
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const userWithHashedPassword = { ...req.body, password: hashedPassword }

    const user = await userModel.create(userWithHashedPassword)
    res.send(user)
}))

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
    res.header('auth-token', token)

    res.send(user)
}))

const auth = (req, res, next) => {
    const token = req.header('auth-token')
    if (!token) {
        throw new PokemonBadRequest("Access denied")
    }
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET) // nothing happens if token is valid
        next()
    } catch (err) {
        throw new PokemonBadRequest("Invalid token")
    }
}

app.use(auth);

app.get('/api/v1/pokemons', asyncWrapper (async (req, res) => { // - get all the pokemons after the 10th. List only Two.
    function isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }

    if ((req.query.after && !isNumber(req.query.after)) || (req.query.count && !isNumber(req.query.count))) {
        throw new PokemonBadRequest(`after = ${req.query.after}, count = ${req.query.count}; after and count query parameters must be numbers`);
    }

    const result = await pokemonModel.find().skip(req.query.after).limit(req.query.count);

    if (result.length === 0) {
        throw new PokemonNotFoundError(`No pokemon found with current filter values`);
    }

    res.json(result);

}))

app.post('/api/v1/pokemon', asyncWrapper (async (req, res) => { // - create a new pokemon
    await pokemonModel.create(req.body);
    res.json({msg: "Successfully inserted pokemon"});
}))

app.get('/api/v1/pokemon/:id', asyncWrapper(async (req, res) => { // - get a pokemon

    const pokemon = await pokemonModel.find({ id: req.params.id });

    if (pokemon.length === 0) {
        throw new PokemonNotFoundError(`Pokemon with id ${req.params.id} does not exists`);
    }

    res.json(pokemon);

}))

app.get('/api/v1/pokemonImage/:id', asyncWrapper(async (req, res) => { // - get the url of a pokemon
    function idToThreeDigitString(id) {
        if (Math.floor(id / 10) >= 10) {
            return id.toString();
        } else if (Math.floor(id / 10) > 1) {
            return "0" + id.toString();
        } else {
            return "00" + id.toString();
        }
    }
    res.json({
        url: "https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/images/"
            + idToThreeDigitString(req.params.id) + ".png"
    })
}))

app.put('/api/v1/pokemon/:id', asyncWrapper(async (req, res) => { // - upsert a whole pokemon document
    await pokemonModel.updateOne({ id: req.params.id }, req.body, { upsert: true, runValidators: true, new: true });
    res.json({msg: `Successfully updated pokemon with id ${req.params.id}`});
}))

app.patch('/api/v1/pokemon/:id', asyncWrapper(async (req, res) => { // - patch a pokemon document or a portion of the pokemon document
    await pokemonModel.updateOne({ id: req.params.id }, req.body, { runValidators: true });
    res.json({msg: `Successfully patched pokemon with id ${req.params.id}`});
}))

app.delete('/api/v1/pokemon/:id', asyncWrapper(async (req, res) => { // - delete a  pokemon
    const deleteResponse = await pokemonModel.deleteOne({ id: req.params.id });
    if (deleteResponse.deletedCount === 0) {
        throw new PokemonNotFoundError(`Delete failed on pokemon with id ${req.params.id}`)
    }
    res.json({msg: `Pokemon with id ${req.params.id} successfully deleted`});
}))

app.get('/api/doc', asyncWrapper((req, res) => {
    res.sendFile(path.join(__dirname, '/docs.html'))
}))

app.all('*', (req, res) => {
    res.status(404).json({msg: "Improper request"});
})

app.use((err, req, res, next) => {
    console.error("Overrided default Express error handler...");
    console.error(err.stack);
    res.status(500).json({msg: err.message})
})
