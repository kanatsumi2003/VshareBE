'use strict'

const { validate } = require('express-validation');
const Router = require('express').Router();
const DeliveryTaskController = require('../../controllers/DeliveryTaskController');
const DeliveryTaskValidator = require('../../validations/DeliveryTaskValidator');

Router.get('/', DeliveryTaskController.getItems);
Router.put('/:id', validate(DeliveryTaskValidator.update), DeliveryTaskController.updateItem);
Router.get('/schedules', DeliveryTaskController.getSchedules);
Router.get('/booking/:bookingId', DeliveryTaskController.getItemByBookingId);
Router.put('/booking/:bookingId', validate(DeliveryTaskValidator.updateDelivery), DeliveryTaskController.updateItemByBookingId);

module.exports = Router;