/* eslint-disable no-undef */
require("module-alias/register");
const moment = require('moment');
const BranchService = require("../services/BranchService");
const BranchVehicleService = require("../services/BranchVehicleService");
const { Op } = require("sequelize");

const chai = require("chai"),
  chaiHttp = require("chai-http"),
  expect = chai.expect,
  constants = require("../constants"),
  server = require("./index.test"),
  { faker } = require('@faker-js/faker');

chai.use(chaiHttp);

let bookingId;
const data = {
  fullname: faker.name.fullName(),
  phone: faker.phone.number('84#########'),
  estimate_branch_vehicle_id: null,
  estimate_receive_datetime: moment(faker.date.soon()).format('YYYY-MM-DD HH:mm'),
  estimate_return_datetime: moment(faker.date.soon(10)).format('YYYY-MM-DD HH:mm'),
  level: 'L4',
  booked_status: constants.BOOKED_STATUS_DEPOSIT,
}

before(async () => {
  const branches = await BranchService.findAll({}, { attributes: ['id'] });
  const branchVehicle = await BranchVehicleService.getOne({
    branch_id: {
      [Op.in]: branches.map(b => b.id)
    }
  });
  data.estimate_branch_vehicle_id = branchVehicle.id;
});

describe("Test Booking module", function () {
  it("create quick booking successful", function (done) {
    console.log(data);
    chai
      .request(server)
      .post("/api/v1/bookings/quick-booking")
      .set("content-type", "application/json")
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).have.property("data");
        bookingId = res.body.data.id;
        done();
      });
  });
  it("delete booking after created", function (done) {
    chai
      .request(server)
      .delete("/api/v1/bookings/" + bookingId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});
