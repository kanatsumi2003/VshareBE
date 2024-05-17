'use strict'

const { validate } = require('express-validation');
const Router = require('express').Router();
const DistrictController = require('../../controllers/DistrictController');
const ZoneValidator = require("../../validations/ZoneValidator");

Router.get('/', DistrictController.getItems);
Router.post('/', validate(ZoneValidator.createDistrict), DistrictController.createItem);
Router.get('/:id', DistrictController.getItem);
Router.put('/:id', validate(ZoneValidator.updateDistrict), DistrictController.updateItem);
Router.delete('/:id', DistrictController.deleteItem);

module.exports = Router;