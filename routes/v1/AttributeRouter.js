'use strict'

const { validate } = require('express-validation');
const Router = require('express').Router();
const AttributeController = require('../../controllers/AttributeController');
const AttributeValidator = require("../../validations/AttributeValidator");

Router.get('/', AttributeController.getItems)
Router.post('/', validate(AttributeValidator.create), AttributeController.createItem)
Router.get('/:id', AttributeController.getItem)
Router.put('/:id', validate(AttributeValidator.update), AttributeController.updateItem)
Router.delete('/:id', AttributeController.deleteItem)

module.exports = Router