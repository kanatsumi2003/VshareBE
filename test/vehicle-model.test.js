const chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect,
  VehicleBrandService = require('../services/VehicleBrandService'),
  server = require('./index.test');

chai.use(chaiHttp);

const data = {
  name: 'Test model',
}

before(async () => {
  const brand = await VehicleBrandService.getOne({});
  if (brand) {
    data.brand_id = brand.id
  }
})

describe('Test Vehicle model module', function () {
  it('get list models', function (done) {
    chai.request(server)
      .get('/api/v1/vehicle-models')
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        done();
      });
  });
  let testId
  it('create new model successful', function (done) {
    chai.request(server)
      .post('/api/v1/vehicle-models')
      .set('content-type', 'application/json')
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).have.property('data');
        testId = res.body.data.id;
        done();
      })
  });
  it('create new model should be error dupplicate data', function (done) {
    chai.request(server)
      .post('/api/v1/vehicle-models')
      .set('content-type', 'application/json')
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(409);
        done();
      })
  });
  it('create new model should be error when field missing', function (done) {
    chai.request(server)
      .post('/api/v1/vehicle-models')
      .set('content-type', 'application/json')
      .send({ ...data, brand_id: '' })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('create new model should be error with brand_id unavaiable', function (done) {
    chai.request(server)
      .post('/api/v1/vehicle-models')
      .set('content-type', 'application/json')
      .send({ ...data, brand_id: 9999 })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('model detail should has properties equal after created', function (done) {
    chai.request(server)
      .get('/api/v1/vehicle-models/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.name).to.equal(data.name)
        expect(res.body.data.brand_id).to.equal(data.brand_id)
        done();
      })
  })
  it('update model', function (done) {
    chai.request(server)
      .put('/api/v1/vehicle-models/' + testId)
      .set('content-type', 'application/json')
      .send({ name: 'Update Test name' })
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('model detail should has properties equal the previous after updated', function (done) {
    chai.request(server)
      .get('/api/v1/vehicle-models/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.name).to.equal('Update Test name')
        expect(res.body.data.brand_id).to.equal(data.brand_id)
        done();
      })
  })
  it('delete model successful', function (done) {
    chai.request(server)
      .delete('/api/v1/vehicle-models/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('delete model should be failed because mode is deleted', function (done) {
    chai.request(server)
      .delete('/api/v1/vehicle-models/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(404);
        done();
      })
  })
});