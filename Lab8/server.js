const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const https = require('https');
const pokemonErrors = require("./errors.js")

const app = express();
const port = 5000;
const dbURL = "mongodb+srv://test-user:9pmeJjRNqtysbXZF@testcluster.lcqmg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const { Schema } = mongoose;
const { PokemonBadRequest, PokemonNotFoundError } = pokemonErrors;

let pokemonSchema;
let pokemonModel;

const asyncWrapper = (fn) => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next)
        } catch (error) {
            next(error)
        }
    }
}

app.listen(process.env.PORT || 5000, async () => {
    try {
        await mongoose.connect(dbURL);
    } catch (error) {
        console.log('db error');
    }
    console.log(`App listening on port ${port}`);

    let possibleTypes = [];

    await https.get("https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/types.json", async (res) => {
        let rawData = "";
        await res.on("data", (chunk) => {
            rawData += chunk;
        })
        await res.on("end", () => {
            let parsedData = JSON.parse(rawData);
            parsedData.map(element => possibleTypes.push(element.english));
            pokemonSchema = new Schema({
                "id": {
                    type: Number,
                    unique: true,
                    required: true,
                },
                "name": {
                    type: {
                        "english": {
                            type: String,
                            maxLength: 20,
                            required: true
                        },
                        "japanese": String,
                        "chinese": String,
                        "french": String
                    },
                    required: true,
                    default: {},
                    _id: false
                },
                "base": {
                    type: {
                        "HP": {type: Number, required: true},
                        "Attack": {type: Number, required: true},
                        "Defense": {type: Number, required: true},
                        "Sp Attack": {type: Number, required: true},
                        "Sp Defense": {type: Number, required: true},
                        "Speed": {type: Number, required: true}
                    },
                    required: true,
                    default: {},
                    _id: false
                },
                "type":  {
                    type: [String],
                    enum: possibleTypes,
                    required: true,
                    default: []
                }
            });
            pokemonModel = mongoose.model('pokemon', pokemonSchema);
        })
    })

    function renameSpecialStats(obj) {
        obj["base"]["Sp Attack"] = obj["base"]["Sp. Attack"];
        delete obj["base"]["Sp. Attack"];
        obj["base"]["Sp Defense"] = obj["base"]["Sp. Defense"] ;
        delete obj["base"]["Sp. Defense"];
    }

    await https.get("https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json", async (res) => {
        let rawData = "";
        res.on("data", (chunk) => {
            rawData += chunk;
        })
        res.on("end", async () => {
            let parsedJSON = JSON.parse(rawData);
            parsedJSON.forEach(obj => renameSpecialStats(obj));
            await pokemonModel.collection.drop();
            await pokemonModel.collection.createIndex({id: 1}, {unique: true});
            await pokemonModel.insertMany(parsedJSON);
            console.log("Populated pokemons collection.")
        })
    })
})

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

app.post('/api/v1/pokemon', bodyParser.json(), asyncWrapper (async (req, res) => { // - create a new pokemon
    await pokemonModel.create(req.body);
    res.json({msg: "Successfully inserted pokemon"});
}))

app.get('/api/v1/pokemon/:id', asyncWrapper(async (req, res) => { // - get a pokemon

    const pokemon = await pokemonModel.find({ id: req.params.id });

    if (pokemon.length === 0) {
        throw new PokemonNotFoundError(`Pokemon with id ${req.params.id} does not exists`);
    }

    res.json(pokemon);

    // pokemonModel.find({ id: req.params.id }, (err, doc) => {
    //     if (err) {
    //         console.error(err)
    //         res.json({msg: "db reading .. err.  Check with server devs"})
    //     } else if (doc.length === 0){
    //         console.log(doc);
    //         res.json({msg: `Pokemon with id ${req.params.id} does not exists`});
    //     } else {
    //         console.log(doc);
    //         res.json(doc);
    //     }
    // })
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

app.put('/api/v1/pokemon/:id', bodyParser.json(), asyncWrapper(async (req, res) => { // - upsert a whole pokemon document
    await pokemonModel.updateOne({ id: req.params.id }, req.body, { upsert: true, runValidators: true, new: true });
    res.json({msg: `Successfully updated pokemon with id ${req.params.id}`});
    // pokemonModel.updateOne({ id: req.params.id }, req.body, { upsert: true, runValidators: true, new: true }, (err, opRes) => {
    //     if (err) res.json(getMongooseErrorMessage(err, req));
    //     else if (opRes.upsertedCount > 0) {
    //         res.json({msg: `Couldn't find pokemon with id ${req.params.id}; inserted new pokemon instead`})
    //     }
    //     else {
    //         console.log(opRes);
    //         res.json({msg: `Successfully updated pokemon with id ${req.params.id}`})
    //     }
    // });
}))

app.patch('/api/v1/pokemon/:id', bodyParser.json(), asyncWrapper(async (req, res) => { // - patch a pokemon document or a portion of the pokemon document
    await pokemonModel.updateOne({ id: req.params.id }, req.body, { runValidators: true });
    res.json({msg: `Successfully patched pokemon with id ${req.params.id}`});
    // pokemonModel.updateOne({ id: req.params.id }, req.body, { runValidators: true }, (err, opRes) => {
    //     if (err) res.json(getMongooseErrorMessage(err, req));
    //     else if (opRes.modifiedCount > 0) {
    //         res.json({msg: `Successfully patched pokemon with id ${req.params.id}`})
    //     }
    //     else {
    //         res.json({msg: `Patch failed. Pokemon with id ${req.params.id} does not exist`})
    //     }
    // })
}))

app.delete('/api/v1/pokemon/:id', asyncWrapper(async (req, res) => { // - delete a  pokemon
    const deleteResponse = await pokemonModel.deleteOne({ id: req.params.id });
    if (deleteResponse.deletedCount === 0) {
        throw new PokemonNotFoundError(`Delete failed on pokemon with id ${req.params.id}`)
    }
    res.json({msg: `Pokemon with id ${req.params.id} successfully deleted`});
    // pokemonModel.deleteOne({ id: req.params.id },  (err, opRes) => {
    //     if (err) {
    //         console.error(err);
    //         res.json(getMongooseErrorMessage(err, req));
    //     } else if (opRes.deletedCount === 0){
    //         console.log(opRes);
    //         res.json({msg: `Failed to delete. Pokemon with id ${req.params.id} does not exists`});
    //     } else {
    //         console.log(opRes);
    //         res.json({msg: `Pokemon with id ${req.params.id} successfully deleted`});
    //     }
    // })
}))

app.get('/api/doc', asyncWrapper((req, res) => {
    res.sendFile(path.join(__dirname, '/docs.html'))
}))

app.all('*', (req, res) => {
    res.status(404).json({msg: "Improper request"});
})

app.use((err, req, res) => {
    console.error("Overrided default Express error handler...");
    console.error(err.stack);
    res.status(500).json({msg: err.message})
})
