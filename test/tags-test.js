const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Tag = require('../models/tag');

const { tags } = require('../db/seed/tags');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Tags Testing', function() {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser: true })
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Tag.insertMany(tags);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  //GET======================================================================
  describe('GET requests to /api/tags', function() {
    it('Should return all the tags in the db', function() {
      let res;

      return chai.request(app).get('/api/tags')
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          return Tag.count();
        })
        .then(function(count) {
          expect(res.body).to.have.length(count);
          expect(res.body[0]).to.be.a('object');
        });
    });

    it('Should return one tag when called by id', function() {
      let searchId;

      return chai.request(app).get('/api/tags')
        .then(function(res) {
          searchId = res.body[0].id;
        })
        .then(function() {
          return chai.request(app).get(`/api/tags/${searchId}`);
        })
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res.body.id).to.equal(searchId);
          expect(res.body).to.be.a('object');
        });
    });
  });

  //POST=====================================================================
  describe('POST requests to /api/tags', function() {
    it('Create a new tag, then return the tag created', function() {
      const newTag = {
        name: 'Tag made with POST'
      };

      let res;

      return chai.request(app)
        .post('/api/tags')
        .send (newTag)
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');

          return Tag.findById(res.body.id);
        })
        .then(function(data) {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });

  //PUT======================================================================
  describe('PUT requests to /api/tags', function() {
    it('Update a tag when selected by Id', function() {
      const updateInfo = {
        name: 'Updated with PUT'
      };
      let searchId;
      let res;

      return chai.request(app)
        .get('/api/tags')
        .then(function(_res) {
          searchId = _res.body[0].id;
          return chai.request(app).put(`/api/tags/${searchId}`)
            .send(updateInfo)
            .then(function(_res) {
              res = _res;
              expect(res).to.have.status(200);
              expect(res.body).to.be.a('object');
              expect(res.body.id).to.equal(searchId);

              return Tag.findById(searchId);
            })
            .then(function(data) {
              expect(res.body.id).to.equal(data.id);
              expect(updateInfo.name).to.equal(data.name);
            });
        });
    });
  });

  //DELETE===================================================================
  describe('DELETE requests to /api/tags', function() {
    it('Deletes a tag when picked by id', function() {
      let searchId;

      return chai.request(app)
        .get('/api/tags')
        .then(function(res) {
          searchId = res.body[0].id;
          return chai.request(app).del(`/api/tags/${searchId}`);
        })
        .then(function(data) {
          expect(data).to.have.status(204);
          expect(Tag.findById(searchId).body).to.be.undefined;
        });
    });
  });

});