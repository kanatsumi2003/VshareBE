'use strict'

const Router = require('express').Router();
const SystemConfigController = require('../../controllers/SystemConfigController');

Router.get('/', SystemConfigController.getPrepareData);

module.exports = Router;