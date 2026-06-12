const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  topic: { type: String, default: '' },
  content: { type: String, required: true },
  tags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
