const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const https = require('https');

const app = express();
const port = 5000;
const { Schema } = mongoose;

let pokemonSchema;
let pokemonModel;

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
            //possibleTypes = JSON.parse(rawData);
            let parsedData = JSON.parse(rawData);
            parsedData.map(element => possibleTypes.push(element.english));
            console.log(possibleTypes)
            pokemonSchema = new Schema({
                "id": {
                    type: Number,
                    unique: true
                },
                "name": {
                    "english": String,
                    "japanese": String,
                    "chinese": String,
                    "french": String
                },
                "base": {
                    "HP": Number,
                    "Attack": Number,
                    "Defense": Number,
                    "Sp Attack": Number,
                    "Sp Defense": Number,
                    "Speed": Number
                },
                "type":  {
                    type: [String],
                    enum: possibleTypes
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

// app.get('/api/v1/pokemons?count=2&after=10')     // - get all the pokemons after the 10th. List only Two.
app.post('/api/v1/pokemon', bodyParser.json(), (req, res) => { // - create a new pokemon
    console.log(req.body);
    pokemonModel.create(req.body, function (err) {
        if (err) console.log(err);
    })
    res.json(req.body)
})

app.get('/api/v1/pokemon/:id', (req, res) => { // - get a pokemon
    console.log(req.params.id);
    pokemonModel.find({ id: `${req.params.id}` })
        .then(doc => {
            console.log(doc);
            res.json(doc);
        })
        .catch(err => {
            console.error(err)
            res.json({msg: "db reading .. err.  Check with server devs"})
        })
})

app.get('/api/v1/pokemonImage/:id', async (req, res) => {

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
// app.put('/api/v1/pokemon/:id')                   // - upsert a whole pokemon document
// app.patch('/api/v1/pokemon/:id')                 // - patch a pokemon document or a
//   portion of the pokemon document
// app.delete('/api/v1/pokemon/:id')                // - delete a  pokemon
