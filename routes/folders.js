const express = require('express');
const mongoose = require('mongoose');
const Folder = require('../models/folder');

const router = express.Router();

//GET=======================================================
//GET all folders=============================
router.get('/', (req, res, next) => {
  const { searchTerm } = req.query;
  let regExSearch;

  if (searchTerm) {
    regExSearch = new RegExp(searchTerm, 'gi');
    return Folder.find({$or: [{name: regExSearch}]})
      .then(results => {
        res.json(results);
      })
      .catch(err => next(err));
  }

  return Folder.find().sort({ updatedAt: 'desc'})
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

//GET folder by id============================
router.get('/:id', (req, res, next) => {
  const {id}= req.params;
  
  if(id.length !== 24) {
    let err = new Error('Not found');
    err.status = 404;
    next(err);
  }

  return Folder.findById(id)
    .then(result => {     
      if(result === null) {
        let err = new Error('Not found');
        err.status = 404;
        next(err);
      }
      res.json(result);
    }) 
    .catch(err => next(err));
});

//POST======================================================
router.post('/', (req, res, next) => {
  const newNote = req.body;
    
  return Folder.create(newNote)
    .then(result => res.status(201).json(result))
    .catch(err => next(err));
});

//PUT=======================================================
router.put('/:id', (req, res, next) => {
  const {id} = req.params;
  const updateData = req.body;

  if(id.length !== 24) {
    let err = new Error('Not found');
    err.status = 404;
    next(err);
  }

  return Folder.findByIdAndUpdate(id, updateData, {new: true})
    .then(result => res.json(result))
    .catch(err => next(err));
});

//DELETE====================================================
router.delete('/:id', (req, res, next) => {
  const {id} = req.params;

  return Folder.findByIdAndRemove(id, {$unset: {name: ''}})
    .then(() => res.status(204).end())
    .catch(err => next(err));
});

module.exports = router;