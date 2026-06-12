const Goal = require('../models/Goal');

const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, goals });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const createGoal = async (req, res) => {
  try {
    const goal = await Goal.create({ user: req.user._id, ...req.body });
    res.status(201).json({ success: true, goal });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.json({ success: true, goal });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const deleteGoal = async (req, res) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Goal deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };
