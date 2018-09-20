const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Folder = require('../models/folder');

const { folders } = require('../db/seed/folders');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Folder Testing', function() {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser: true })
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Folder.insertMany(folders);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  //GET======================================================================
  describe('GET requests to /api/folders', function() {
    it('Should return all the folders in the db', function() {
      let res;

      return chai.request(app).get('/api/folders')
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          return Folder.count();
        })
        .then(function(count) {
          expect(res.body).to.have.length(count);
          expect(res.body[0]).to.be.a('object');
        });
    });

    it('Should return one note when called by id', function() {
      let searchId;

      return chai.request(app).get('/api/folders')
        .then(function(res) {
          searchId = res.body[0].id;
        })
        .then(function() {
          return chai.request(app).get(`/api/folders/${searchId}`);
        })
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res.body.id).to.equal(searchId);
          expect(res.body).to.be.a('object');
        });
    });
  });

  //POST=====================================================================
  describe('POST requests to /api/folders', function() {
    it('Create a new item, then return the item created', function() {
      const newFolder = {
        name: 'Inserted with POST'
      };

      let res;

      return chai.request(app)
        .post('/api/folders')
        .send (newFolder)
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');

          return Folder.findById(res.body.id);
        })
        .then(function(data) {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });

  //PUT======================================================================
  describe('PUT requests to /api/folders', function() {
    it('Update a folder when selected by Id', function() {
      const updateInfo = {
        name: 'Updated with PUT'
      };
      let searchId;
      let res;

      return chai.request(app)
        .get('/api/folders')
        .then(function(_res) {
          searchId = _res.body[0].id;
          return chai.request(app).put(`/api/folders/${searchId}`)
            .send(updateInfo)
            .then(function(_res) {
              res = _res;
              expect(res).to.have.status(200);
              expect(res.body).to.be.a('object');
              expect(res.body.id).to.equal(searchId);

              return Folder.findById(searchId);
            })
            .then(function(data) {
              expect(res.body.id).to.equal(data.id);
              expect(updateInfo.title).to.equal(data.title);
            });
        });
    });
  });

  //DELETE===================================================================
  describe('DELETE requests to /api/folders', function() {
    it('Deletes a folder when picked by id', function() {
      let searchId;

      return chai.request(app)
        .get('/api/folders')
        .then(function(res) {
          searchId = res.body[0].id;
          return chai.request(app).del(`/api/folders/${searchId}`);
        })
        .then(function(data) {
          expect(data).to.have.status(204);
          expect(Folder.findById(searchId).body).to.be.undefined;
        });
    });
  });

});