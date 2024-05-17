const chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect,
  ZoneService = require('../services/ZoneService'),
  server = require('./index.test');

chai.use(chaiHttp);

const data = {
  name: 'Test district',
  position: 1,
}

before(async () => {
  const province = await ZoneService.getOne({ level: 1 });
  if (province) {
    data.province_id = province.id
  }
})

describe('Test Zone district module', function () {
  console.log('--------', data.province_id);
  it('get list districts', function (done) {
    chai.request(server)
      .get('/api/v1/districts?province_id=' + data.province_id)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        done();
      });
  });
  let testId
  it('create new district successful', function (done) {
    chai.request(server)
      .post('/api/v1/districts')
      .set('content-type', 'application/json')
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).have.property('data');
        testId = res.body.data.id;
        done();
      })
  });
  it('create new district should be error dupplicate data', function (done) {
    chai.request(server)
      .post('/api/v1/districts')
      .set('content-type', 'application/json')
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(409);
        done();
      })
  });
  it('create new district should be error when field missing', function (done) {
    chai.request(server)
      .post('/api/v1/districts')
      .set('content-type', 'application/json')
      .send({ ...data, province_id: '' })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('create new district should be error with province_id unavaiable', function (done) {
    chai.request(server)
      .post('/api/v1/districts')
      .set('content-type', 'application/json')
      .send({ ...data, province_id: 99999999 })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('district detail should has properties equal after created', function (done) {
    chai.request(server)
      .get('/api/v1/districts/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.name).to.equal(data.name)
        expect(res.body.data.parent_id).to.equal(data.province_id)
        done();
      })
  })
  it('update district', function (done) {
    chai.request(server)
      .put('/api/v1/districts/' + testId)
      .set('content-type', 'application/json')
      .send({ name: 'Update Test name' })
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('district detail should has properties equal the previous after updated', function (done) {
    chai.request(server)
      .get('/api/v1/districts/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.name).to.equal('Update Test name')
        expect(res.body.data.parent_id).to.equal(data.province_id)
        done();
      })
  })
  it('delete district successful', function (done) {
    chai.request(server)
      .delete('/api/v1/districts/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('delete district should be failed because mode is deleted', function (done) {
    chai.request(server)
      .delete('/api/v1/districts/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(404);
        done();
      })
  })
});