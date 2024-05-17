'use strict'

const { validate } = require('express-validation');
const Router = require('express').Router();
const VehicleController = require('../../controllers/VehicleController');
const VehicleValidator = require("../../validations/VehicleValidator");

Router.get('/', VehicleController.getItems);
Router.post('/', validate(VehicleValidator.create), VehicleController.createItem);
Router.get('/:id', VehicleController.getItem);
Router.put('/:id', validate(VehicleValidator.update), VehicleController.updateItem);
Router.delete('/:id', VehicleController.deleteItem);
Router.get('/:id/price-template', VehicleController.getPriceTemplate);

module.exports = Router