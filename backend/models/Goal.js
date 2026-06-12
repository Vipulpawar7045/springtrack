const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  targetDate: { type: Date },
  totalTopics: { type: Number, default: 0 },
  completedTopics: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Completed', 'Paused'], default: 'Active' },
}, { timestamps: true });

goalSchema.virtual('progress').get(function () {
  if (this.totalTopics === 0) return 0;
  return Math.round((this.completedTopics / this.totalTopics) * 100);
});

goalSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Goal', goalSchema);
