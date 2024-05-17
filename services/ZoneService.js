'use strict'

const db = require('../models');
const AbstractBaseService = require('./AbstractBaseService');

class ZoneService extends AbstractBaseService {
  constructor() {
    super(db.zone);
  }
}

module.exports = new ZoneService();
