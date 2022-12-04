import React, { useEffect, useState } from 'react'
import Pagination from './Pagination';
import axios from 'axios'
import Cookies from 'js-cookie';

function AdminDashboard( { isAdmin } ) {

    const [apiRequests, setApiRequests] = useState([]);

    useEffect(() => {
        axios({
            method: 'get',
            url: 'http://localhost:5001/api/v1/requests',
            headers: {
                "token": Cookies.get('token')
            }
        }).then(res => {
            console.log(res.data)
            setApiRequests(res.data)
        }).then(() => console.log(apiRequests))
            .catch(err => console.log("err", err))
    }, [])

    return (
        <div>
            { isAdmin ? (<h1>Admin</h1>) : (<h1>Not Admin</h1>)}
        </div>
    )
}

export default AdminDashboard
