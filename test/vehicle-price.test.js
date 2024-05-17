/* eslint-disable no-undef */
require("module-alias/register");
const chai = require("chai"),
  chaiHttp = require("chai-http"),
  { uniqueNamesGenerator, names } = require("unique-names-generator"),
  expect = chai.expect,
  BranchService = require("../services/BranchService"),
  server = require("./index.test");

const { VEHICLE_CLASS_A } = require("../constants");

chai.use(chaiHttp);

const data = {
  branch_id: [], // update later
  vehicle_class: VEHICLE_CLASS_A,
  base_price: 1000000,
  weekend_price: 14000000,
  month_price: 5000,
  customer_day_price_rules: [
    {
      day_count_from: 1,
      day_count_to: 7,
      price: 100,
    },
  ],
};
let tmp_branch_id, testId;

before(async () => {
  const { rows: branchs } = await BranchService.getAll({ limit: 2 });
  if (branchs.length) {
    data.branch_id = branchs.map((b) => b.id);
  } else {
    branch = await BranchService.create({
      name: uniqueNamesGenerator({ dictionaries: [names] }),
      province_id: 1000018,
      district_id: 2000163,
      address: "Branch Address Test",
    });
    tmp_branch_id = branch.id;
    data.branch_id = [branch.id];
  }
});

describe("Test VehiclePriceTemplate module", function () {
  it("create new template successful", function (done) {
    console.log(data);
    chai
      .request(server)
      .post("/api/v1/vehicle-prices")
      .set("content-type", "application/json")
      .send(data)
      .end((err, res) => {
        console.log(err);
        expect(res).to.have.status(200);
        expect(res.body).have.property("data");
        console.log(res.body.data);
        expect(res.body.data.length).to.gte(1);
        testId = res.body.data[0].id;
        done();
      });
  });
  it("create new template should be return error because both branch_id field and owner_id are null", function (done) {
    chai
      .request(server)
      .post("/api/v1/vehicle-prices")
      .set("content-type", "application/json")
      .send({ ...data, branch_id: 0, owner_id: 0 })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
  it("create new template should be return error because branch not exist", function (done) {
    chai
      .request(server)
      .post("/api/v1/vehicle-prices")
      .set("content-type", "application/json")
      .send({ ...data, branch_id: 9999999 })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
  it("create new template failed with missing required fields ", function (done) {
    const cloneData = { ...data };
    delete cloneData.branch_id;
    delete cloneData.vehicle_class;
    chai
      .request(server)
      .post("/api/v1/vehicle-prices")
      .set("content-type", "application/json")
      .send(cloneData)
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
  it("get list template", function (done) {
    chai
      .request(server)
      .get("/api/v1/vehicle-prices")
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body.total).greaterThan(0);
        done();
      });
  });
  it("price template should has properties equal after created", function (done) {
    chai
      .request(server)
      .get("/api/v1/vehicle-prices/" + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body.data.vehicle_class).to.equal(data.vehicle_class);
        expect(res.body.data.base_price).to.equal(data.base_price);
        expect(res.body.data.weekend_price).to.equal(data.weekend_price);
        expect(res.body.data.month_price).to.equal(data.month_price);
        expect(res.body.data.customer_day_price_rules.length).to.equal(data.customer_day_price_rules.length);
        done();
      });
  });
  it("update data shoulb be failed because invalid price", function (done) {
    chai
      .request(server)
      .put("/api/v1/vehicle-prices/" + testId)
      .set("content-type", "application/json")
      .send({ rental_type: "month", base_price: 0, weekend_price: 0, month_price: 0 })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
  it("update price successful", function (done) {
    chai
      .request(server)
      .put("/api/v1/vehicle-prices/" + testId)
      .set("content-type", "application/json")
      .send({
        base_price: 900000,
        weekend_price: 6000000,
        month_price: 15000000,
        customer_day_price_rules: [
          {
            day_count_from: 1,
            day_count_to: 7,
            price: 100,
          },
          {
            day_count_from: 8,
            day_count_to: 10,
            price: 90,
          },
        ],
      })
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  it("price template should has properties equal the previous after updated", function (done) {
    chai
      .request(server)
      .get("/api/v1/vehicle-prices/" + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body.data.vehicle_class).to.equal(data.vehicle_class);
        expect(res.body.data.base_price).to.equal(900000);
        expect(res.body.data.weekend_price).to.equal(6000000);
        expect(res.body.data.month_price).to.equal(15000000);
        expect(res.body.data.customer_day_price_rules.length).to.equal(2);
        done();
      });
  });
  it("config customer_day_price_rule error with vehicle-price not exist", function (done) {
    chai
      .request(server)
      .put("/api/v1/vehicle-prices/9999999")
      .set("content-type", "application/json")
      .send({
        customer_day_price_rules: [
          {
            day_count_from: 1,
            day_count_to: 5,
            price: 100,
          },
        ],
      })
      .end((_, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
  it("config customer_day_price_rule failed because data input conflic", function (done) {
    chai
      .request(server)
      .put("/api/v1/vehicle-prices/" + testId)
      .set("content-type", "application/json")
      .send({
        customer_day_price_rules: [
          {
            day_count_from: 1,
            day_count_to: 5,
            price: 100,
          },
          {
            day_count_from: 3,
            day_count_to: 8,
            price: 80,
          },
        ],
      })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
  it("config customer_day_price_rule failed because data input invalid", function (done) {
    chai
      .request(server)
      .put("/api/v1/vehicle-prices/" + testId)
      .set("content-type", "application/json")
      .send({
        customer_day_price_rules: [
          {
            day_count_from: 0,
            day_count_to: 5,
            price: 100,
          },
          {
            day_count_from: 3.1,
            day_count_to: 8,
            price: -80,
          },
        ],
      })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
  it("config customer_day_price_rule failed because data input missing key field", function (done) {
    chai
      .request(server)
      .put("/api/v1/vehicle-prices/" + testId)
      .set("content-type", "application/json")
      .send({
        customer_day_price_rules: [
          {
            day_count_from: 1,
            day_count_to: 5,
            price: 100,
          },
          {
            day_count_from: 6,
            day_count_to: 10,
          },
        ],
      })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
  it("config customer_day_price_rule failed because price value too big", function (done) {
    chai
      .request(server)
      .put("/api/v1/vehicle-prices/" + testId)
      .set("content-type", "application/json")
      .send({
        customer_day_price_rules: [
          {
            day_count_from: 1,
            day_count_to: 5,
            price: 3000000000,
          },
        ],
      })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
  it("config customer_day_price_rule successful", function (done) {
    chai
      .request(server)
      .put("/api/v1/vehicle-prices/" + testId)
      .set("content-type", "application/json")
      .send({
        customer_day_price_rules: [
          {
            day_count_from: 1,
            day_count_to: 7,
            price: 100,
          },
          {
            day_count_from: 8,
            day_count_to: 15,
            price: 90,
          },
        ],
      })
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  it("delete vehicle-price successful", function (done) {
    chai
      .request(server)
      .delete("/api/v1/vehicle-prices/" + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  it("delete template should be failed because vehicle-price has just deleted", function (done) {
    chai
      .request(server)
      .delete("/api/v1/vehicle-prices/" + testId)
      .end((_, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
});

after(async () => {
  if (tmp_branch_id) {
    await BranchService.deleteById(tmp_branch_id);
  }
});
