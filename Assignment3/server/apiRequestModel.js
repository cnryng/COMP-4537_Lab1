const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    request: {
        type: String,
        required: true,
    },
    status: {
        type: Number,
    },
    date: {
        type: Date,
        default: Date.now
    },
    username: {
        type: String
    },
    token: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model('apiRequest', schema) //pokeUser is the name of the collection in the db
