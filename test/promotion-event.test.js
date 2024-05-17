const chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect,
  server = require('./index.test');

chai.use(chaiHttp);

const data = {
  name: 'Promotion Event Test',
  from_date: '2022-12-10 07:00',
  to_date: '2022-12-10 20:00',
  price: 10,
  active: true
}

describe('Test Promotion Event module', function () {
  // it('get list promotion events', function (done) {
  //   chai.request(server)
  //     .get('/api/promotion-events')
  //     .end((_, res) => {
  //       expect(res).to.have.status(200);
  //       expect(res.body).to.have.property('data');
  //       done();
  //     });
  // });
  // let testId
  // it('create new event successful', function (done) {
  //   chai.request(server)
  //     .post('/api/promotion-events')
  //     .set('content-type', 'application/json')
  //     .send(data)
  //     .end((_, res) => {
  //       expect(res).to.have.status(200);
  //       expect(res.body).have.property('data');
  //       testId = res.body.data.id;
  //       done();
  //     })
  // });
  // it('create new event should be error dupplicate data', function (done) {
  //   chai.request(server)
  //     .post('/api/promotion-events')
  //     .set('content-type', 'application/json')
  //     .send(data)
  //     .end((_, res) => {
  //       expect(res).to.have.status(409);
  //       done();
  //     })
  // });
  // it('create new event should be error when field required missing', function (done) {
  //   const invalidData = Object.assign({}, data);
  //   delete invalidData.name
  //   chai.request(server)
  //     .post('/api/promotion-events')
  //     .set('content-type', 'application/json')
  //     .send(invalidData)
  //     .end((_, res) => {
  //       expect(res).to.have.status(400);
  //       done();
  //     })
  // });
  // it('event detail should has properties equal after created', function (done) {
  //   chai.request(server)
  //     .get('/api/promotion-events/' + testId)
  //     .end((_, res) => {
  //       expect(res).to.have.status(200);
  //       expect(res.body).to.have.property('data');
  //       expect(res.body.data.name).to.equal(data.name)
  //       expect(res.body.data.price).to.equal(data.price)
  //       done();
  //     })
  // })
  // it('update event', function (done) {
  //   chai.request(server)
  //     .put('/api/promotion-events/' + testId)
  //     .set('content-type', 'application/json')
  //     .send({ name: 'Update Promotion Event name', price: 20000 })
  //     .end((_, res) => {
  //       expect(res).to.have.status(200);
  //       done();
  //     })
  // })
  // it('event detail should has properties equal the previous after updated', function (done) {
  //   chai.request(server)
  //     .get('/api/promotion-events/' + testId)
  //     .end((_, res) => {
  //       expect(res).to.have.status(200);
  //       expect(res.body).to.have.property('data');
  //       expect(res.body.data.name).to.equal('Update Promotion Event name')
  //       expect(res.body.data.price).to.equal(20000)
  //       done();
  //     })
  // })
  // it('delete event successful', function (done) {
  //   chai.request(server)
  //     .delete('/api/promotion-events/' + testId)
  //     .end((_, res) => {
  //       expect(res).to.have.status(200);
  //       done();
  //     })
  // })
  // it('delete event should be failed because event is deleted', function (done) {
  //   chai.request(server)
  //     .delete('/api/promotion-events/' + testId)
  //     .end((_, res) => {
  //       expect(res).to.have.status(404);
  //       done();
  //     })
  // })
});