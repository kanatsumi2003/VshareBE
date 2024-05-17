const chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect,
  server = require('./index.test');

chai.use(chaiHttp);

const data = {
  vehicle_type: 'C',
  name: 'Test brand',
  position: 0,
}

describe('Test Vehicle brand module', function () {
  it('get list brands', function (done) {
    chai.request(server)
      .get('/api/v1/vehicle-brands')
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        done();
      });
  });
  let testId
  it('create new brand successful', function (done) {
    chai.request(server)
      .post('/api/v1/vehicle-brands')
      .set('content-type', 'application/json')
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).have.property('data');
        testId = res.body.data.id;
        done();
      })
  });
  it('create new brand should be error dupplicate name field', function (done) {
    chai.request(server)
      .post('/api/v1/vehicle-brands')
      .set('content-type', 'application/json')
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(409);
        done();
      })
  });
  it('create new brand should be error when field missing', function (done) {
    chai.request(server)
      .post('/api/v1/vehicle-brands')
      .set('content-type', 'application/json')
      .send({ ...data, name: '' })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('create new brand should be error with invalid vehicle_type field', function (done) {
    chai.request(server)
      .post('/api/v1/vehicle-brands')
      .set('content-type', 'application/json')
      .send({ ...data, vehicle_type: 3 })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('brand detail should has properties equal after created', function (done) {
    chai.request(server)
      .get('/api/v1/vehicle-brands/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.name).to.equal(data.name)
        expect(res.body.data.vehicle_type).to.equal(data.vehicle_type)
        expect(res.body.data.position).to.equal(data.position)
        done();
      })
  })
  it('update brand successful', function (done) {
    chai.request(server)
      .put('/api/v1/vehicle-brands/' + testId)
      .set('content-type', 'application/json')
      .send({ position: 1 })
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('brand detail should has properties equal the previous after updated', function (done) {
    chai.request(server)
      .get('/api/v1/vehicle-brands/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.name).to.equal(data.name)
        expect(res.body.data.vehicle_type).to.equal(data.vehicle_type)
        expect(res.body.data.position).to.equal(1)
        done();
      })
  })
  it('delete brand successful', function (done) {
    chai.request(server)
      .delete('/api/v1/vehicle-brands/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('delete brand should be failed because brand is deleted', function (done) {
    chai.request(server)
      .delete('/api/v1/vehicle-brands/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(404);
        done();
      })
  })
});