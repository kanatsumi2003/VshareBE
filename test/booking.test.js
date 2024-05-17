/* eslint-disable no-undef */
require("module-alias/register");

const BranchService = require("../services/BranchService");
const BranchVehicleService = require("../services/BranchVehicleService");
const VehicleService = require("../services/VehicleService");

const chai = require("chai"),
  chaiHttp = require("chai-http"),
  expect = chai.expect,
  constants = require("../constants"),
  server = require("./index.test"),
  { uniqueNamesGenerator, names } = require("unique-names-generator");

chai.use(chaiHttp);

const data = {
  vehicle_type: constants.VEHICLE_TYPE_CAR,
  branch_id: null, //late
  fullname: uniqueNamesGenerator({ dictionaries: [names] }),
  email: "nguyen@gmail.com",
  phone: "0999999999",
  address: "Address",
  identity_number: "123456789",
  identity_date: "2020-01-10",
  driver_licence_number: "",
  driver_licence_date: "2020-01-10",
  trust_score: 100,
  approve_by: null,
  approve_status: constants.APPROVE_STATUS_FAILED,
  approve_note: "",
  estimate_branch_vehicle_id: null, //late
  actual_branch_vehicle_id: null, //late
  estimate_prepay: 300000,
  prepay: 300000,
  estimate_price: 900000,
  actual_price: 1100000,
  receive_note: "Ghi chú khi giao xe",
  return_note: "Ghi chú khi nhận xe",
  receive_type: constants.RECEIVE_TYPE_HOME,
  estimate_receive_datetime: "2022-10-20 10:00",
  estimate_return_datetime: "2022-10-22 10:00",
  estimate_rental_duration: "2d",
  receive_km: 35210,
  return_km: 36210,
  receive_fuel: 100,
  return_fuel: 80,
  actual_receive_datetime: "2022-10-20 10:00",
  actual_return_datetime: "2022-10-22 10:00",
  actual_rental_duration: "2d",
  level: "C3",
  deposit: {
    [constants.DEPOSIT_MOTOR]: "Xe Ari Blade 2020",
    [constants.DEPOSIT_MOTOR_REGISTRATION]: "30F2-47122",
    [constants.DEPOSIT_CASH]: 10000000,
    [constants.DEPOSIT_OTHER]: null,
    [`${constants.DEPOSIT_IDENTITY_PAPER}_returned`]: true,
    [`${constants.DEPOSIT_MOTOR}_returned`]: true,
    [`${constants.DEPOSIT_MOTOR_REGISTRATION}_returned`]: false,
  },
  deposit_images: ["https://example.com/image.jpg"],
  source: "web",
  payment_method: null,
  other_costs: [
    {
      code: constants.OTHER_COST_OVERKM,
      cost: 50000,
      note: "Phí vượt quá 3 km",
    },
  ],
  customer_image: {
    [constants.CUSTOMER_IMAGE_IDENTITY_FRONT]: "",
    [constants.CUSTOMER_IMAGE_IDENTITY_BACK]: "",
    [constants.CUSTOMER_IMAGE_DRIVER_LICENCE_FRONT]: "",
    [constants.CUSTOMER_IMAGE_DRIVER_LICENCE_BACK]: "",
    [constants.CUSTOMER_IMAGE_HOUSE_HOLD]: "",
  },
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
  booking_paper: {
    [constants.BOOKING_CUSTOMER_CONTRACT]: "",
    [constants.BOOKING_RECEIVE_REPORT]: "",
  },
  hold_customer_note: "Đăng ký xe, tiền cọc 15 triệu.",
  vehicle_full: true,
  receive_vehicle_status: "Tróc sơn ở đuôi xe",
  return_vehicle_status: "Xước nắp cabin",
  delivery_fee: 100000,
  estimate_add_ons: [
    { code: constants.ADDON_INSURANCE, cost: 100000 },
    { code: constants.ADDON_KID_CHAIR, cost: 90000 },
  ],
  add_ons: [
    { code: constants.ADDON_INSURANCE, cost: 120000 },
    { code: constants.ADDON_KID_CHAIR, cost: 100000 },
  ],
  customer_other_document_files: ["https://example.com/image.jpg"],
  discount_code: '',
  estimate_discount_amount: 18000,
  discount_amount: 15000,
  vat_cost: 11000,
  total_amount: 1700000,
  operation_costs: [
    {
      code: constants.OPERATION_COST_ETC_DEPOSIT,
      cost: 50000,
      note: "Vshare nạp",
    },
    {
      code: constants.OPERATION_COST_MOVING,
      cost: 100000,
    },
  ],
  post_operation_costs: [
    {
      code: constants.OPERATION_COST_REPAIR,
      cost: 2000000,
    },
    {
      code: constants.OPERATION_COST_CAR_PARKING,
      cost: 200000,
    },
  ],
  return_customer_assets: true,
  hold_customer_return_date: "2022-10-10",
  hold_customer_reason: "Chưa trả đủ tiền thuê xe",
  return_vehicle_same: false,
  final_note: "Ghi chú sau khi kết thúc hợp đồng",
  estimate_after_discount_amount: 1200000,
  estimate_total_addon_amount: 100000,
  estimate_total_amount: 1300000,
  estimate_delivery_fee: 100000,
  estimate_vat_cost: 130000,
  total_addon_amount: 100000,
  contract_receive_datetime: "2022-12-23 10:00",
  contract_return_datetime: "2022-12-26 21:00",
  contract_rental_duration: "4d",
  liquid_total_addon: 123000,
  liquid_total_amount: 123000,
  liquid_total_amount_after_settlement: 123000,
  liquid_paid_amount: 123000,
  liquid_total_amount_left: 123000,
};
let testId, tmpBranch, tmpBranchVehicle;

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
    data.actual_branch_vehicle_id = tmpBranchVehicle.id;
  } else {
    data.estimate_branch_vehicle_id = branchVehicle.id;
    data.actual_branch_vehicle_id = branchVehicle.id;
  }
});

describe("Test Booking module", function () {
  it("create new booking successful", function (done) {
    console.log(data);
    chai
      .request(server)
      .post("/api/v1/bookings")
      .set("content-type", "application/json")
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).have.property("data");
        testId = res.body.data.id;
        done();
      });
  });
  it("get list bookings", function (done) {
    chai
      .request(server)
      .get("/api/v1/bookings")
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body.total).greaterThan(0);
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
        expect(res.body.data.delivery_fee).to.equal(data.delivery_fee);
        expect(res.body.data.estimate_add_ons.length).to.equal(data.estimate_add_ons.length);
        expect(res.body.data.total_addon_amount).to.equal(data.add_ons.reduce((a, b) => a + b.cost, 0));
        expect(res.body.data.customer_other_document_files.length).to.eq(1);
        expect(res.body.data.final_note).to.equal(data.final_note);
        expect(res.body.data.receive_note).to.equal(data.receive_note);
        expect(res.body.data.return_note).to.equal(data.return_note);
        expect(res.body.data.estimate_after_discount_amount).to.equal(data.estimate_after_discount_amount);
        expect(res.body.data.estimate_total_addon_amount).to.equal(data.estimate_total_addon_amount);
        expect(res.body.data.estimate_total_amount).to.equal(data.estimate_total_amount);
        expect(res.body.data.estimate_delivery_fee).to.equal(data.estimate_delivery_fee);
        expect(res.body.data.estimate_vat_cost).to.equal(data.estimate_vat_cost);
        expect(res.body.data.contract_receive_datetime).to.equal(data.contract_receive_datetime);
        expect(res.body.data.contract_return_datetime).to.equal(data.contract_return_datetime);
        expect(res.body.data.liquid_total_addon).to.equal(data.liquid_total_addon);
        expect(res.body.data.liquid_total_amount).to.equal(data.liquid_total_amount);
        expect(res.body.data.liquid_total_amount_after_settlement).to.equal(data.liquid_total_amount_after_settlement);
        expect(res.body.data.liquid_paid_amount).to.equal(data.liquid_paid_amount);
        expect(res.body.data.liquid_total_amount_left).to.equal(data.liquid_total_amount_left);
        expect(res.body.data.deposit[`${constants.DEPOSIT_IDENTITY_PAPER}_returned`]).to.equal(data.deposit[`${constants.DEPOSIT_IDENTITY_PAPER}_returned`]);
        expect(res.body.data.deposit[`${constants.DEPOSIT_MOTOR}_returned`]).to.equal(data.deposit[`${constants.DEPOSIT_MOTOR}_returned`]);
        expect(res.body.data.deposit[`${constants.DEPOSIT_MOTOR_REGISTRATION}_returned`]).to.equal(data.deposit[`${constants.DEPOSIT_MOTOR_REGISTRATION}_returned`]);
        done();
      });
  });
  const customerFullname = uniqueNamesGenerator({ dictionaries: [names] });
  let
    estimate_after_discount_amount = 1100000,
    estimate_total_addon_amount = 100000,
    total_addon_amount = 100000,
    estimate_total_amount = 1350000,
    estimate_delivery_fee = 110000,
    estimate_vat_cost = 135000,
    contract_receive_datetime = '2022-12-22 15:00',
    contract_rental_duration = '5d'

  it("update booking", function (done) {
    chai
      .request(server)
      .put("/api/v1/bookings/" + testId)
      .set("content-type", "application/json")
      .send({
        fullname: customerFullname,
        level: "L5",
        booking_status: constants.BOOKING_STATUS_RECEIVED,
        estimate_after_discount_amount,
        estimate_total_addon_amount,
        total_addon_amount,
        estimate_total_amount,
        estimate_delivery_fee,
        estimate_vat_cost,
        contract_receive_datetime,
        contract_rental_duration,
      })
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  it("booking detail should has properties equal the previous after updated", function (done) {
    chai
      .request(server)
      .get("/api/v1/bookings/" + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body.data.fullname).to.equal(customerFullname);
        expect(res.body.data.level).to.equal("L5");
        expect(res.body.data.receive_km).to.equal(data.receive_km);
        expect(res.body.data.return_km).to.equal(data.return_km);
        expect(res.body.data.receive_fuel).to.equal(data.receive_fuel);
        expect(res.body.data.return_fuel).to.equal(data.return_fuel);
        expect(res.body.data.deposit_images.length).to.equal(data.deposit_images.length);
        expect(res.body.data.other_costs.length).to.equal(data.other_costs.length);
        expect(res.body.data.operation_costs.length).to.equal(data.operation_costs.length);
        expect(res.body.data.post_operation_costs.length).to.equal(data.post_operation_costs.length);
        expect(res.body.data.return_customer_assets).to.equal(true);
        expect(res.body.data.hold_customer_return_date).to.equal("2022-10-10");
        expect(res.body.data.hold_customer_reason).to.equal("Chưa trả đủ tiền thuê xe");
        expect(res.body.data.return_vehicle_same).to.equal(false);
        expect(res.body.data.booking_status).to.equal(constants.BOOKING_STATUS_RECEIVED);
        expect(res.body.data.estimate_prepay).to.equal(data.estimate_prepay);
        expect(res.body.data.estimate_discount_amount).to.equal(data.estimate_discount_amount);
        expect(res.body.data.discount_amount).to.equal(data.discount_amount);
        expect(res.body.data.estimate_price).to.equal(data.estimate_price);
        expect(res.body.data.actual_price).to.equal(data.actual_price);
        expect(res.body.data.other_cost).to.equal(data.other_costs.reduce((a, b) => a + b.cost, 0));
        expect(res.body.data.operation_cost).to.equal(data.operation_costs.reduce((a, b) => a + b.cost, 0));
        expect(res.body.data.post_operation_cost).to.equal(data.post_operation_costs.reduce((a, b) => a + b.cost, 0));
        expect(res.body.data.estimate_after_discount_amount).to.equal(estimate_after_discount_amount);
        expect(res.body.data.estimate_total_addon_amount).to.equal(estimate_total_addon_amount);
        expect(res.body.data.estimate_total_amount).to.equal(estimate_total_amount);
        expect(res.body.data.estimate_delivery_fee).to.equal(estimate_delivery_fee);
        expect(res.body.data.estimate_vat_cost).to.equal(estimate_vat_cost);
        expect(res.body.data.total_addon_amount).to.equal(total_addon_amount);
        expect(res.body.data.contract_receive_datetime).to.equal(contract_receive_datetime),
        expect(res.body.data.contract_rental_duration).to.equal(contract_rental_duration),
        done();
      });
  });
  it("update booking code base on the add-ons changed", function (done) {
    chai
      .request(server)
      .put("/api/v1/bookings/" + testId)
      .set("content-type", "application/json")
      .send({
        add_ons: [{ code: constants.ADDON_DRIVER, cost: 120000, unit: "đ" }],
      })
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  it("booking code should be changed after change add-on service", function (done) {
    chai
      .request(server)
      .get("/api/v1/bookings/" + testId)
      .set("content-type", "application/json")
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data.code).to.includes(constants.BOOKING_SERVICE_RENTAL_DRIVER);
        done();
      });
  });
  it("booking L8 update successfull", function (done) {
    console.log(data);
    chai
      .request(server)
      .put("/api/v1/bookings/" + testId)
      .set("content-type", "application/json")
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(200);
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
});
