const mongoose = require('mongoose');

const foldersSchema = new mongoose.Schema({
  name: {type: String, required: true, unique: true},
});

foldersSchema.set('timestamps', true);

foldersSchema.set('toObject', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Folder', foldersSchema);