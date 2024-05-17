'use strict'

const Router = require('express').Router();
const DocumentController = require('../../controllers/DocumentController');

Router.post('/preview/booking-contract', DocumentController.previewBookingContract);
Router.post('/preview/receive-report', DocumentController.previewReceiveReport);
Router.post('/preview/return-report', DocumentController.previewReturnReport);

module.exports = Router;