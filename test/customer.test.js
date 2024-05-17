/* eslint-disable no-undef */
require("module-alias/register");

const chai = require("chai"),
  chaiHttp = require("chai-http"),
  expect = chai.expect,
  { uniqueNamesGenerator, names } = require("unique-names-generator"),
  BranchService = require("@service/BranchService"),
  // constants = require('../constants'),
  server = require("./index.test");

chai.use(chaiHttp);

const fullname = uniqueNamesGenerator({ dictionaries: [names] }),
  phone = `${Math.floor(100000000 + Math.random() * 900000000)}`,
  data = {
    fullname,
    email: `${fullname}@gmail.com`,
    phone,
    zalo: "https://zalo.me/2761260980408892837",
    // password: "123456",
    birthday: "2000-10-10",
    identity_number: "12313123",
    identity_date: "2000-10-10",
    driver_licence: "1231312312",
    driver_licence_date: "2000-10-10",
    house_hold: "1231312312",
    house_hold_date: "2000-10-10",
    other_paper: "",
    other_paper_note: "",
    asset_deposit: "motor",
    asset_deposit_note: "Honda Airblade",
    address: "Số 5 Vũ Tông Phan, Khương Trung, Thanh Xuân, Hà Nội",
    customer_note: "",
    // trust_scores: [],
    branch_id: null,
    // customer_image: {
    //   [constants.CUSTOMER_IMAGE_IDENTITY_FRONT]: ['https://example.com/image.jpg'],
    //   [constants.CUSTOMER_IMAGE_IDENTITY_BACK]: [''],
    //   [constants.CUSTOMER_IMAGE_DRIVER_LICENCE_FRONT]: [''],
    //   [constants.CUSTOMER_IMAGE_DRIVER_LICENCE_BACK]: [''],
    //   [constants.CUSTOMER_IMAGE_HOUSE_HOLD]: [''],
    //   [constants.CUSTOMER_IMAGE_OTHER_PAPER]: [''],
    //   [constants.CUSTOMER_IMAGE_ASSET_DEPOSIT]: ['https://example.com/image.jpg', 'https://example.com/image.jpg'],
    // },
    customer_image_identity_front: 'https://example.com/image.jpg',
    customer_image_identity_back: 'https://example.com/image.jpg',
    customer_image_driver_licence_front: '',
    customer_image_driver_licence_back: '',
    customer_image_house_hold: [],
    customer_image_other_paper: [],
    customer_image_asset_deposit: ['https://example.com/image.jpg', 'https://example.com/image.jpg'],
    verify_identity: 0,
    verify_driver_licence: 1,
    verify_house_hold: 0,
    verify_other_paper: 1,
    verify_asset_deposit: 0,
  };

let testId, tmpBranch;

before(async () => {
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
});

describe("Test Customer module", function () {
  it("create new customer successful", function (done) {
    // console.log(data);
    chai
      .request(server)
      .post("/api/v1/customers")
      .set("content-type", "application/json")
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).have.property("data");
        testId = res.body.data.id;
        done();
      });
  });
  it("get list customers", function (done) {
    chai
      .request(server)
      .get("/api/v1/customers")
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).to.have.property("total");
        expect(res.body.total).greaterThan(0);
        done();
      });
  });
  it("get list customers with params", function (done) {
    chai
      .request(server)
      .get(`/api/v1/customers?phone=${phone}&email=${fullname}&fullname=${fullname}`)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).to.have.property("total");
        expect(res.body.total).greaterThan(0);
        done();
      });
  });
  it("create new customer should be error dupplicate data", function (done) {
    chai
      .request(server)
      .post("/api/v1/customers")
      .set("content-type", "application/json")
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(409);
        done();
      });
  });
  it("create new customer failed with not existed trust_score_config id", function (done) {
    // console.log(data);
    chai
      .request(server)
      .post("/api/v1/customers")
      .set("content-type", "application/json")
      .send({ ...data, trust_scores: [999999999], phone: `0${phone}` })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
  it("create new customer should be error dupplicate phone", function (done) {
    chai
      .request(server)
      .post("/api/v1/customers")
      .set("content-type", "application/json")
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(409);
        done();
      });
  });
  it("create new customer should be error with invalid email", function (done) {
    chai
      .request(server)
      .post("/api/v1/customers")
      .set("content-type", "application/json")
      .send({ ...data, email: "email" })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
  it("create new customer should be error with invalid password length", function (done) {
    chai
      .request(server)
      .post("/api/v1/customers")
      .set("content-type", "application/json")
      .send({ ...data, password: "123" })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
  it("create new customer should be error when phone field missing", function (done) {
    const invalidData = Object.assign({}, data);
    delete invalidData.phone;
    chai
      .request(server)
      .post("/api/v1/customers")
      .set("content-type", "application/json")
      .send(invalidData)
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
  it("create new customer should be error when email field missing", function (done) {
    const invalidData = Object.assign({}, data);
    delete invalidData.email;
    chai
      .request(server)
      .post("/api/v1/customers")
      .set("content-type", "application/json")
      .send(invalidData)
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
  it("customer detail should has properties equal after created", function (done) {
    chai
      .request(server)
      .get("/api/v1/customers/" + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body.data.phone).to.equal(data.phone);
        expect(res.body.data.zalo).to.equal(data.zalo);
        expect(res.body.data.fullname).to.equal(data.fullname);
        expect(res.body.data.email).to.equal(data.email);
        expect(res.body.data.address).to.equal(data.address);
        expect(res.body.data.customer_note).to.equal(data.customer_note);
        expect(res.body.data.branch_id).to.equal(data.branch_id);
        expect(res.body.data.house_hold).to.equal(data.house_hold);
        expect(res.body.data.house_hold_date).to.equal(data.house_hold_date);
        expect(res.body.data.other_paper).to.equal(data.other_paper);
        expect(res.body.data.other_paper_note).to.equal(data.other_paper_note);
        expect(res.body.data.asset_deposit).to.equal(data.asset_deposit);
        expect(res.body.data.asset_deposit_note).to.equal(data.asset_deposit_note);
        expect(res.body.data.referral_code).to.not.eq(null);
        done();
      });
  });
  it("update customer successful", function (done) {
    chai
      .request(server)
      .put("/api/v1/customers/" + testId)
      .set("content-type", "application/json")
      .send({ phone: "0999999998", email: "email-test@gmail.com" })
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  it("customer detail should has properties equal the previous after updated", function (done) {
    chai
      .request(server)
      .get("/api/v1/customers/" + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body.data.phone).to.equal("0999999998");
        expect(res.body.data.zalo).to.equal(data.zalo);
        expect(res.body.data.fullname).to.equal(data.fullname);
        expect(res.body.data.email).to.equal("email-test@gmail.com");
        expect(res.body.data.address).to.equal(data.address);
        done();
      });
  });
  it("update customer successful when change phone from 0x to 84x", function (done) {
    chai
      .request(server)
      .put("/api/v1/customers/" + testId)
      .set("content-type", "application/json")
      .send({ phone: "84999999998" })
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  it("phone should be updated new value", function (done) {
    chai
      .request(server)
      .get("/api/v1/customers/" + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body.data.phone).to.equal("84999999998");
        done();
      });
  });
  it("delete customer successful", function (done) {
    chai
      .request(server)
      .delete("/api/v1/customers/" + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  it("delete customer should be failed because customer is deleted", function (done) {
    chai
      .request(server)
      .delete("/api/v1/customers/" + testId)
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
});
