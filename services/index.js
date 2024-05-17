'use strict'

const db = require('../models');
const AbstractBaseService = require('./AbstractBaseService');
const PriceService = require('./PriceService');
const UserService = require('./UserService');
const DeliveryTaskService = require('./DeliveryTaskService');
const BookedScheduleService = require('./BookedScheduleService');
const DeliveryScheduleService = require('./DeliveryScheduleService');
const BookingService = require('./BookingService');

const CustomerTrustScoreService = new AbstractBaseService(db.customer_trust_score);

module.exports = {
  CustomerTrustScoreService,
  PriceService,
  UserService,
  DeliveryTaskService,
  BookedScheduleService,
  DeliveryScheduleService,
  BookingService,
}
