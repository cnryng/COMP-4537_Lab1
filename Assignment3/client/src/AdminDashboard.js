import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie';
import Card from 'react-bootstrap/Card';
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";

function AdminDashboard() {

    const [isAdmin, setIsAdmin] = useState(false);
    const [apiRequests, setApiRequests] = useState([]);
    const [mostApiRequests, setMostApiRequests] = useState("");
    const [fourHundredRequests, setFourHundredRequests] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
        const checkIfAdmin = await axios({
            method: 'get',
            url: 'http://localhost:5001/api/v1/isAdmin',
            headers: {
                "token": Cookies.get('token')
            }
        })
        setIsAdmin(checkIfAdmin.data);
        console.log(checkIfAdmin.data);

        const apiRequests = await axios({
            method: 'get',
            url: 'http://localhost:5001/api/v1/uniqueRequests',
            headers: {
                "token": Cookies.get('token')
            }
        })
        setApiRequests(apiRequests.data);

        const getMostApiRequests = await axios({
            method: 'get',
            url: 'http://localhost:5001/api/v1/mostRequests',
            headers: {
                "token": Cookies.get('token')
            }
        })
        setMostApiRequests(getMostApiRequests.data[0]);

        const get400Requests = await axios({
            method: 'get',
            url: 'http://localhost:5001/api/v1/400requests',
            headers: {
                "token": Cookies.get('token')
            }
        })
        setFourHundredRequests(get400Requests.data);
        console.log(get400Requests.data);
        }
        fetchData().catch(err => console.log(err))
    }, [])

    return (
        <div>
            { isAdmin ? (
                <div>
                    <h1>Admin Dashboard</h1>
                    <Card style={{ width: '20rem' }}>
                        <Card.Body>
                            <Card.Title>Number of unique requesters</Card.Title>
                            <Card.Text>{apiRequests.length}</Card.Text>
                        </Card.Body>
                    </Card>
                    <Card style={{ width: '20rem' }}>
                        <Card.Body>
                            <Card.Title>User with most requests</Card.Title>
                            <Card.Text>{mostApiRequests._id}: {mostApiRequests.count} requests</Card.Text>
                        </Card.Body>
                    </Card>
                    <Card style={{ width: '20rem' }}>
                        <Card.Body>
                            <Card.Title>Number of 400 status requests</Card.Title>
                            <Card.Text>{fourHundredRequests}</Card.Text>
                        </Card.Body>
                    </Card>
                </div>
                )
                : (<h1>Not Admin</h1>)}
        </div>
    )
}

export default AdminDashboard
