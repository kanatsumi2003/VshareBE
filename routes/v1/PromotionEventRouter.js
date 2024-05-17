'use strict'

const { validate } = require('express-validation');
const Router = require('express').Router();
const PromotionEventController = require('../../controllers/PromotionEventController');
const PromotionEventValidator = require("../../validations/PromotionEventValidator");

Router.get('/', PromotionEventController.getItems);
Router.post('/', validate(PromotionEventValidator.create), PromotionEventController.createItem);
Router.get('/:id', PromotionEventController.getItem);
Router.put('/:id', validate(PromotionEventValidator.update), PromotionEventController.updateItem);
Router.delete('/:id', PromotionEventController.deleteItem);

module.exports = Router;
