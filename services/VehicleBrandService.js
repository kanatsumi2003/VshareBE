'use strict'

const db = require('../models');
const AbstractBaseService = require('./AbstractBaseService');

class VehicleBrandService extends AbstractBaseService {
  constructor() {
    super(db.vehicle_brand);
  }
}

module.exports = new VehicleBrandService();
