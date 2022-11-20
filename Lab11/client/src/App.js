import React, { useEffect, useState } from 'react'
import Page from './Page'
import Pagination from './Pagination';
import axios from 'axios'

function App() {
  const [pokemons, setPokemons] = useState([])
  const [currentPage, setCurrentPage] = useState(1);
  const [pokemonsPerPage] = useState(10);

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
