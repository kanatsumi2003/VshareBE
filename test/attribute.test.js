const chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect,
  server = require('./index.test'),
  { uniqueNamesGenerator, names } = require('unique-names-generator');

chai.use(chaiHttp);

const attributeName = uniqueNamesGenerator({ dictionaries: ['Test', names] })
const data = {
  name: attributeName,
  icon: '',
  priority: 1,
}
let testId;

describe('Test Attribute module', function () {
  it('create new attribute successful', function (done) {
    chai.request(server)
      .post('/api/v1/attributes')
      .set('content-type', 'application/json')
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).have.property('data');
        testId = res.body.data.id;
        done();
      })
  });
  it('get list attributes', function (done) {
    chai.request(server)
      .get('/api/v1/attributes')
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.total).greaterThan(0);
        done();
      });
  });
  it('create new attribute should be error dupplicate data', function (done) {
    chai.request(server)
      .post('/api/v1/attributes')
      .set('content-type', 'application/json')
      .send(data)
      .end((_, res) => {
        expect(res).to.have.status(409);
        done();
      })
  });
  it('create new attribute should be error when name missing', function (done) {
    const invalidData = Object.assign({}, data);
    delete invalidData.name
    chai.request(server)
      .post('/api/v1/attributes')
      .set('content-type', 'application/json')
      .send(invalidData)
      .end((_, res) => {
        expect(res).to.have.status(400);
        done();
      })
  });
  it('attribute detail should has properties equal after created', function (done) {
    chai.request(server)
      .get('/api/v1/attributes/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.name).to.equal(data.name)
        expect(res.body.data.priority).to.equal(data.priority)
        done();
      })
  })
  const updateName = uniqueNamesGenerator({ dictionaries: ['Test', names] })
  it('update attribute', function (done) {
    chai.request(server)
      .put('/api/v1/attributes/' + testId)
      .set('content-type', 'application/json')
      .send({ name: updateName })
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('attribute detail should has properties equal the previous after updated', function (done) {
    chai.request(server)
      .get('/api/v1/attributes/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.name).to.equal(updateName)
        done();
      })
  })
  it('delete attribute successful', function (done) {
    chai.request(server)
      .delete('/api/v1/attributes/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
  it('delete attribute should be failed because attribute is deleted', function (done) {
    chai.request(server)
      .delete('/api/v1/attributes/' + testId)
      .end((_, res) => {
        expect(res).to.have.status(404);
        done();
      })
  })
});