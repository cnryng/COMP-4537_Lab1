import React, { useEffect, useState } from 'react'
import City from './City'
function Cities() {

    const [cities, setCities] = useState([]) //cities initially holds empty array and is updated by the setCities function
    const url = "http://localhost:5000/cities"
    useEffect(() => {
        fetch(url)
            .then((resp) => { return resp.json() })
            .then((jsonedResp) => { setCities(jsonedResp)}) //cities will now have the value of jsonedResp
    }, [])

    return (
        <>
            Cities Component
            <hr />
            {
                cities.map((aCity) => {
                    return <City aCity={aCity} />
                })
            }
        </>
    )
}

export default Cities