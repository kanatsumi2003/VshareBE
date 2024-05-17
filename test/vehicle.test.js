const chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect,
  VehicleBrandService = require('../services/VehicleBrandService'),
  AttributeService = require('../services/AttributeService'),
  VehicleModelService = require('../services/VehicleModelService'),
  server = require('./index.test');

const {
  TRANMISSION_TYPE_MANUAL,
  FUEL_GAS,
  VEHICLE_CLASS_A,
  VEHICLE_TYPE_CAR,
} = require('../constants');


chai.use(chaiHttp);

const data = {
  vehicle_type: VEHICLE_TYPE_CAR,
  brand_id: 1,
  model_id: 1,
  vehicle_class: VEHICLE_CLASS_A,
  version: '2.0',
  seats: 4,
  transmission: TRANMISSION_TYPE_MANUAL,
  fuel: FUEL_GAS,
  fuel_consumption: '10l/100km',
  style: 'SUV/CUV',
  attributes: [],
}

before(async () => {
  const brand = await VehicleBrandService.getOne({});
  if (brand) {
    data.brand_id = brand.id
    const model = await VehicleModelService.getOne({ brand_id: brand.id });
    if (model) {
      data.model_id = model.id
    }
  }
  const { rows: attributes, count } = await AttributeService.getAll({ limit: 3 })
  if (!count) {
    data.attributes = attributes.map(a => a.id);
  }
})

describe('Test Vehicle module', function () {
  let testId
  it('create new vehicle successful', function (done) {
    console.log(data);
    chai.request(server)
      .post('/api/v1/vehicles')
      .set('content-type', 'application/json')
      .send(data)
      .end((error, res) => {
        expect(res).to.have.status(200);
        expect(res.body).have.property('data');
        testId = res.body.data.id;
        done();
      })
  });
  it('get list vehicles', function (done) {
    chai.request(server)
      .get('/api/v1/vehicles')
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.total).greaterThan(0);
        done();
      });
  });
  it('create new vehicle should be error dupplicate data', function (done) {
    chai.request(server)
      .post('/api/v1/vehicles')
      .set('content-type', 'application/json')
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(409);
        done();
      })
  });
  it('create new vehicle should be error when field missing', function (done) {
    const fakeData = { ...data }
    delete fakeData.model_id;
    chai.request(server)
      .post('/api/v1/vehicles')
      .set('content-type', 'application/json')
      .send(fakeData)
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('create new vehicle should be error with brand_id unavaiable', function (done) {
    chai.request(server)
      .post('/api/v1/vehicles')
      .set('content-type', 'application/json')
      .send({ ...data, brand_id: '' })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('vehicle detail should has properties equal after created', function (done) {
    chai.request(server)
      .get('/api/v1/vehicles/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.vehicle_type).to.equal(data.vehicle_type)
        expect(res.body.data.brand_id).to.equal(data.brand_id)
        expect(res.body.data.model_id).to.equal(data.model_id)
        expect(res.body.data.vehicle_class).to.equal(data.vehicle_class)
        expect(res.body.data.version).to.equal(data.version)
        expect(res.body.data.seats).to.equal(data.seats)
        expect(res.body.data.transmission).to.equal(data.transmission)
        expect(res.body.data.fuel).to.equal(data.fuel)
        expect(res.body.data.attributes.length).to.equal(data.attributes.length)
        done();
      })
  })
  it('update vehicle', function (done) {
    chai.request(server)
      .put('/api/v1/vehicles/' + testId)
      .set('content-type', 'application/json')
      .send({ ...data, fuel: 'O', transmission: 'A', seats: 5 })
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('vehicle detail should has properties equal the previous after updated', function (done) {
    chai.request(server)
      .get('/api/v1/vehicles/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.vehicle_type).to.equal(data.vehicle_type)
        expect(res.body.data.brand_id).to.equal(data.brand_id)
        expect(res.body.data.model_id).to.equal(data.model_id)
        expect(res.body.data.vehicle_class).to.equal(data.vehicle_class)
        expect(res.body.data.version).to.equal(data.version)
        expect(res.body.data.seats).to.equal(5)
        expect(res.body.data.transmission).to.equal('A')
        expect(res.body.data.fuel).to.equal('O')
        done();
      })
  })
  it('delete vehicle successful', function (done) {
    chai.request(server)
      .delete('/api/v1/vehicles/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('delete vehicle should be failed because mode is deleted', function (done) {
    chai.request(server)
      .delete('/api/v1/vehicles/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(404);
        done();
      })
  })
});