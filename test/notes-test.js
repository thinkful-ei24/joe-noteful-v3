const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');

const { notes } = require('../db/seed/notes');

const expect = chai.expect;
chai.use(chaiHttp);

describe.only('Notes testing', function() {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Note.insertMany(notes);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  //GET requests---------------------------------------------------------
  describe('GET requests to /api/notes', function() {

    it('Should return all the notes in the db', function() {
      let res;
      return chai.request(app).get('/api/notes')
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          return Note.count();
        })
        .then(function(count) {
          expect(res.body).to.have.length(count);
          expect(res.body[0]).to.be.a('object');
        });
    });

    it('Should return one note when called by id', function() {
      let searchId;

      return chai.request(app).get('/api/notes')
        .then(function(res) {
          searchId = res.body[0].id;
        })
        .then(function() {
          return chai.request(app).get(`/api/notes/${searchId}`);
        })
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res.body.id).to.equal(searchId);
          expect(res.body).to.be.a('object');
        });
    });
  });
  
  //POST create a new note -------------------------------------------------------------
  describe('POST request to /api/notes', function() {
    it('Create a new item, then return the item created', function() {
      const newNote = {
        title: 'Honey BooBoo the Second',
        content: 'I created this by POST'
      };

      let res;

      return chai.request(app)
        .post('/api/notes')
        .send(newNote)
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');

          return Note.findById(res.body.id);
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

  //PUT update an item by id ------------------------------------------------------------
  describe('PUT requests to /api/notes/:id', function() {
    it('Update and item when selected by Id', function() {
      const updateInfo = {
        title: 'Honey Boo Boo',
        content: 'Testing now'
      };
      let searchId;
      let res;

      return chai.request(app)
        .get('/api/notes')
        .then(function(_res) {
          searchId = _res.body[0].id;
          return chai.request(app).put(`/api/notes/${searchId}`)
            .send(updateInfo)
            .then(function(_res) {
              res = _res;
              expect(res).to.have.status(200);
              expect(res.body).to.be.a('object');
              expect(res.body.id).to.equal(searchId);

              return Note.findById(searchId);
            })
            .then(function(data) {
              expect(res.body.id).to.equal(data.id);
              expect(updateInfo.title).to.equal(data.title);
            });
        });
    });
  });

  //DELETE erase an item  ------------------------------------------------------
  describe('DELETE to api/notes/:id', function() {

    it('Deletes an item when picked by id', function() {
      let searchId;

      return chai.request(app)
        .get('/api/notes')
        .then(function(res) {
          searchId = res.body[0].id;
          return chai.request(app).del(`/api/notes/${searchId}`);
        })
        .then(function(data) {
          expect(data).to.have.status(204);
          expect(Note.findById(searchId).body).to.be.undefined;
        });
    });
  });
});