'use strict'

const { buildQuery } = require('../helpers/QueryHelper');

class AbstractBaseService {
  constructor(model) {
    this.model = model;
    this.tableName = model.tableName;
  }

  getAll = (params, options) => {
    const query = buildQuery(params);
    return this.model.findAndCountAll({ ...query, ...options });
  }

  findAll = (params, options) => this.model.findAll({ where: { ...params }, ...options });

  getOne = (params, options) => this.model.findOne({ where: { ...params }, ...options });

  getById = (id) => this.model.findByPk(id);

  create = (data, options) => this.model.create(data, { ...options });

  updateById = (id, data) => this.model.update(data, { where: { id } });

  deleteById = (id, options) => this.model.destroy({ where: { id }, ...options });

  delete = (params, options) => this.model.destroy({ where: { ...params }, ...options });

  batchCreate = (data, options) => this.model.bulkCreate(data, { ...options });

}

module.exports = AbstractBaseService;
