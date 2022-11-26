import React, {useEffect, useRef, useState} from 'react'
import Page from './Page'
import Pagination from './Pagination';
import axios from 'axios'

function App() {
  const [pokemons, setPokemons] = useState([])
  const [currentPage, setCurrentPage] = useState(1);
  const [pokemonsPerPage] = useState(10);
  const [checkedState, setCheckedState] = useState([]);
  const types = useRef([]);

  useEffect(() => {
    if (localStorage.getItem("lastPage")) {
        console.log("Last page was: ", parseInt(localStorage.getItem("lastPage")));
        setCurrentPage(parseInt(localStorage.getItem("lastPage")));
    }
    if (localStorage.getItem("pokemons")) {
        console.log(localStorage.getItem("pokemons"));
        setPokemons(JSON.parse(localStorage.getItem("pokemons")));
    } else {
        axios.get('https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json')
            .then(res => res.data)
            .then(res => {
                setPokemons(res);
                localStorage.setItem("pokemons", JSON.stringify(res));
                console.log("triggered useEffect");
            })
            .catch(err => console.log("err", err))
        axios.get('https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/types.json').then((res) => {
            types.current = res.data.map(type => type.english);
            setCheckedState(new Array(res.data.length).fill(false));
            //console.log(types);
        });
    }
  }, [])

  const indexOfLastRecord = currentPage * pokemonsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - pokemonsPerPage;
  const currentPokemons = pokemons.slice(indexOfFirstRecord, indexOfLastRecord)
  const numberOfPages = Math.ceil(pokemons.length / pokemonsPerPage);

  return (
    <>
      < Page currentPokemons={currentPokemons} currentPage={currentPage} />
      < Pagination
        numberOfPages={numberOfPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </>
  )
}

export default App
