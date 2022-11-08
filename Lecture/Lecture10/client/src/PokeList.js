import React, { useEffect, useState } from 'react'
import Pokemon from "./Pokemon";

function PokeList() {
    const [pokemons, setPokemons] = useState([])

    useEffect(() => {
        fetch('http://localhost:5000/api/v1/pokemons')
            .then(response => response.json())
            .then(data => {
                setPokemons(data);
            })
    }, [])

    return (
        <>
            PokeList
            {
                pokemons.map(pokemon => {
                    //do not need a key prop, but there's a warning if omitted
                    return <Pokemon key={pokemon.id} pokemon={pokemon}/>
                })
            }

        </>
    )
}

export default PokeList
