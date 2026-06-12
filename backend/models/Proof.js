const mongoose = require('mongoose');

const proofSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  fileType: { type: String, enum: ['image', 'pdf'], required: true },
  originalName: { type: String },
  description: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Proof', proofSchema);
