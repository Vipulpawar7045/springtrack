const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'General' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  deadline: { type: Date },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  completedAt: { type: Date, default: null },
  proofs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Proof' }],
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
