const express = require('express)');
const Tag = require('../models/note');

const router = express.Router();

//GET========================================================
router.get('/', function(req, res, next) {
  const { searchTerm } = req.query;
  let regExSearch;

  if(searchTerm) {
    regExSearch = new RegExp(searchTerm, 'gi');
    return Tag.find({name: regExSearch})
      .then(results => {
        res.json(results);
      })
      .catch(err => next(err));
  }

  return Tag.find().sort({updatedAt: 'desc'})
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

router.get('/:id', function(req, res, next) {
  const { id } = req.params;

  if(id.length !== 24) {
    const err = new Error('Id not valid');
    err.status = 400;
    next(err);
  }

  return Tag.findById(id)
    .then(result => {
      if(result === null) {
        const err = new Error('Id not valid');
        err.status = 404;
        next(err);
      }
      res.json(result);
    })
    .catch(err => next(err));
});

//POST=======================================================
router.post('/', function(req, res, next) {
  const newTag = req.body;

  return Tag.create(newTag)
    .then(result => res.json(result))
    .catch(err => next(err));
});

//PUT========================================================
router.put('/:id', function(req, res, next) {
  const { id } = req.params;
  const newTag = req.body;

  if(id.length !== 24) {
    const err = new Error('Id not valid');
    err.status = 404;
    next(err);
  }

  return Tag.findByIdAndUpdate(id, newTag, {new: true})
    .then(result => res.json(result))
    .catch(err => next(err));
});

//DELETE=====================================================
router.del('/:id', function(req, res, next) {
  const { id } = req.params;

  return Tag.findByIdAndRemove(id)
    .then(() => res.status(204).end())
    .catch(err => next(err));
});

module.exports = router;