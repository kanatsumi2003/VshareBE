'use strict'

const Router = require('express').Router();
const UploadController = require('../../controllers/UploadController');

Router.post('/', UploadController.uploadFile);

module.exports = Router;