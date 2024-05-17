'use strict'

const { validate } = require('express-validation');
const Router = require('express').Router();
const BranchVehicleController = require('../../controllers/BranchVehicleController');
const BranchVehicleValidator = require("../../validations/BranchVehicleValidator");

Router.get('/', BranchVehicleController.getItems);
Router.post('/', validate(BranchVehicleValidator.create), BranchVehicleController.createItem);
Router.get('/:id', BranchVehicleController.getItem);
Router.put('/:id', validate(BranchVehicleValidator.update), BranchVehicleController.updateItem);
Router.delete('/:id', BranchVehicleController.deleteItem);

module.exports = Router;