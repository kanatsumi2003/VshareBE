'use strict'

const db = require('../models');
const AbstractBaseService = require('./AbstractBaseService');

class PromotionEventService extends AbstractBaseService {
  constructor() {
    super(db.promotion_event);
  }
}

module.exports = new PromotionEventService();
