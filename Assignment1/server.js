const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const https = require('https');

const app = express();
const port = 5000;
const { Schema } = mongoose;

let pokemonSchema;
let pokemonModel;

function getMongooseErrorMessage(err, req) {
    if (err.code == 11000) {
        console.log(err);
        return {msg: `Pokemon with id ${req.body.id} already exists`};
    } else {
        console.log(err);
        return {msg: err.message};
    }
}

app.listen(process.env.PORT || 5000, async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/test");
    } catch (error) {
        console.log('db error');
    }
    console.log(`Example app listening on port ${port}`);

    let possibleTypes = [];

    await https.get("https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/types.json", async (res) => {
        let rawData = "";
        res.on("data", (chunk) => {
            rawData += chunk;
        })
        res.on("end", () => {
            let parsedData = JSON.parse(rawData);
            parsedData.map(element => possibleTypes.push(element.english));
            console.log(possibleTypes)
            pokemonSchema = new Schema({
                "id": {
                    type: Number,
                    unique: true,
                    required: true
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
                    required: true
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
                    required: true
                },
                "type":  {
                    type: [String],
                    enum: possibleTypes,
                    required: true
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
        res.on("end", () => {
            let parsedJSON = JSON.parse(rawData);
            parsedJSON.forEach(obj => renameSpecialStats(obj));
            pokemonModel.insertMany(parsedJSON);
        })
    })

    // await pokemonModel.create({
    //     "id": 999,
    //     "name": {
    //         "english": "Venusaur",
    //         "japanese": "フシギバナ",
    //         "chinese": "妙蛙花",
    //         "french": "Florizarre"
    //     },
    //     "type": [
    //         "bad",
    //         "Poison"
    //     ],
    //     "base": {
    //         "HP": 45,
    //         "Attack": 49,
    //         "Defense": 49,
    //         "Sp. Attack": 65,
    //         "Sp. Defense": 65,
    //         "Speed": 45
    //     }
    // }, err => {
    //     if (err) console.log(err);
    // });
})

app.get('/api/v1/pokemons', (req, res) => { // - get all the pokemons after the 10th. List only Two.
    let responseBody;
    pokemonModel.find().skip(req.query.after).limit(req.query.count).exec((err, result) => {
        if (err) {
            responseBody = getMongooseErrorMessage(err, req);
        } else {
            responseBody = result;
        }
        res.json(responseBody);
    })
})

app.post('/api/v1/pokemon', bodyParser.json(), (req, res) => { // - create a new pokemon
    console.log(req.body);
    let responseBody;
    pokemonModel.create(req.body, (err) => {
        if (err) {
            responseBody = getMongooseErrorMessage(err, req);
        } else {
            responseBody = req.body;
        }
        res.json(responseBody);
    })
})

app.get('/api/v1/pokemon/:id', (req, res) => { // - get a pokemon
    console.log(req.params.id);
    pokemonModel.find({ id: `${req.params.id}` }, (err, doc) => {
        if (err) {
            console.error(err)
            res.json({msg: "db reading .. err.  Check with server devs"})
        } else if (doc.length === 0){
            console.log(doc);
            res.json({msg: `Pokemon with id ${req.params.id} does not exists`});
        } else {
            console.log(doc);
            res.json(doc);
        }
    })
})

app.get('/api/v1/pokemonImage/:id', async (req, res) => { // - get the url of a pokemon
    function idToThreeDigitString(id) {
        if (Math.floor(id / 10) > 10) {
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
})

app.put('/api/v1/pokemon/:id', bodyParser.json(), (req, res) => { // - upsert a whole pokemon document
    pokemonModel.updateOne({ id: req.params.id }, req.body, { upsert: true, runValidators: true, new: true }, (err, opRes) => {
        if (err) res.json(getMongooseErrorMessage(err, req));
        else {
            console.log();
            res.json({msg: opRes})
        }
    });
})

// app.patch('/api/v1/pokemon/:id')                 // - patch a pokemon document or a portion of the pokemon document
// app.delete('/api/v1/pokemon/:id')                // - delete a  pokemon

app.all('*', (req, res) => {
    res.status(404).json({msg: "Improper request"});
})
