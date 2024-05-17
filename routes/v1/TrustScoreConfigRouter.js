'use strict'

const { validate } = require('express-validation');
const Router = require('express').Router();
const TrustScoreConfigController = require('../../controllers/TrustScoreConfigController');
const TrustScoreConfigValidator = require('../../validations/TrustScoreConfigValidator');

Router.get('/', TrustScoreConfigController.getItems);
Router.post('/', validate(TrustScoreConfigValidator.create), TrustScoreConfigController.createItem);
Router.get('/:id', TrustScoreConfigController.getItem);
Router.put('/:id', validate(TrustScoreConfigValidator.update), TrustScoreConfigController.updateItem);
Router.delete('/:id', TrustScoreConfigController.deleteItem);

module.exports = Router;