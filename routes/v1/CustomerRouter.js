'use strict'

const { validate } = require('express-validation');
const Router = require('express').Router();
const CustomerController = require('../../controllers/CustomerController');
const CustomerValidator = require("../../validations/CustomerValidator");

Router.get('/', CustomerController.getItems);
Router.post('/', validate(CustomerValidator.create), CustomerController.createItem);
Router.get('/:id', CustomerController.getItem);
Router.put('/:id', validate(CustomerValidator.update), CustomerController.updateItem);
Router.delete('/:id', CustomerController.deleteItem);
Router.get('/phone/:phone', CustomerController.getCustomerByPhone);
Router.get('/:id/bookings', CustomerController.getCustomerBookings);
Router.get('/:id/trust-scores', CustomerController.getCustomerTrustScores);
Router.put('/:id/trust-scores', validate(CustomerValidator.upsertCustomerTrustScores), CustomerController.upsertCustomerTrustScores);

module.exports = Router;