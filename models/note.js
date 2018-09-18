const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema({
  title: {type: String, required: true},
  content: String
});

notesSchema.set('timestamps', true);

module.exports = mongoose.model('Note', notesSchema);