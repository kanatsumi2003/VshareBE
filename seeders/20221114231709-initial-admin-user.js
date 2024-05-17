'use strict';

const bcrypt = require("bcrypt");

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkDelete('user', { username: 'admin' })
    await queryInterface.bulkInsert('user', [
      {
        username: 'admin',
        fullname: 'Super Admin',
        user_type: 0,
        active: true,
        password: bcrypt.hashSync('admin', bcrypt.genSaltSync(10)),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});
  },
};
