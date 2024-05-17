'use strict'

const db = require('../models');
const AbstractBaseService = require('./AbstractBaseService');

class VehicleModelService extends AbstractBaseService {
  constructor() {
    super(db.vehicle_model);
  }
}

module.exports = new VehicleModelService();
