const Task = require('../models/Task');
const User = require('../models/User');
const { checkAchievements } = require('../utils/achievementEngine');
const { updateStreak } = require('../utils/streakEngine');

// @GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const { status, priority, search, date } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const tasks = await Task.find(filter).populate('proofs').sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, category, priority, deadline } = req.body;
    const task = await Task.create({ user: req.user._id, title, description, category, priority, deadline });
    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    Object.assign(task, req.body);
    await task.save();
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/tasks/:id/complete
const completeTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.status = 'Completed';
    task.completedAt = new Date();
    await task.save();

    await updateStreak(req.user._id);
    const newAchievements = await checkAchievements(req.user._id);

    res.json({ success: true, task, newAchievements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getTasks, createTask, updateTask, completeTask, deleteTask };
