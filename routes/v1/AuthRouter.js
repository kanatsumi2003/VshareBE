'use strict'

const Router = require('express').Router();
const AuthController = require('../../controllers/AuthController');

Router.post('/login', AuthController.userLogin);
Router.post('/logout', AuthController.userLogout);

module.exports = Router
