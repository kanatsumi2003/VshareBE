'use strict'

const db = require('../models');
const AbstractBaseService = require('./AbstractBaseService');

class AttributeService extends AbstractBaseService {
  constructor() {
    super(db.attribute);
  }
}

module.exports = new AttributeService();
