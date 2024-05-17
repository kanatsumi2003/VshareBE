/* eslint-disable no-undef */
require('module-alias/register');

const chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect,
  BranchService = require('../services/BranchService'),
  VehicleService = require('../services/VehicleService'),
  UserService = require('../services/UserService'),
  server = require('./index.test');

const db = require('../models');
const AttributeService = require('../services/AttributeService');
const constants = require('../constants');

chai.use(chaiHttp);

const licenceNumber = `30F-${10000 + Math.floor(Math.random() * 90000)}`;
const data = {
  vehicle_id: null, // update later
  branch_id: null, // update later
  license_number: licenceNumber,
  vehicle_color: 'Trắng',
  manufacture_year: 2020,
  rental_type: constants.RENTAL_TYPE_ALL,
  owner_id: null, // update later
  owner_day_price: 1000000,
  owner_month_price: 14000000,
  owner_month_km_limit: 5000,
  owner_overkm_price: 3000,
  customer_base_price: 900000,
  customer_weekend_price: 1000000,
  customer_month_price: 18000000,
  customer_month_km_limit: 3000,
  customer_day_km_limit: 500,
  customer_overkm_price: 5000,
  customer_overtime_price: 5000,
  position_company: 'test',
  position_username: 'test',
  position_password: 'test',
  has_maintain: false,
  has_insurance: false,
  insurance_brand: '',
  insurance_phone: '',
  insurance_expire_date: '',
  etc_username: '',
  etc_password: '',
  registry_date: '2020-12-28',
  current_km: 10000,
  attributes: [],
  customer_day_price_rules: [
    {
      day_count_from: 1,
      day_count_to: 7,
      price: 100
    }
  ],
  car_image: {
    [constants.CAR_IMAGE_FRONT]: 'https://domain.com/image.jpg',
    [constants.CAR_IMAGE_BACK]: 'https://domain.com/image.jpg',
    [constants.CAR_IMAGE_RIGHT]: 'https://domain.com/image.jpg',
    [constants.CAR_IMAGE_LEFT]: 'https://domain.com/image.jpg',
    [constants.CAR_IMAGE_INTERIOR]: 'https://domain.com/image.jpg',
    [constants.CAR_IMAGE_FUEL]: 'https://domain.com/image.jpg',
  },
  latest_car_image: {
    [constants.CAR_IMAGE_FRONT]: 'https://domain.com/image.jpg',
    [constants.CAR_IMAGE_BACK]: 'https://domain.com/image.jpg',
    [constants.CAR_IMAGE_RIGHT]: 'https://domain.com/image.jpg',
    [constants.CAR_IMAGE_LEFT]: 'https://domain.com/image.jpg',
    [constants.CAR_IMAGE_INTERIOR]: 'https://domain.com/image.jpg',
    [constants.CAR_IMAGE_FUEL]: 'https://domain.com/image.jpg',
  },
  latest_km: 52012,
  latest_fuel: 100,
  car_document_image: {
    [constants.CAR_DOCUMENT_REGISTRATION]: 'https://domain.com/image.jpg',
    [constants.CAR_DOCUMENT_REGISTRATION_CERT]: 'https://domain.com/image.jpg',
    [constants.CAR_DOCUMENT_LIABILITY_CERT]: 'https://domain.com/image.jpg',
    [constants.CAR_DOCUMENT_PHYSICAL_CERT]: 'https://domain.com/image.jpg',
    [constants.CAR_DOCUMENT_OTHER]: 'https://domain.com/image.jpg,https://domain.com/image.jpg',
  }
}
let tmp_owner_id, tmp_branch_id, attributes, tmp_attribute_id, testId, other_vehicle_id, branch_vehicle;

before(async () => {
  let branch = await BranchService.getOne({});
  if (branch) {
    data.branch_id = branch.id
  } else {
    branch = await BranchService.create({
      name: 'Branch Test',
      province_id: 1000018,
      district_id: 2000163,
      address: 'Branch Address Test'
    });
    tmp_branch_id = branch.id;
    data.branch_id = branch.id;
  }
  const { rows: vehicles } = await VehicleService.getAll({ limit: 2 });
  if (vehicles.length == 2) {
    data.vehicle_id = vehicles[0].id
    other_vehicle_id = vehicles[1].id
  }
  let owner = await UserService.getOne({ user_type: db.user.TYPE_OWNER });
  if (!owner) {
    owner = await UserService.create({ username: 'tmp_onwer_test', password: '123456', user_type: db.user.TYPE_OWNER })
    tmp_owner_id = owner.id
  }
  data.owner_id = owner.id
  const { rows } = await AttributeService.getAll({ limit: 3 })
  data.attributes = rows.map(a => a.id);
  attributes = rows;
})

describe('Test Branch-vehicle module', function () {
  it('create new branch-vehicle successful', function (done) {
    console.log(data);
    chai.request(server)
      .post('/api/v1/branch-vehicles')
      .set('content-type', 'application/json')
      .send(data)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).have.property('data');
        branch_vehicle = res.body.data;
        testId = res.body.data.id;
        done();
      })
  });
  it('create new branch-vehicle failed with dupplicate code', function (done) {
    chai.request(server)
      .post('/api/v1/branch-vehicles')
      .set('content-type', 'application/json')
      .send(data)
      .end((err, res) => {
        expect(res).to.have.status(409);
        done();
      })
  });
  it('create new branch-vehicle should be return error because both branch_id field and owner_id are null', function (done) {
    chai.request(server)
      .post('/api/v1/branch-vehicles')
      .set('content-type', 'application/json')
      .send({ ...data, branch_id: 0, owner_id: 0 })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('create new branch-vehicle should be return error because branch not exist', function (done) {
    chai.request(server)
      .post('/api/v1/branch-vehicles')
      .set('content-type', 'application/json')
      .send({ ...data, license_number: '30B-1223', branch_id: 999999 })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('create new branch-vehicle should be return error because owner not exist', function (done) {
    chai.request(server)
      .post('/api/v1/branch-vehicles')
      .set('content-type', 'application/json')
      .send({ ...data, license_number: '30B-1223', owner_id: 9999999 })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('create new branch-vehicle failed with missing required fields ', function (done) {
    const cloneData = { ...data }
    delete cloneData.license_number
    delete cloneData.current_km
    chai.request(server)
      .post('/api/v1/branch-vehicles')
      .set('content-type', 'application/json')
      .send(cloneData)
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('create new branch-vehicle failed because vehicle existed', function (done) {
    chai.request(server)
      .post('/api/v1/branch-vehicles')
      .set('content-type', 'application/json')
      .send({ ...data, license_number: '30B-1223', vehicle_id: 9999999 })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('create new branch-vehicle failed because miss owner_month_price field while rental_type is month', function (done) {
    chai.request(server)
      .post('/api/v1/branch-vehicles')
      .set('content-type', 'application/json')
      .send({ ...data, owner_month_price: 0, rental_type: 'month' })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('create new branch-vehicle failed because miss owner_day_price field while rental_type is day', function (done) {
    chai.request(server)
      .post('/api/v1/branch-vehicles')
      .set('content-type', 'application/json')
      .send({ ...data, owner_day_price: 0, rental_type: 'day' })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('get list branch-vehicles', function (done) {
    chai.request(server)
      .get('/api/v1/branch-vehicles')
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.total).greaterThan(0);
        done();
      });
  });
  it('get list avaiable branch-vehicles', function (done) {
    chai.request(server)
      .get(`/api/v1/customer-app/branch-vehicles?branch_id=${data.branch_id}&vehicle_type=C&from_date=07:00 10-10-2022&to_date=07:00 10-10-2023`)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        done();
      });
  });
  it('branch detail should has properties equal after created', function (done) {
    chai.request(server)
      .get('/api/v1/branch-vehicles/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.branch_id).to.equal(data.branch_id)
        expect(res.body.data.rental_type).to.equal(data.rental_type)
        expect(res.body.data.owner_id).to.equal(data.owner_id)
        expect(res.body.data.owner_day_price).to.equal(data.owner_day_price)
        expect(res.body.data.owner_month_price).to.equal(data.owner_month_price)
        expect(res.body.data.owner_month_km_limit).to.equal(data.owner_month_km_limit)
        expect(res.body.data.owner_overkm_price).to.equal(data.owner_overkm_price)
        expect(res.body.data.customer_base_price).to.equal(data.customer_base_price)
        expect(res.body.data.customer_weekend_price).to.equal(data.customer_weekend_price)
        expect(res.body.data.customer_month_price).to.equal(data.customer_month_price)
        expect(res.body.data.customer_month_km_limit).to.equal(data.customer_month_km_limit)
        expect(res.body.data.customer_overkm_price).to.equal(data.customer_overkm_price)
        expect(res.body.data.position_company).to.equal(data.position_company)
        expect(res.body.data.position_username).to.equal(data.position_username)
        expect(res.body.data.position_password).to.equal(data.position_password)
        expect(res.body.data.has_maintain).to.equal(data.has_maintain)
        expect(res.body.data.has_insurance).to.equal(data.has_insurance)
        expect(res.body.data.insurance_brand).to.equal(null)
        expect(res.body.data.insurance_phone).to.equal(null)
        expect(res.body.data.insurance_expire_date).to.equal(null)
        expect(res.body.data.etc_username).to.equal(data.etc_username)
        expect(res.body.data.etc_password).to.equal(data.etc_password)
        expect(res.body.data.registry_date).to.equal(data.registry_date)
        expect(res.body.data.current_km).to.equal(data.current_km)
        expect(res.body.data.license_number).to.equal(data.license_number)
        expect(res.body.data.vehicle_id).to.equal(data.vehicle_id)
        expect(res.body.data.car_image.length).to.equal(data.car_image.length)
        expect(res.body.data.latest_car_image.length).to.equal(data.latest_car_image.length)
        expect(res.body.data.latest_km).to.equal(data.latest_km)
        expect(res.body.data.latest_fuel).to.equal(data.latest_fuel)
        expect(res.body.data.car_document_image.length).to.equal(data.car_document_image.length)
        done();
      })
  })
  it('update data shoulb be successful', function (done) {
    chai.request(server)
      .put('/api/v1/branch-vehicles/' + testId)
      .set('content-type', 'application/json')
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('update data shoulb be failed because invalid day & month price', function (done) {
    chai.request(server)
      .put('/api/v1/branch-vehicles/' + testId)
      .set('content-type', 'application/json')
      .send({ rental_type: 'month', owner_day_price: 0, owner_month_price: 0 })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  })
  it('update price successful', function (done) {
    chai.request(server)
      .put('/api/v1/branch-vehicles/' + testId)
      .set('content-type', 'application/json')
      .send({ rental_type: constants.RENTAL_TYPE_DAY, owner_day_price: 900000, owner_month_price: 0 })
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('update rental_type shoulb be failed because invalid value', function (done) {
    chai.request(server)
      .put('/api/v1/branch-vehicles/' + testId)
      .set('content-type', 'application/json')
      .send({ rental_type: 'X' })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  })
  it('update owner_day_price shoulb be failed because invalid value', function (done) {
    chai.request(server)
      .put('/api/v1/branch-vehicles/' + testId)
      .set('content-type', 'application/json')
      .send({ owner_day_price: "99.2" })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  })
  it('update owner_day_price shoulb be success', function (done) {
    chai.request(server)
      .put('/api/v1/branch-vehicles/' + testId)
      .set('content-type', 'application/json')
      .send({ owner_day_price: 1000000 })
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('update price successful', function (done) {
    chai.request(server)
      .put('/api/v1/branch-vehicles/' + testId)
      .set('content-type', 'application/json')
      .send({ rental_type: constants.RENTAL_TYPE_MONTH, owner_month_price: 18000000 })
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('branch vehicle detail should has properties equal the previous after updated', function (done) {
    chai.request(server)
      .get('/api/v1/branch-vehicles/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.branch_id).to.equal(data.branch_id)
        expect(res.body.data.rental_type).to.equal(constants.RENTAL_TYPE_MONTH)
        expect(res.body.data.owner_day_price).to.equal(1000000)
        expect(res.body.data.owner_month_price).to.equal(18000000)
        done();
      })
  })
  it('change other vehicle successful', function (done) {
    chai.request(server)
      .put('/api/v1/branch-vehicles/' + testId)
      .set('content-type', 'application/json')
      .send({
        vehicle_id: other_vehicle_id,
        vehicle_color: 'Đen'
      })
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('branch vehicle name should be changed after updated', function (done) {
    chai.request(server)
      .get('/api/v1/branch-vehicles/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.name).to.not.equal(branch_vehicle.name)
        expect(res.body.data.vehicle_id).to.not.equal(branch_vehicle.vehicle_id)
        done();
      })
  })
  it('config customer_day_price_rule error with branch-vehicle not exist', function (done) {
    chai.request(server)
      .put('/api/v1/branch-vehicles/9999999')
      .set('content-type', 'application/json')
      .send({
        customer_day_price_rules: [
          {
            day_count_from: 1,
            day_count_to: 5,
            price: 100
          }
        ]
      })
      .end((_, res) => {
        expect(res).to.have.status(404);
        done();
      })
  })
  it('config customer_day_price_rule failed because data input conflic', function (done) {
    chai.request(server)
      .put('/api/v1/branch-vehicles/' + testId)
      .set('content-type', 'application/json')
      .send({
        customer_day_price_rules: [
          {
            day_count_from: 1,
            day_count_to: 5,
            price: 100
          },
          {
            day_count_from: 3,
            day_count_to: 8,
            price: 80
          }
        ]
      })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  })
  it('config customer_day_price_rule failed because data input invalid', function (done) {
    chai.request(server)
      .put('/api/v1/branch-vehicles/' + testId)
      .set('content-type', 'application/json')
      .send({
        customer_day_price_rules: [
          {
            day_count_from: 0,
            day_count_to: 5,
            price: 100
          },
          {
            day_count_from: 3.1,
            day_count_to: 8,
            price: -80
          }
        ]
      })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  })
  it('config customer_day_price_rule failed because data input missing key field', function (done) {
    chai.request(server)
      .put('/api/v1/branch-vehicles/' + testId)
      .set('content-type', 'application/json')
      .send({
        customer_day_price_rules: [
          {
            day_count_from: 1,
            day_count_to: 5,
            price: 100
          },
          {
            day_count_from: 6,
            day_count_to: 10,
          }
        ]
      })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  })
  it('config customer_day_price_rule failed because price value too big', function (done) {
    chai.request(server)
      .put('/api/v1/branch-vehicles/' + testId)
      .set('content-type', 'application/json')
      .send({
        customer_day_price_rules: [
          {
            day_count_from: 1,
            day_count_to: 5,
            price: 9000000000
          },
        ]
      })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  })
  it('config customer_day_price_rule successful', function (done) {
    chai.request(server)
      .put('/api/v1/branch-vehicles/' + testId)
      .set('content-type', 'application/json')
      .send({
        customer_day_price_rules: [
          {
            day_count_from: 1,
            day_count_to: 7,
            price: 100
          },
          {
            day_count_from: 8,
            day_count_to: 15,
            price: 90
          }
        ]
      })
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('update config customer_day_price_rule successful', function (done) {
    chai.request(server)
      .put('/api/v1/branch-vehicles/' + testId)
      .set('content-type', 'application/json')
      .send({
        customer_day_price_rules: [
          {
            day_count_from: 1,
            day_count_to: 7,
            price: 100
          },
          {
            day_count_from: 8,
            day_count_to: 15,
            price: 90
          },
          {
            day_count_from: 16,
            day_count_to: 30,
            price: 900000000
          }
        ]
      })
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('upsert vehicle attribute values successful', function (done) {
    chai.request(server)
      .put('/api/v1/branch-vehicles/' + testId)
      .set('content-type', 'application/json')
      .send({
        attributes: attributes.map(v => v.id),
      })
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('get list vehicle attribute values', function (done) {
    chai.request(server)
      .get('/api/v1/branch-vehicles/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.attributes.length).equal(attributes.length);
        done();
      })
  })
  it('delete with upsert vehicle attribute values successful', function (done) {
    chai.request(server)
      .put('/api/v1/branch-vehicles/' + testId)
      .set('content-type', 'application/json')
      .send({
        attributes: [],
      })
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('get list vehicle attribute values after deleted', function (done) {
    chai.request(server)
      .get('/api/v1/branch-vehicles/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.attributes.length).equal(0);
        done();
      })
  })
  it('delete branch-vehicle successful', function (done) {
    chai.request(server)
      .delete('/api/v1/branch-vehicles/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('delete branch-vehicle should be failed because branch-vehicle has just deleted', function (done) {
    chai.request(server)
      .delete('/api/v1/branch-vehicles/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(404);
        done();
      })
  })
});

after(async () => {
  if (tmp_branch_id) {
    await BranchService.deleteById(tmp_branch_id);
  }
  if (tmp_owner_id) {
    await UserService.deleteById(tmp_owner_id);
  }
  if (tmp_attribute_id) {
    await AttributeService.deleteById(tmp_attribute_id);
  }
})
