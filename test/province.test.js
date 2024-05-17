const chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect,
  server = require('./index.test');

chai.use(chaiHttp);

const data = {
  name: 'Test province',
  position: 0,
}

describe('Test Zone province module', function () {
  it('get list provinces', function (done) {
    chai.request(server)
      .get('/api/v1/provinces')
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        done();
      });
  });
  let testId
  it('create new province successful', function (done) {
    chai.request(server)
      .post('/api/v1/provinces')
      .set('content-type', 'application/json')
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).have.property('data');
        testId = res.body.data.id;
        done();
      })
  });
  it('create new province should be error dupplicate data', function (done) {
    chai.request(server)
      .post('/api/v1/provinces')
      .set('content-type', 'application/json')
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(409);
        done();
      })
  });
  it('create new province should be error when field required missing', function (done) {
    chai.request(server)
      .post('/api/v1/provinces')
      .set('content-type', 'application/json')
      .send({ ...data, name: '' })
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('province detail should has properties equal after created', function (done) {
    chai.request(server)
      .get('/api/v1/provinces/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.name).to.equal(data.name)
        expect(res.body.data.position).to.equal(data.position)
        done();
      })
  })
  it('update province', function (done) {
    chai.request(server)
      .put('/api/v1/provinces/' + testId)
      .set('content-type', 'application/json')
      .send({ name: 'Update Test name' })
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('update province should be failed with duplicate name', function (done) {
    chai.request(server)
      .put('/api/v1/provinces/' + testId)
      .set('content-type', 'application/json')
      .send({ name: 'Hà Nội' })
      .end((_, res) => {
        expect(res).to.have.status(409);
        done();
      })
  })
  it('province detail should has properties equal the previous after updated', function (done) {
    chai.request(server)
      .get('/api/v1/provinces/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.name).to.equal('Update Test name')
        expect(res.body.data.brand_id).to.equal(data.brand_id)
        done();
      })
  })
  it('delete province successful', function (done) {
    chai.request(server)
      .delete('/api/v1/provinces/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('delete province should be failed because province is deleted', function (done) {
    chai.request(server)
      .delete('/api/v1/provinces/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(404);
        done();
      })
  })
});