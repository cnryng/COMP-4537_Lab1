import React from 'react'

function Pokemon({ pokemon }) {
    const { english } = pokemon.name;
    return (
        <div>
            {english}
        </div>
    )
}

export default Pokemon;
