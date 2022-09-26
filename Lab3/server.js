const express = require('express')

const app = express()
const port = 5000

var { unicornsJSON } = require('./data.js')

app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    }
)

app.get('/api/v1/unicorns', (req, res) => {
    res.send('All the unicorns')
})

app.post('/api/v1/unicorn', (req, res) => {
    res.send('Create a new unicorn')
})

app.get('/api/v1/unicorn/:id', (req, res) => {
    res.send('Get a unicorn')
})

app.patch('/api/v1/unicorn/:id', (req, res) => {
    res.send('Update a unicorn')
})

app.delete('/api/v1/unicorn/:id', (req, res) => {
    res.send('Delete a unicorn')
})