const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema({
  title: {type: String, required: true},
  content: String,
  folderId: {type: mongoose.Schema.Types.ObjectId, ref: 'Folder'},
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}]
});

notesSchema.set('timestamps', true);

notesSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
    delete ret.__v;
  }
});

module.exports = mongoose.model('Note', notesSchema);