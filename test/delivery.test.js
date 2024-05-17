/* eslint-disable no-undef */
require("module-alias/register");

const chai = require("chai"),
  chaiHttp = require("chai-http"),
  expect = chai.expect,
  Op = require("sequelize").Op,
  db = require("../models"),
  constants = require("../constants"),
  server = require("./index.test");

chai.use(chaiHttp);

const data = {
  receive_note: "Ghi chú khi giao xe",
  return_note: "Ghi chú khi nhận xe",
  receive_km: 35210,
  return_km: 36210,
  receive_fuel: 100,
  return_fuel: 80,
  receive_etc_balance: 300000,
  return_etc_balance: 100000,
  deposit: {
    [constants.DEPOSIT_MOTOR]: "Xe Ari Blade 2020",
    [`${constants.DEPOSIT_MOTOR}_returned`]: false,
    [constants.DEPOSIT_MOTOR_REGISTRATION]: "30F2-47122",
    [`${constants.DEPOSIT_MOTOR_REGISTRATION}_returned`]: true,
    [constants.DEPOSIT_CASH]: 10000000,
    [constants.DEPOSIT_OTHER]: null,
    [`${constants.DEPOSIT_OTHER}_returned`]: true,
  },
  deposit_images: ["https://example.com/image.jpg"],
  before_car_image: {
    [constants.CAR_IMAGE_FRONT]: "",
    [constants.CAR_IMAGE_BACK]: "",
    [constants.CAR_IMAGE_RIGHT]: "",
    [constants.CAR_IMAGE_LEFT]: "",
  },
  after_car_image: {
    [constants.CAR_IMAGE_FRONT]: "",
    [constants.CAR_IMAGE_BACK]: "",
    [constants.CAR_IMAGE_RIGHT]: "",
    [constants.CAR_IMAGE_LEFT]: "",
  },
  delivery_status: constants.DELIVERY_STATUS_RETURNED,
};
let bookingId;

before(async () => {
  const booking = await db.booking.findOne({
    where: {
      level: {
        [Op.in]: ['L4', 'L5', 'L6', 'L7', 'L8']
      }
    },
    attributes: ['id'],
  });

  if (booking && booking.id) {
    bookingId = booking.id
  }
});

describe("Test Delivery module", async function () {
  it("Update delivery by bookingId successful", function (done) {
    if (!bookingId) return;
    console.log(data);
    chai
      .request(server)
      .put("/api/v1/delivery-tasks/booking/" + bookingId)
      .set("content-type", "application/json")
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).have.property("data");
        done();
      });
  });
  it("the delivery data should be equal the previous", function (done) {
    chai
      .request(server)
      .get("/api/v1/delivery-tasks/booking/" + bookingId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body.data.receive_km).to.equal(data.receive_km);
        expect(res.body.data.return_km).to.equal(data.return_km);
        expect(res.body.data.receive_fuel).to.equal(data.receive_fuel);
        expect(res.body.data.return_fuel).to.equal(data.return_fuel);
        expect(res.body.data.receive_etc_balance).to.equal(data.receive_etc_balance);
        expect(res.body.data.return_etc_balance).to.equal(data.return_etc_balance);
        expect(Object.keys(res.body.data.before_car_image).length).to.greaterThanOrEqual(Object.keys(data.before_car_image).length);
        expect(Object.keys(res.body.data.after_car_image).length).to.eq(Object.keys(data.after_car_image).length);
        expect(res.body.data.receive_note).to.equal(data.receive_note);
        expect(res.body.data.return_note).to.equal(data.return_note);
        expect(res.body.data.deposit[`${constants.DEPOSIT_MOTOR}_returned`]).to.equal(false);
        expect(res.body.data.deposit_images.length).to.equal(data.deposit_images.length);
        expect(res.body.data).to.have.property('branch');
        expect(res.body.data.branch).to.have.property('bank_name');
        expect(res.body.data.branch).to.have.property('bank_account_name');
        expect(res.body.data.branch).to.have.property('bank_account_number');
        expect(res.body.data.branch).to.have.property('bank_branch_name');
        done();
      });
  });
});
