const express = require("express")
const jwt = require("jsonwebtoken")
const { PokemonDbError, PokemonNotFoundError, PokemonBadRequest } = require("./errors");
const { getTypes } = require("./getTypes");
const { populatePokemons } = require("./populatePokemons");
const { connectDB } = require("./connectDB");
const { asyncWrapper } = require("./asyncWrapper");
const { errorHandler } = require("./errorHandler.js")

const dotenv = require("dotenv")
dotenv.config();

const userModel = require("./pokeUserModel.js")
const apiRequestModel = require("./apiRequestModel")
const app = express()

const cors = require('cors');
app.use(cors());

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

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

const auth = asyncWrapper(async (req, res, next)  => {
    try {
        if (!req.headers.token) {
            throw new PokemonBadRequest("Need token")
        }
        console.log(req.headers);
        const token = req.headers.token;
        //const verified = jwt.verify(token, process.env.TOKEN_SECRET) // nothing happens if token is valid
        const user = await userModel.findOne({ token });
        console.log(user);
        if (!user) {
            throw new PokemonBadRequest("Invalid token used to access protected route");
        }
        next()
    } catch (err) {
        throw new PokemonBadRequest(err.message)
    }
})

app.get('/api/v1/pokemons', auth, asyncWrapper (async (req, res) => { // - get all the pokemons after the 10th. List only Two.
    function isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }

    if ((req.query.after && !isNumber(req.query.after)) || (req.query.count && !isNumber(req.query.count))) {
        throw new PokemonBadRequest(`after = ${req.query.after}, count = ${req.query.count}; after and count query parameters must be numbers`);
    }

    const result = await pokemonModel.find().skip(req.query.after).limit(req.query.count);
    const user = await userModel.findOne({ token: req.headers.token });

    await apiRequestModel.create({
        request: "/api/v1/pokemons",
        status: 200,
        username: user.username,
        token: req.headers.token
    });

    if (result.length === 0) {
        throw new PokemonNotFoundError(`No pokemon found with current filter values`);
    }

    res.json(result);

}))

app.get('/api/v1/pokemon/:id', auth, asyncWrapper(async (req, res) => { // - get a pokemon

    const pokemon = await pokemonModel.find({ id: req.params.id });

    if (pokemon.length === 0) {
        throw new PokemonNotFoundError(`Pokemon with id ${req.params.id} does not exists`);
    }

    res.json(pokemon);

}))

app.get('/api/v1/isAdmin', asyncWrapper (async (req, res) => {
    const data = await userModel.find({
        token: req.headers.token,
        isAdmin: true
    });
    console.log(data);
    if (data.length === 0) {
        res.send(false);
    }
    res.send(true);
}))

const adminAuth = asyncWrapper(async (req, res, next) => {
    try {
        if (!req.headers.token) {
            throw new PokemonBadRequest("Need token")
        }
        const token = req.headers.token;
        const user = await userModel.findOne({ token });
        if (!user) {
            throw new PokemonBadRequest("Invalid token used to access protected route");
        }
        if (!user.isAdmin) {
            throw new PokemonBadRequest("Cannot access admin protected route");
        }
        next()
    } catch (err) {
        throw new PokemonBadRequest(err.message)
    }
})

app.use(adminAuth)

app.get('/api/v1/uniqueRequests', asyncWrapper (async (req, res) => {
    const data = await apiRequestModel.find().distinct('token');
    res.json(data);
}))

app.get('/api/v1/mostRequests', asyncWrapper (async (req, res) => {
    const data = await apiRequestModel.find().distinct('token');
    res.json(data);
}))

app.get('/api/v1/400requests', asyncWrapper (async (req, res) => {
    const data = await apiRequestModel.find({
        status: {
            $lt: 500,
            $gte: 400
        }
    }).count();
    res.json(data);
}))

app.post('/api/v1/pokemon', asyncWrapper (async (req, res) => { // - create a new pokemon
    await pokemonModel.create(req.body);
    res.json({msg: "Successfully inserted pokemon"});
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

app.all('*', async (req, res) => {
    await apiRequestModel.create({
        request: "bad request",
        status: 404,
        token: req.headers.token
    });
    res.status(404).json({msg: "Improper request"});
})

app.use(errorHandler)
