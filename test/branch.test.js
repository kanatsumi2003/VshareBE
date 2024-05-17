/* eslint-disable no-undef */
require("module-alias/register");
const { default: slugify } = require('slugify');

const chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect,
  ZoneService = require('../services/ZoneService'),
  server = require('./index.test'),
  constants = require('../constants'),
  { uniqueNamesGenerator, names } = require('unique-names-generator');

chai.use(chaiHttp);

const branchName = uniqueNamesGenerator({ dictionaries: [names] });
const data = {
  name: branchName,
  code: slugify(branchName).replace(/\s/, ''),
  address: 'Số 5 Vũ Tông Phan, Khương Trung',
  latlng: '21.0221987,105.8172885',
  rental_time_from: '07:00',
  rental_time_to: '21:00',
  limit_km: 0,
  overkm_fee: 0,
  overtime_fee: 0,
  free_delivery_km: 0,
  delivery_fee: 0,
  procedure: {
    [constants.PROCEDURE_IDENTITY]: constants.PROCEDURE_TYPE_HOLD,
    [constants.PROCEDURE_HOUSEHOLD]: constants.PROCEDURE_TYPE_VERIFY,
    [constants.PROCEDURE_DRIVER_LICENCE]: constants.PROCEDURE_TYPE_VERIFY,
    [constants.PROCEDURE_DEPOSIT]: null,
    [constants.PROCEDURE_LABOR_CONTRACT]: constants.PROCEDURE_TYPE_HOLD,
    [constants.PROCEDURE_OTHER]: null,
  },
  holiday_event_price: {
    [constants.HOLIDAY_EVENT_NATIONAL]: 100,
    [constants.HOLIDAY_EVENT_HUNGKING]: 50,
    [constants.HOLIDAY_EVENT_LIBERATION]: 20,
    [constants.HOLIDAY_EVENT_NEWYEAR]: 100,
    [constants.HOLIDAY_EVENT_LUNAR]: 100,
  },
  week_days_price: {
    'mon': 150,
    'tue': 200000,
    'wed': 0,
    'thu': null,
    'fri': null,
    'sat': 20,
    'sun': 100,
  },
  active: true,
  agent_name: 'Tên người đại diện',
  agent_phone: '0999999999',
  bank_name: '',
  bank_branch_name: '',
  bank_account_name: '',
  bank_account_number: '',
  tax_number: '',
  add_ons: [
    {
      code: constants.ADDON_4G,
      cost: 100000,
      unit: 'Chiếc'
    }
  ],
  payment_methods: [
    constants.PAYMENT_METHOD_VNPAY,
    constants.PAYMENT_METHOD_MOMO,
    constants.PAYMENT_METHOD_CASH,
  ]
}
let testId;

before(async () => {
  const province = await ZoneService.getOne({ level: 1 });
  if (province) {
    data.province_id = province.id
    const district = await ZoneService.getOne({ level: 2, parent_id: province.id });
    if (district) {
      data.district_id = district.id
    }
  }
})

describe('Test Branch module', function () {
  it('create new branch successful', function (done) {
    console.log(data);
    chai.request(server)
      .post('/api/v1/branchs')
      .set('content-type', 'application/json')
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).have.property('data');
        testId = res.body.data.id;
        done();
      })
  });
  it('get list branchs', function (done) {
    chai.request(server)
      .get('/api/v1/branchs')
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.total).greaterThan(0);
        done();
      });
  });
  it('create new branch should be error dupplicate data', function (done) {
    chai.request(server)
      .post('/api/v1/branchs')
      .set('content-type', 'application/json')
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(409);
        done();
      })
  });
  it('create new branch should be error because invalid code', function (done) {
    chai.request(server)
      .post('/api/v1/branchs')
      .set('content-type', 'application/json')
      .send({ ...data, code: `${data.code} 1` })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('create new branch should be error when field required missing', function (done) {
    const invalidData = { ...data };
    delete invalidData.name
    chai.request(server)
      .post('/api/v1/branchs')
      .set('content-type', 'application/json')
      .send(invalidData)
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('branch detail should has properties equal after created', function (done) {
    chai.request(server)
      .get('/api/v1/branchs/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.name).to.equal(data.name)
        expect(res.body.data.address).to.equal(data.address)
        done();
      })
  })
  it('update branch', function (done) {
    chai.request(server)
      .put('/api/v1/branchs/' + testId)
      .set('content-type', 'application/json')
      .send({ name: 'Update Branch name', address: 'Update address' })
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('branch detail should has properties equal the previous after updated', function (done) {
    chai.request(server)
      .get('/api/v1/branchs/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.name).to.equal('Update Branch name')
        expect(res.body.data.address).to.equal('Update address')
        done();
      })
  })
  it('delete branch successful', function (done) {
    chai.request(server)
      .delete('/api/v1/branchs/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('delete branch should be failed because branch is deleted', function (done) {
    chai.request(server)
      .delete('/api/v1/branchs/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(404);
        done();
      })
  })
});