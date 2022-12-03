import React, {useEffect, useRef, useState} from 'react'
import Page from './Page'
import Pagination from './Pagination';
import FilteredPagination from "./FilteredPagination";
import Search from "./Search";
import axios from 'axios'

function App() {

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


    return (
        <>
            <Search types={types} checkedState={checkedState} setCheckedState={setCheckedState} />
            <FilteredPagination
                checkedState={checkedState}
                types={types}
            />
        </>
    )
}

export default App
