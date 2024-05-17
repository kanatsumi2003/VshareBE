const constants = require('../config/constants');

module.exports = {
  development: {
    username: constants.MYSQL_USER,
    password: constants.MYSQL_PASSWORD,
    database: constants.MYSQL_DATABASE,
    host: constants.MYSQL_HOST,
    port: constants.MYSQL_PORT,
    dialect: 'mysql',
    logging: false
  },
  production: {
    username: constants.MYSQL_USER,
    password: constants.MYSQL_PASSWORD,
    database: constants.MYSQL_DATABASE,
    host: constants.MYSQL_HOST,
    port: constants.MYSQL_PORT,
    dialect: 'mysql'
  }
}