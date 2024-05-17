'use strict';

const { Op } = require("sequelize");

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkDelete('attribute', { id: { [Op.lte]: 12 } })
    await queryInterface.bulkInsert('attribute', [
      { id: 1, name: 'Bản đồ' },
      { id: 2, name: 'Camera hành trình' },
      { id: 3, name: 'Cảnh báo tốc độ' },
      { id: 4, name: 'Khe cắm USB' },
      { id: 5, name: 'Màn hình DVD' },
      { id: 6, name: 'Thu phí không dừng' },
      { id: 7, name: 'Bluetooth' },
      { id: 8, name: 'Camera lùi' },
      { id: 9, name: 'Định vị GPS' },
      { id: 10, name: 'Lốp dự phòng' },
      { id: 11, name: 'Nắp thùng xe bán tải' },
      { id: 12, name: 'Túi khí an toàn' },
    ]);
  },
};
