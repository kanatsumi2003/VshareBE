'use strict'

const { validate } = require('express-validation');
const Router = require('express').Router();
const VehicleModelController = require('../../controllers/VehicleModelController');
const VehicleModelValidator = require("../../validations/VehicleModelValidator");

Router.get('/', VehicleModelController.getItems);
Router.post('/', validate(VehicleModelValidator.create), VehicleModelController.createItem);
Router.get('/:id', VehicleModelController.getItem);
Router.put('/:id', validate(VehicleModelValidator.update), VehicleModelController.updateItem);
Router.delete('/:id', VehicleModelController.deleteItem);

module.exports = Router