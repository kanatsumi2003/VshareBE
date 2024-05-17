'use strict'

const Router = require('express').Router();
const BookedScheduleController = require('../../controllers/BookedScheduleController');

Router.get('/', BookedScheduleController.getItems);

module.exports = Router;