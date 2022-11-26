import React, {useEffect, useRef, useState} from 'react'
import Page from './Page'
import Pagination from './Pagination';
import FilteredPagination from "./FilteredPagination";
import Search from "./Search";
import axios from 'axios'

function App() {
    const [pokemons, setPokemons] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [checkedState, setCheckedState] = useState([]);
    const types = useRef([]);

    useEffect(() => {
        axios.get('https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/types.json')
            .then((res) => {
                types.current = res.data.map(type => type.english);
                setCheckedState(new Array(res.data.length).fill(false));
                console.log("types", types);
            })
            .catch(err => console.log("err", err))
    }, [])

    //const indexOfLastRecord = currentPage * pokemonsPerPage;
    //const indexOfFirstRecord = indexOfLastRecord - pokemonsPerPage;
    //const currentPokemons = pokemons.slice(indexOfFirstRecord, indexOfLastRecord)
    //const numberOfPages = Math.ceil(pokemons.length / pokemonsPerPage);

    return (
        <>
            <Search types={types} checkedState={checkedState} setCheckedState={setCheckedState} />
            <FilteredPagination
                pokemons={pokemons}
                setPokemons={setPokemons}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                checkedState={checkedState}
                types={types}
            />
        </>
    )
}

export default App
