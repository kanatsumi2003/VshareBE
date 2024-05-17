'use strict'

const db = require('../models');
const AbstractBaseService = require('./AbstractBaseService');
const { buildQuery } = require('../helpers/QueryHelper');

function filterOtherFields(data) {
  const otherFields = {};
  const keys = [
    'bank_name',
    'bank_branch_name',
    'bank_account_name',
    'bank_account_number',
    'tax_number',
    'add_ons',
    'location',
    'payment_methods',
  ];
  keys.forEach(key => {
    if (typeof data[key] != 'undefined') otherFields[key] = data[key]
  });
  if (!otherFields.add_ons) otherFields.add_ons = []
  return otherFields;
}

class BranchService extends AbstractBaseService {
  constructor() {
    super(db.branch);
  }

  getAll = (params, options) => {
    const query = buildQuery(params);
    return this.model.findAndCountAll({
      ...query,
      attributes: [
        'id',
        'name',
        'code',
        'address',
        'rental_time_from',
        'rental_time_to',
        'active',
        'other_data',
      ],
      include: [
        { model: db.zone, as: 'province', attributes: ['name'] },
        { model: db.zone, as: 'district', attributes: ['name'] },
      ],
      ...options
    });
  }

  create = async (data) => {
    data.other_data = filterOtherFields(data);
    const branch = await this.model.create(data);
    return branch;
  }

  updateById = async (id, data, oldBranch = {}) => {
    data.other_data = { ...oldBranch.other_data, ...filterOtherFields(data) }
    return await this.model.update(data, { where: { id } });
  }

  getOne = async (params, options) => {
    const item = await this.model.findOne({ where: { ...params }, ...options });
    if (item) {
      let data = item.toJSON();
      if (data.other_data) {
        Object.entries(data.other_data).forEach(([key, value], _) => data[key] = value);
        delete data.other_data
      }
      return data;
    }
    return null;
  }

  getById = async (id) => {
    const item = await this.model.findByPk(id);
    if (item) {
      let data = item.toJSON();
      if (data.other_data) {
        Object.entries(data.other_data).forEach(([key, value], _) => data[key] = value);
        delete data.other_data
      }
      return data;
    }
    return null;
  }
}

module.exports = new BranchService();
