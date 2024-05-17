'use strict';
const zones = require('../shared/mocks/zone.json');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkDelete('vehicle_brand')
    await queryInterface.bulkInsert('vehicle_brand', [
      { id: 1, vehicle_type: 'C', name: 'Toyota', position: 1 },
      { id: 2, vehicle_type: 'C', name: 'Hyundai', position: 1 },
      { id: 3, vehicle_type: 'C', name: 'Kia', position: 1 },
      { id: 4, vehicle_type: 'C', name: 'Ford', position: 0 },
      { id: 5, vehicle_type: 'C', name: 'Honda', position: 1 },
      { id: 6, vehicle_type: 'C', name: 'GM Daewoo', position: 0 },
      { id: 7, vehicle_type: 'C', name: 'Chevrolet', position: 0 },
      { id: 8, vehicle_type: 'C', name: 'Mazda', position: 1 },
      { id: 9, vehicle_type: 'C', name: 'Nissan', position: 0 },
      { id: 10, vehicle_type: 'C', name: 'Mitsubishi', position: 0 },
      { id: 11, vehicle_type: 'C', name: 'Daihatsu', position: 0 },
      { id: 12, vehicle_type: 'C', name: 'Isuzu', position: 0 },
      { id: 13, vehicle_type: 'C', name: 'Suzuki', position: 0 },
      { id: 14, vehicle_type: 'C', name: 'SSangyong', position: 0 },
      { id: 15, vehicle_type: 'C', name: 'Subaru', position: 0 },
      { id: 16, vehicle_type: 'C', name: 'Fiat', position: 0 },
      { id: 17, vehicle_type: 'C', name: 'Audi', position: 0 },
      { id: 18, vehicle_type: 'C', name: 'BMW', position: 0 },
      { id: 19, vehicle_type: 'C', name: 'Mercedes-Benz', position: 0 },
      { id: 20, vehicle_type: 'C', name: 'Mini', position: 0 },
      { id: 21, vehicle_type: 'C', name: 'Lexus', position: 0 },
      { id: 22, vehicle_type: 'C', name: 'Peugeot', position: 0 },
      { id: 23, vehicle_type: 'C', name: 'Porsche', position: 0 },
      { id: 24, vehicle_type: 'C', name: 'Renault', position: 0 },
      { id: 25, vehicle_type: 'C', name: 'Volkswagen', position: 0 },
      { id: 26, vehicle_type: 'C', name: 'Volvo', position: 0 },
      { id: 27, vehicle_type: 'C', name: 'Jaguar', position: 0 },
      { id: 28, vehicle_type: 'C', name: 'Land Rover', position: 0 },
      { id: 29, vehicle_type: 'C', name: 'Honda', position: 1 },
      { id: 30, vehicle_type: 'C', name: 'Yamaha', position: 1 },
      { id: 31, vehicle_type: 'C', name: 'Suzuki', position: 0 },
      { id: 32, vehicle_type: 'C', name: 'Piaggio', position: 0 },
      { id: 33, vehicle_type: 'C', name: 'SYM', position: 0 },
      { id: 34, vehicle_type: 'C', name: 'Ducati', position: 0 },
      { id: 35, vehicle_type: 'C', name: 'Baic', position: 0 },
      { id: 36, vehicle_type: 'C', name: 'Kawasaki', position: 0 },
      { id: 37, vehicle_type: 'C', name: 'Vinfast', position: 1 },
      { id: 38, vehicle_type: 'C', name: 'Vinfast', position: 0 },
      { id: 39, vehicle_type: 'C', name: 'Kymco', position: 0 },
    ], {});
  },
};
