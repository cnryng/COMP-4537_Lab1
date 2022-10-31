export class PokemonNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = "PokemonNotFoundError"
    }
}


