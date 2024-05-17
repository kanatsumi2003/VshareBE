'use strict';

const Op = require("sequelize").Op;
const { ROWS_PER_PAGE } = require("../constants");

exports.buildQuery = (query) => {
  const result = {
    order: []
  }
  let { limit = ROWS_PER_PAGE, page, offset, sort = {} } = query
  if (Object.keys(sort).length) {
    Object.keys(sort).forEach(field => {
      result.order.push([field, sort[field] == 1 ? 'ASC' : 'DESC'])
    })
  }
  else {
    result.order = [['id', 'DESC']]
  }
  result.limit = parseInt(limit) ? parseInt(limit) : ROWS_PER_PAGE
  if (typeof page !== 'undefined') {
    page = parseInt(page) > 0 ? parseInt(page) : 1
    result.offset = (page - 1) * result.limit
  }
  else if (typeof offset !== 'undefined') {
    result.offset = parseInt(offset)
  }

  // get all
  if (result.limit === -1) {
    delete result.limit;
  } else if (result.limit > 1000) {
    result.limit = 1000;
  }

  // remove all empty value
  result.where = { ...query }
  Object.keys(query).forEach(key => {
    if (query[key] == '') {
      delete result.where[key];
    }
  })

  if (query.name) {
    result.where.name = {
      [Op.like]: `%${query.name}%`
    }
  }
  if (query.username) {
    result.where.username = {
      [Op.like]: `%${query.username}%`
    }
  }
  if (query.fullname) {
    result.where.fullname = {
      [Op.like]: `%${query.fullname}%`
    }
  }
  if (query.email) {
    result.where.email = {
      [Op.like]: `%${query.email}%`
    }
  }
  if (query.code) {
    result.where.code = {
      [Op.like]: `%${query.code}%`
    }
  }
  if (query.address) {
    result.where.address = {
      [Op.like]: `%${query.address}%`
    }
  }
  delete result.where.page;
  delete result.where.offset;
  delete result.where.limit;
  return result
}
