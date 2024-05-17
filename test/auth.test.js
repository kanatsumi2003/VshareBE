/* eslint-disable no-undef */
require("module-alias/register");

const UserService = require("../services/UserService");
const CustomerService = require("../services/CustomerService");
const { describe, it } = require("mocha");

const chai = require("chai"),
  chaiHttp = require("chai-http"),
  expect = chai.expect,
  server = require("./index.test");

chai.use(chaiHttp);

const userData = {
    username: "",
    password: "",
  },
  customerData = {
    phone: "0900000000",
    password: "test",
  };

before(async () => {
  // Fake user
  let user = await UserService.getOne({ username: "test" });
  if (!user) {
    user = await UserService.create({
      username: "test",
      password: "test",
    });
  }
  if (user) {
    userData.username = "test";
    userData.password = "test";
  }
});

describe("Test user authentication", function () {
  it("User login should be successful", function (done) {
    console.log(userData);
    chai
      .request(server)
      .post("/api/v1/auth/login")
      .set("content-type", "application/json")
      .send(userData)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).have.property("access_token");
        expect(res.body).have.property("refresh_token");
        done();
      });
  });
});

let customerId;

describe("Test customer authentication", function () {
  it("Customer register successful", function (done) {
    chai
      .request(server)
      .post("/api/v1/customer-app/register")
      .set("content-type", "application/json")
      .send(customerData)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).have.property("data");
        expect(res.body.data).have.property("customerId");
        customerId = res.body.data.customerId;
        done();
      });
  });
  it("Customer login should be successful", function (done) {
    chai
      .request(server)
      .post("/api/v1/customer-app/login")
      .set("content-type", "application/json")
      .send(customerData)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).have.property("access_token");
        expect(res.body).have.property("refresh_token");
        done();
      });
  });
  it("Delete customer successful", function (done) {
    chai
      .request(server)
      .delete("/api/v1/customers/" + customerId)
      .set("content-type", "application/json")
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});
