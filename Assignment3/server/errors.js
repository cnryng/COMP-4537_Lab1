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

class PokemonDbError extends Error {
    constructor(message) {
        super(message);
        this.name = "PokemonDbError"
    }
}

module.exports = { PokemonBadRequest, PokemonNotFoundError, PokemonDbError }
