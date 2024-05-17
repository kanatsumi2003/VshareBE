'use strict'

const { validate } = require('express-validation');
const Router = require('express').Router();
const OwnerContractController = require('../../controllers/OwnerContractController');
const OwnerContractValidator = require("../../validations/OwnerContractValidator");

Router.get('/', OwnerContractController.getItems);
Router.post('/', validate(OwnerContractValidator.create), OwnerContractController.createItem);
Router.get('/:id', OwnerContractController.getItem);
Router.put('/:id', validate(OwnerContractValidator.update), OwnerContractController.updateItem);
Router.delete('/:id', OwnerContractController.deleteItem);

module.exports = Router;
