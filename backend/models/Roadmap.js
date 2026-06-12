const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
});

const roadmapSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  topics: [topicSchema],
  color: { type: String, default: '#6366f1' },
}, { timestamps: true });

roadmapSchema.virtual('progress').get(function () {
  if (this.topics.length === 0) return 0;
  return Math.round((this.topics.filter(t => t.completed).length / this.topics.length) * 100);
});

roadmapSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Roadmap', roadmapSchema);
