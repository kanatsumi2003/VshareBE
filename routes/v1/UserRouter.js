'use strict'

const { validate } = require('express-validation');
const Router = require('express').Router();
const UserController = require('../../controllers/UserController');
const UserValidator = require("../../validations/UserValidator");

Router.get('/', UserController.getItems);
Router.post('/', validate(UserValidator.create), UserController.createItem);
Router.get('/:id', UserController.getItem);
Router.put('/:id', validate(UserValidator.update), UserController.updateItem);
Router.delete('/:id', UserController.deleteItem);

module.exports = Router;