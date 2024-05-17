'use strict'

const Router = require('express').Router();
const ClientController = require('@controller/ClientController');
const BookingController = require('@controller/BookingController');

Router.get('/prepare-datas', ClientController.getPrepareData);
Router.post('/calc-price', BookingController.calculatePrice);

module.exports = Router;