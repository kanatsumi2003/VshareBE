/* eslint-disable no-undef */
require("module-alias/register");

const BranchService = require("../services/BranchService");
const BranchVehicleService = require("../services/BranchVehicleService");
const CustomerService = require("../services/CustomerService");
const VehicleService = require("../services/VehicleService");

const 
  chai = require("chai"),
  moment = require("moment"),
  chaiHttp = require("chai-http"),
  expect = chai.expect,
  constants = require("../constants"),
  server = require("./index.test"),
  { faker } = require('@faker-js/faker');

chai.use(chaiHttp);

const data = {
  vehicle_type: constants.VEHICLE_TYPE_CAR,
  branch_id: null, //late
  fullname: faker.name.fullName(),
  email: "nguyen@gmail.com",
  phone: "0999999999",
  address: "Address",
  estimate_branch_vehicle_id: null, //late
  estimate_price: 900000,
  receive_type: constants.RECEIVE_TYPE_HOME,
  estimate_receive_datetime: moment().format('YYYY-MM-DD HH:mm'),
  estimate_return_datetime: moment().add(2, 'day').format('YYYY-MM-DD HH:mm'),
  estimate_rental_duration: "2",
  payment_method: constants.PAYMENT_METHOD_BANK,
  add_ons: [
    { code: constants.ADDON_INSURANCE, cost: 120000, qty: 1 },
    { code: constants.ADDON_KID_CHAIR, cost: 100000, qty: 2 },
  ],
  discount_code: '',
  source: 'app',
};
let testId, tmpBranch, tmpBranchVehicle, customerId;

before(async () => {
  // Fake branch
  const branch = await BranchService.getOne({});
  if (!branch) {
    const branchName = uniqueNamesGenerator({ dictionaries: [names] });
    const branchData = {
      name: branchName,
      address: "Số 5 Vũ Tông Phan, Khương Trung, Thanh Xuân, Hà Nội",
      latlng: "21.0221987,105.8172885",
      rental_time_from: "07:00",
      rental_time_to: "21:00",
      limit_km: 0,
      overkm_fee: 0,
      overtime_fee: 0,
      free_delivery_km: 0,
      delivery_fee: 0,
    };
    tmpBranch = await BranchService.create(branchData);
    data.branch_id = tmpBranch.id;
  } else {
    data.branch_id = branch.id;
  }
  // Fake branch vehicle
  const branchVehicle = await BranchVehicleService.getOne({});
  if (!branchVehicle) {
    const branchVehicleData = {
      vehicle_id: 1,
      branch_id: branch ? branch.id : tmpBranch.id,
      license_number: "29A-12217",
      rental_type: "all",
      rental_date: "2020-10-10",
      owner_id: null,
      owner_day_price: 1000000,
      owner_month_price: 14000000,
      owner_month_km_limit: 5000,
      owner_overkm_price: 3000,
      customer_base_price: 900000,
      customer_weekend_price: 1000000,
      customer_month_price: 18000000,
      customer_month_km_limit: 3000,
      customer_overkm_price: 5000,
      customer_overtime_price: 5000,
      position_company: "",
      position_username: "",
      position_password: "",
      has_maintain: false,
      has_insurance: false,
      insurance_brand: "",
      insurance_phone: "",
      insurance_expire_date: "",
      etc_username: "",
      etc_password: "",
      registry_date: "2020-10-28",
      current_km: 10000,
    };
    const vehicle = await VehicleService.getOne({});
    if (vehicle) {
      branchVehicleData.vehicle_id = vehicle.id;
    }
    tmpBranchVehicle = await BranchVehicleService.create(branchVehicleData);
    data.estimate_branch_vehicle_id = tmpBranchVehicle.id;
  } else {
    data.estimate_branch_vehicle_id = branchVehicle.id;
  }
});

describe("Test Customer app module", function () {
  it("create new booking successful", function (done) {
    console.log(data);
    chai
      .request(server)
      .post("/api/v1/customer-app/bookings")
      .set("content-type", "application/json")
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).have.property("data");
        testId = res.body.data.id;
        customerId = res.body.data.customer_id;
        done();
      });
  });
  it("create new booking should be error when field required is missing", function (done) {
    const invalidData = Object.assign({}, data);
    delete invalidData.fullname;
    chai
      .request(server)
      .post("/api/v1/bookings")
      .set("content-type", "application/json")
      .send(invalidData)
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
  it("booking detail should has properties equal after created", function (done) {
    chai
      .request(server)
      .get("/api/v1/bookings/" + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body.data.branch_id).to.equal(data.branch_id);
        expect(res.body.data.estimate_branch_vehicle_id).to.equal(data.estimate_branch_vehicle_id);
        expect(res.body.data.total_addon_amount).to.equal(data.add_ons.reduce((a, b) => a + b.cost, 0));
        expect(res.body.data.fullName).to.equal(data.fullName);
        expect(res.body.data.estimate_receive_datetime).to.equal(data.estimate_receive_datetime);
        expect(res.body.data.estimate_return_datetime).to.equal(data.estimate_return_datetime);
        done();
      });
  });
  it("delete booking successful", function (done) {
    chai
      .request(server)
      .delete("/api/v1/bookings/" + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  it("delete booking should be failed because booking is deleted", function (done) {
    chai
      .request(server)
      .delete("/api/v1/bookings/" + testId)
      .end((_, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
});

after(async () => {
  if (tmpBranch) {
    await BranchService.deleteById(tmpBranch.id);
  }
  if (tmpBranchVehicle) {
    await BranchVehicleService.deleteById(tmpBranchVehicle.id);
  }
  if (customerId) {
    await CustomerService.deleteById(customerId);
  }
});
