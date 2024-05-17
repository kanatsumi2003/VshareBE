/* eslint-disable no-undef */
require("module-alias/register");

const chai = require("chai"),
  chaiHttp = require("chai-http"),
  expect = chai.expect,
  { faker } = require('@faker-js/faker'),
  server = require("./index.test");

chai.use(chaiHttp);

const data = {
  name: faker.name.fullName(),
  note: "",
  trust_scores: [
    {
      point: 10,
      name: faker.random.words(),
    },
    {
      point: 20,
      name: faker.random.words(),
    }
  ],
};

let testIds, testId;

describe("Test Trust score config module", function () {
  it("create new config successful", function (done) {
    chai
      .request(server)
      .post("/api/v1/trust-scores")
      .set("content-type", "application/json")
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).have.property("data");
        expect(res.body.data.length).to.equal(1);
        testId = res.body.data.map(d => d.id)[0];
        done();
      });
  });
  it("get list configs", function (done) {
    chai
      .request(server)
      .get("/api/v1/trust-scores")
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).to.have.property("total");
        expect(res.body.total).greaterThan(0);
        done();
      });
  });
  it("get list configs return empty data with filter by name not existed", function (done) {
    chai
      .request(server)
      .get("/api/v1/trust-scores?name=blablablablabla")
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).to.have.property("total");
        expect(res.body.total).equal(0);
        done();
      });
  });
  it("create new config should be error dupplicate data", function (done) {
    chai
      .request(server)
      .post("/api/v1/trust-scores")
      .set("content-type", "application/json")
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(409);
        done();
      });
  });
  it("create new config should be error when field required missing", function (done) {
    const invalidData = Object.assign({}, data);
    delete invalidData.name;
    chai
      .request(server)
      .post("/api/v1/trust-scores")
      .set("content-type", "application/json")
      .send(invalidData)
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
  it("config detail should has properties equal same data", function (done) {
    chai
      .request(server)
      .get("/api/v1/trust-scores/" + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body.data.trust_scores.length).to.equal(2);
        expect(res.body.data.name).to.equal(data.name);
        done();
      });
  });
  it("update config successful", function (done) {
    chai
      .request(server)
      .put("/api/v1/trust-scores/" + testId)
      .set("content-type", "application/json")
      .send({
        name: "Update Config name",
        trust_scores: [
          {
            point: 10,
            name: faker.random.words(),
          },
        ]
      })
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  it("update config failed with invalid point", function (done) {
    chai
      .request(server)
      .put("/api/v1/trust-scores/" + testId)
      .set("content-type", "application/json")
      .send({
        trust_scores: [
          {
            point: 101,
            name: faker.random.words(),
          },
        ]
      })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
  it("config detail should has properties equal the previous after updated", function (done) {
    chai
      .request(server)
      .get("/api/v1/trust-scores/" + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body.data.name).to.equal("Update Config name");
        expect(res.body.data.trust_scores.length).to.equal(1);
        done();
      });
  });
  it("delete config successful", function (done) {
    chai
      .request(server)
      .delete("/api/v1/trust-scores/" + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  it("delete config should be failed because config is deleted", function (done) {
    chai
      .request(server)
      .delete("/api/v1/trust-scores/" + testId)
      .end((_, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
});
