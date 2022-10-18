const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const https = require('https');

const app = express();
const port = 5000

app.listen(process.env.PORT || port, async () => {
  console.log(`Listening on port ${port}`)
})

app.get('/', (req, res) => {
  res.send("Homepage");
})