const chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect,
  server = require('./index.test');

chai.use(chaiHttp);

const data = {
  name: 'method-test',
  icon: '',
  description: '',
  active: true,
}
let testId;

describe('Test Payment-method module', function () {
  it('create new method successful', function (done) {
    chai.request(server)
      .post('/api/v1/payment-methods')
      .set('content-type', 'application/json')
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).have.property('data');
        testId = res.body.data.id;
        done();
      })
  });
  it('get list payment-methods', function (done) {
    chai.request(server)
      .get('/api/v1/payment-methods')
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.total).greaterThan(0);
        done();
      });
  });
  it('create new method should be error dupplicate data', function (done) {
    chai.request(server)
      .post('/api/v1/payment-methods')
      .set('content-type', 'application/json')
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(409);
        done();
      })
  });
  it('create new method should be error when field required missing', function (done) {
    const invalidData = Object.assign({}, data);
    delete invalidData.name
    chai.request(server)
      .post('/api/v1/payment-methods')
      .set('content-type', 'application/json')
      .send(invalidData)
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('method detail should has properties equal after created', function (done) {
    chai.request(server)
      .get('/api/v1/payment-methods/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.name).to.equal(data.name)
        expect(res.body.data.icon).to.equal(data.icon)
        expect(res.body.data.description).to.equal(data.description)
        expect(res.body.data.active).to.equal(data.active)
        done();
      })
  })
  it('update method', function (done) {
    chai.request(server)
      .put('/api/v1/payment-methods/' + testId)
      .set('content-type', 'application/json')
      .send({ name: 'Update method-test name', icon: 'https://icon.com', description: 'desc', active: true })
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('method detail should has properties equal the previous after updated', function (done) {
    chai.request(server)
      .get('/api/v1/payment-methods/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.name).to.equal('Update method-test name')
        expect(res.body.data.icon).to.equal('https://icon.com')
        expect(res.body.data.description).to.equal('desc')
        expect(res.body.data.active).to.equal(true)
        done();
      })
  })
  it('delete method successful', function (done) {
    chai.request(server)
      .delete('/api/v1/payment-methods/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('delete method should be failed because method is deleted', function (done) {
    chai.request(server)
      .delete('/api/v1/payment-methods/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(404);
        done();
      })
  })
});
