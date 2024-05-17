'use strict'

const { validate } = require('express-validation');
const Router = require('express').Router();
const VehicleBrandController = require('../../controllers/VehicleBrandController');
const VehicleBrandValidator = require("../../validations/VehicleBrandValidator");

Router.get('/', VehicleBrandController.getItems)
Router.post('/', validate(VehicleBrandValidator.create), VehicleBrandController.createItem)
Router.get('/:id', VehicleBrandController.getItem)
Router.put('/:id', validate(VehicleBrandValidator.update), VehicleBrandController.updateItem)
Router.delete('/:id', VehicleBrandController.deleteItem)

module.exports = Router