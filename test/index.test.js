'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const constants = require('../config/constants')
const routes = require('../routes')

const app = express()
app.set('port', constants.PORT);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/api', routes)

module.exports = app