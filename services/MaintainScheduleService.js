'use strict'

const db = require('../models');
const AbstractBaseService = require('./AbstractBaseService');

class MaintainScheduleService extends AbstractBaseService {
  constructor() {
    super(db.maintain_schedule);
  }
}

module.exports = new MaintainScheduleService();
