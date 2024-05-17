'use strict'

const Router = require('express').Router();
const ExportController = require('../../controllers/ExportController');

Router.get('/booking-list', ExportController.exportBookingList);
Router.get('/customer-list', ExportController.exportCustomerList);

module.exports = Router;