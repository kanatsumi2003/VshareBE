'use strict'

const { validate } = require('express-validation');
const Router = require('express').Router();
const VehiclePriceController = require('../../controllers/VehiclePriceController');
const VehiclePriceValidator = require("../../validations/VehiclePriceValidator");

Router.get('/', VehiclePriceController.getItems);
Router.post('/', validate(VehiclePriceValidator.create), VehiclePriceController.createItem);
Router.get('/:id', VehiclePriceController.getItem);
Router.put('/:id', validate(VehiclePriceValidator.update), VehiclePriceController.updateItem);
Router.delete('/:id', VehiclePriceController.deleteItem);

module.exports = Router