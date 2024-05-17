'use strict'

const Router = require('express').Router();
const BookingController = require('../../controllers/BookingController');
const { requestValidate } = require('../../helpers');
const BookingValidator = require("../../validations/BookingValidator");

Router.get('/', BookingController.getItems);
Router.post('/', requestValidate(BookingValidator.create), BookingController.createItem);
Router.get('/:id', BookingController.getItem);
Router.put('/:id', requestValidate(BookingValidator.update), BookingController.updateItem);
Router.delete('/:id', BookingController.deleteItem);
Router.get('/:id/document-preview/:entity', BookingController.previewDocument);
Router.post('/quick-booking', requestValidate(BookingValidator.createQuickBooking), BookingController.createQuickBooking);

module.exports = Router;