const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

//FIND BY SEARCHTERM
mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(() => {
    const searchTerm = 'lady gaga';
    let filter = {};

    if (searchTerm) {
      filter.title = { $regex: searchTerm };
    }

    return Note.find(filter).sort({ updatedAt: 'desc' });
  })
  .then(results => {
    console.log(results);
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

// FIND BY ID
mongoose.connect(MONGODB_URI, {useNewUrlParser:true})
  .then(() => {
    const searchId = '000000000000000000000001';

    return Note.findById(searchId);
  })
  .then(results => console.log(results))
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

//CREATE NEW NOTE
mongoose.connect(MONGODB_URI, {useNewUrlParser:true})
  .then(() => {
    const newNote = {
      title: 'My mama said: "Test this create endpoint, son"',
      content: 'Let it work on the first try, node.js gods'
    };

    return Note.create(newNote);
  })
  .then(result => console.log(result))
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
//   });

// UPDATE NOTE BY ID
mongoose.connect(MONGODB_URI, {useNewUrlParser: true})
  .then(() => {
    const updateId = '000000000000000000000002';
    const updateData = {
      title: 'I shall update this note',
      content: 'It will work the first time'
    };

    return Note.findByIdAndUpdate(updateId, updateData, {new: true});
  })
  .then(result => console.log(result))
  .then(() => {
    mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

//DELETE BY ID

mongoose.connect(MONGODB_URI, {useNewUrlParser: true})
  .then(() => {
    const deleteId = '000000000000000000000004';

    return Note.findByIdAndRemove(deleteId);
  })
  .then(result => console.log(result))
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });