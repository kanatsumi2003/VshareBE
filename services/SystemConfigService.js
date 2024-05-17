'use strict'

const Op = require('sequelize').Op;
const Constants = require('../constants');
const db = require('../models');
const AbstractBaseService = require('./AbstractBaseService');

class SystemConfigService extends AbstractBaseService {
  constructor() {
    super(db.system_config);
  }

  getValueByCode = (code) => {
    if (Array.isArray(code)) {
      return this.model.findAll({
        where: {
          code: {
            [Op.in]: code
          }
        },
        attributes: ['value', 'code']
      })
    }
    return this.model.findOne({ attributes: ['value', 'code'], where: { code } })
  }

  getPaymentMethod = async code => {
    const paymentMethods = await this.model.findOne({ attributes: ['value'], where: { code: 'payment_method' } })
    if (paymentMethods && paymentMethods.value) {
      const paymentMethod = (paymentMethods.value || []).find(p => p.code == code);
      if (paymentMethod && paymentMethod != Constants.PAYMENT_METHOD_ONLINE) {
        return paymentMethod;
      }
    }
    return null;
  }
}

module.exports = new SystemConfigService();
