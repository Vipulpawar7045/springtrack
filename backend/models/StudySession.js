const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  duration: { type: Number, required: true }, // in minutes
  type: { type: String, enum: ['Focus', 'Break', 'Custom'], default: 'Focus' },
  date: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('StudySession', studySessionSchema);
