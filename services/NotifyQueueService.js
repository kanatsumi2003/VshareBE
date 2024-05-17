'use strict'

const db = require('../models');
const AbstractBaseService = require('./AbstractBaseService');

class NotifyQueueService extends AbstractBaseService {
  constructor() {
    super(db.notify_queue);
  }
}

module.exports = new NotifyQueueService();
