
/* eslint-disable no-undef */
require("module-alias/register");

const chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect,
  { faker } = require('@faker-js/faker'),
  BranchService = require("../services/BranchService"),
  server = require('./index.test');

chai.use(chaiHttp);

const data = {
  branch_id: null,
  username: faker.internet.userName().toLowerCase(),
  fullname: faker.name.fullName(),
  email: faker.internet.email(),
  phone: faker.phone.number('09########'),
  password: '123456',
  active: true,
}

before(async () => {
  // Fake branch
  let branch = await BranchService.getOne({});
  if (!branch) {
    const branchName = faker.company.name();
    const branchData = {
      name: branchName,
      address: faker.address.streetAddress(),
      latlng: "21.0221987,105.8172885",
      rental_time_from: "07:00",
      rental_time_to: "21:00",
      limit_km: 0,
      overkm_fee: 0,
      overtime_fee: 0,
      free_delivery_km: 0,
      delivery_fee: 0,
    };
    branch = await BranchService.create(branchData);
  }
  if (!branch) return;
  data.branch_id = [branch.id];
});


describe('Test User module', function () {
  it('get list users', function (done) {
    chai.request(server)
      .get('/api/v1/users')
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        done();
      });
  });
  let testId
  it('create new user successful', function (done) {
    console.log(data);
    chai.request(server)
      .post('/api/v1/users')
      .set('content-type', 'application/json')
      .send(data)
      .end((err, res) => {
        console.error(err);
        expect(res).to.have.status(200);
        expect(res.body).have.property('data');
        testId = res.body.data.id;
        done();
      })
  });
  it('create new user should be error dupplicate data', function (done) {
    chai.request(server)
      .post('/api/v1/users')
      .set('content-type', 'application/json')
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(409);
        done();
      })
  });
  it('create new user should be error with username include space', function (done) {
    chai.request(server)
      .post('/api/v1/users')
      .set('content-type', 'application/json')
      .send({ ...data, username: 'abc 123' })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('create new user should be error with username include special characters', function (done) {
    chai.request(server)
      .post('/api/v1/users')
      .set('content-type', 'application/json')
      .send({ ...data, username: 'abcd$%^123' })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('create new user should be error with invalid user_type', function (done) {
    chai.request(server)
      .post('/api/v1/users')
      .set('content-type', 'application/json')
      .send({ ...data, user_type: 100 })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('create new user should be error with invalid email', function (done) {
    chai.request(server)
      .post('/api/v1/users')
      .set('content-type', 'application/json')
      .send({ ...data, email: 'email' })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('create new user should be error with invalid password length', function (done) {
    chai.request(server)
      .post('/api/v1/users')
      .set('content-type', 'application/json')
      .send({ ...data, password: '123' })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('create new user should be error when field required missing', function (done) {
    const invalidData = Object.assign({}, data);
    delete invalidData.username
    chai.request(server)
      .post('/api/v1/users')
      .set('content-type', 'application/json')
      .send(invalidData)
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('user detail should has properties equal after created', function (done) {
    chai.request(server)
      .get('/api/v1/users/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.username).to.equal(data.username)
        expect(res.body.data.fullname).to.equal(data.fullname)
        expect(res.body.data.email).to.equal(data.email)
        if (data.branch_id === null) {
          expect(res.body.data.branch_id).to.satisfy(s => s instanceof Array && s.length === 0)
        } else {
          expect(res.body.data.branch_id.length).to.equal(1)
        }
        done();
      })
  })
  it('update user', function (done) {
    chai.request(server)
      .put('/api/v1/users/' + testId)
      .set('content-type', 'application/json')
      .send({ fullname: 'Test Update FullName' })
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('user detail should has properties equal the previous after updated', function (done) {
    chai.request(server)
      .get('/api/v1/users/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.username).to.equal(data.username)
        expect(res.body.data.fullname).to.equal('Test Update FullName')
        expect(res.body.data.email).to.equal(data.email)
        done();
      })
  })
  it('delete user successful', function (done) {
    chai.request(server)
      .delete('/api/v1/users/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('delete user should be failed because user is deleted', function (done) {
    chai.request(server)
      .delete('/api/v1/users/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(404);
        done();
      })
  })
});
