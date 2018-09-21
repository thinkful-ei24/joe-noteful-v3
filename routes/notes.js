'use strict';

const express = require('express');
const mongoose = require('mongoose');
const Note = require('../models/note');

const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const { searchTerm, folderId, tagId} = req.query;
  let regSearch;

  if (folderId) {
    return Note.find({folderId: folderId})
      .then(results => {
        res.json(results);
      })
      .catch(err => next(err));
  }

  if (tagId) {
    return Note.find({tags: [tagId]})
      .then(results => {
        res.json(results);
      })
      .catch(err => next(err));
  }

  if (searchTerm) {
    regSearch = new RegExp(searchTerm, 'gi');
    return Note.find({$or: [{title: regSearch}, {content: regSearch}]})
      .then(results => {
        res.json(results);
      })
      .catch(err => next(err));
  }

  return Note.find().sort({ updatedAt: 'desc'})
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const {id}= req.params;

  if(id.length !== 24) {
    let err = new Error('Not found');
    err.status = 404;
    next(err);
  }

  return Note.findById(id)
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

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const newNote = req.body;
  const { folderId, tagId } = req.body;

  if(folderId.length !== 24) {
    let err = new Error('folder Id not valid');
    err.status = 400;
    next(err);
  }

  if(tagId.length !== 24) {
    let err = new Error('folder Id not valid');
    err.status = 400;
    next(err);
  }
    
  return Note.create(newNote)
    .then(result => res.status(201).json(result))
    .catch(err => next(err));
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const {id} = req.params;
  const updateData = req.body;
  const { folderId, tagId } = req.body;

  if(id.length !== 24) {
    let err = new Error('Not found');
    err.status = 404;
    next(err);
  }

  if(folderId.length !== 24) {
    let err = new Error('folder Id not valid');
    err.status = 400;
    next(err);
  }

  if(tagId.length !== 24) {
    let err = new Error('tag Id not valid');
    err.status = 400;
    next(err);
  }
  
  return Note.findByIdAndUpdate(id, updateData, {new: true})
    .then(result => res.json(result))
    .catch(err => next(err));
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const {id} = req.params;

  return Note.findByIdAndRemove(id)
    .then(() => res.status(204).end())
    .catch(err => next(err));
});

module.exports = router;