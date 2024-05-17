'use strict'

const { validate } = require('express-validation');
const Router = require('express').Router();
const ProvinceController = require('../../controllers/ProvinceController');
const ZoneValidator = require("../../validations/ZoneValidator");

Router.get('/', ProvinceController.getItems);
Router.post('/', validate(ZoneValidator.createProvince), ProvinceController.createItem);
Router.get('/:id', ProvinceController.getItem);
Router.put('/:id', validate(ZoneValidator.updateProvince), ProvinceController.updateItem);
Router.delete('/:id', ProvinceController.deleteItem);

module.exports = Router;