'use strict'

const db = require('../models');
const AbstractBaseService = require('./AbstractBaseService');

class OwnerAvaiableDayService extends AbstractBaseService {
  constructor() {
    super(db.owner_avaiable_day);
  }
}

module.exports = new OwnerAvaiableDayService();
