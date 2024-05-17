/* eslint-disable no-undef */
require('module-alias/register');

const chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect,
  BranchService = require('../services/BranchService'),
  BranchVehicleService = require('../services/BranchVehicleService'),
  UserService = require('../services/UserService'),
  server = require('./index.test');

const db = require('../models');
const Constants = require('../constants');

chai.use(chaiHttp);

const data = {
  contract_sign_date: '2023-01-01 00:00',
  contract_created_by: null,
  contract_duration_month: 12,
  owner_id: null,
  branch_vehicle_id: null,
  rental_from_date: '2023-01-01 00:00',
  rental_to_date: '2024-01-01 00:00',
  reconciliation: Constants.RECONCILIATION_MIDDLE,
  revenue_rate: 50.5,
  contract_paper: {
    [Constants.OWNER_CONTRACT]: "https://example.com/test.docx",
    [Constants.OWNER_DELIVERY_REPORT]: "https://example.com/test.docx",
  },
  contract_images: ["https://example.com/test.docx"],
  owner_pin_price: 1800000,
  contract_note: '',
  rental_type: Constants.RENTAL_TYPE_ALL,
  owner_day_price: 1000000,
  owner_month_price: 14000000,
  owner_month_km_limit: 5000,
  owner_overkm_price: 3000,
  has_maintain: false,
  has_insurance: false,
  current_km: 10000,
}
let tmp_owner_id, testId, vehicleName;

before(async () => {
  const branchVehicle = await BranchVehicleService.getOne({
    owner_id: null
  });
  if (!branchVehicle) {
    console.log('======= Cannot find branchVehicle');
    return;
  }
  data.branch_vehicle_id = branchVehicle.id;
  vehicleName = branchVehicle.name;

  let owner = await UserService.getOne({ user_type: db.user.TYPE_OWNER });
  if (!owner) {
    owner = await UserService.create({ username: 'tmp_owner_test', password: '123456', user_type: db.user.TYPE_OWNER })
    tmp_owner_id = owner.id
  }
  if (!owner) {
    console.log('======= Cannot create owner');
    return;
  }
  data.owner_id = owner.id
})

describe('Test owner-contracts module', function () {
  it('1. create new owner-contracts successful', function (done) {
    console.log(data);
    chai.request(server)
      .post('/api/v1/owner-contracts')
      .set('content-type', 'application/json')
      .send(data)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).have.property('data');
        testId = res.body.data.id;
        done();
      })
  });
  it('2. create new owner-contracts failed with dupplicate unique owner_id & branch_vehicle_id', function (done) {
    chai.request(server)
      .post('/api/v1/owner-contracts')
      .set('content-type', 'application/json')
      .send(data)
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('3. create new owner-contracts should be return error because owner_id is null', function (done) {
    chai.request(server)
      .post('/api/v1/owner-contracts')
      .set('content-type', 'application/json')
      .send({ ...data, owner_id: 0 })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('5. create new owner-contracts should be return error because owner not exist', function (done) {
    chai.request(server)
      .post('/api/v1/owner-contracts')
      .set('content-type', 'application/json')
      .send({ ...data, owner_id: 9999999 })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('6. create new owner-contracts failed with missing required fields ', function (done) {
    const cloneData = { ...data }
    delete cloneData.rental_type
    chai.request(server)
      .post('/api/v1/owner-contracts')
      .set('content-type', 'application/json')
      .send(cloneData)
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('7. create new owner-contracts failed because vehicle none existed', function (done) {
    chai.request(server)
      .post('/api/v1/owner-contracts')
      .set('content-type', 'application/json')
      .send({ ...data, branch_vehicle_id: 99999999 })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('8. get list owner-contracts', function (done) {
    chai.request(server)
      .get('/api/v1/owner-contracts?vehicle_name='+ vehicleName.slice(0, 8))
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.total).greaterThan(0);
        done();
      });
  });
  it('9. branch detail should has properties equal after created', function (done) {
    chai.request(server)
      .get('/api/v1/owner-contracts/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.owner_id).to.equal(data.owner_id)
        expect(res.body.data.branch_vehicle_id).to.equal(data.branch_vehicle_id)
        expect(res.body.data.rental_type).to.equal(data.rental_type)
        expect(res.body.data.rental_from_date).to.equal(data.rental_from_date)
        expect(res.body.data.rental_to_date).to.equal(data.rental_to_date)
        expect(res.body.data.owner_day_price).to.equal(data.owner_day_price)
        expect(res.body.data.owner_month_price).to.equal(data.owner_month_price)
        expect(res.body.data.owner_month_km_limit).to.equal(data.owner_month_km_limit)
        expect(res.body.data.owner_overkm_price).to.equal(data.owner_overkm_price)
        expect(res.body.data.has_maintain).to.equal(data.has_maintain)
        expect(res.body.data.has_insurance).to.equal(data.has_insurance)
        expect(res.body.data.current_km).to.equal(data.current_km)
        expect(res.body.data.contract_note).to.equal(data.contract_note)
        expect(res.body.data.revenue_rate).to.equal(data.revenue_rate)
        expect(res.body.data.contract_paper[Constants.OWNER_CONTRACT]).to.equal(data.contract_paper[Constants.OWNER_CONTRACT])
        expect(res.body.data.contract_paper[Constants.OWNER_DELIVERY_REPORT]).to.equal(data.contract_paper[Constants.OWNER_DELIVERY_REPORT])
        expect(res.body.data.contract_images.length).to.equal(data.contract_images.length)
        done();
      })
  })
  it('update data should be successful', function (done) {
    chai.request(server)
      .put('/api/v1/owner-contracts/' + testId)
      .set('content-type', 'application/json')
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('update price successful', function (done) {
    chai.request(server)
      .put('/api/v1/owner-contracts/' + testId)
      .set('content-type', 'application/json')
      .send({ rental_type: Constants.RENTAL_TYPE_DAY, owner_day_price: 900000, owner_month_price: 0 })
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('update rental_type shoulb be failed because invalid value', function (done) {
    chai.request(server)
      .put('/api/v1/owner-contracts/' + testId)
      .set('content-type', 'application/json')
      .send({ rental_type: 'X' })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  })
  it('update owner_day_price shoulb be failed because invalid value', function (done) {
    chai.request(server)
      .put('/api/v1/owner-contracts/' + testId)
      .set('content-type', 'application/json')
      .send({ owner_day_price: "99.2" })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  })
  it('update owner_day_price shoulb be success', function (done) {
    chai.request(server)
      .put('/api/v1/owner-contracts/' + testId)
      .set('content-type', 'application/json')
      .send({ owner_day_price: 1000000 })
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('update price successful', function (done) {
    chai.request(server)
      .put('/api/v1/owner-contracts/' + testId)
      .set('content-type', 'application/json')
      .send({ rental_type: Constants.RENTAL_TYPE_MONTH, owner_month_price: 18000000 })
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('branch vehicle detail should has properties equal the previous after updated', function (done) {
    chai.request(server)
      .get('/api/v1/owner-contracts/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.rental_type).to.equal(Constants.RENTAL_TYPE_MONTH)
        expect(res.body.data.owner_day_price).to.equal(1000000)
        expect(res.body.data.owner_month_price).to.equal(18000000)
        done();
      })
  })
  it('delete owner-contracts successful', function (done) {
    chai.request(server)
      .delete('/api/v1/owner-contracts/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('delete owner-contracts should be failed because owner-contracts has just deleted', function (done) {
    chai.request(server)
      .delete('/api/v1/owner-contracts/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(404);
        done();
      })
  })
});

after(async () => {
  if (tmp_owner_id) {
    await UserService.deleteById(tmp_owner_id);
  }
})
