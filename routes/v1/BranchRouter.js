'use strict'

const { validate } = require('express-validation');
const Router = require('express').Router();
const BranchController = require('../../controllers/BranchController');
const BranchValidator = require("../../validations/BranchValidator");

Router.get('/', BranchController.getItems);
Router.post('/', validate(BranchValidator.create), BranchController.createItem);
Router.get('/:id', BranchController.getItem);
Router.put('/:id', validate(BranchValidator.update), BranchController.updateItem);
Router.delete('/:id', BranchController.deleteItem);

module.exports = Router;