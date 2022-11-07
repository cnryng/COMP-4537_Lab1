class PokemonBadRequest extends Error {
    constructor(message) {
        super(message);
        this.name = "PokemonBadRequest"
    }
}

class PokemonNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = "PokemonNotFoundError"
    }
}


module.exports = { PokemonBadRequest, PokemonNotFoundError }
