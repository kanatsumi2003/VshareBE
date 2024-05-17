const express = require('express'),
  Router = express.Router(),
  v1Routes = require('./v1');

Router.use('/v1', v1Routes);

module.exports = Router;