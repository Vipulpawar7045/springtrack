const Roadmap = require('../models/Roadmap');

const getRoadmaps = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, roadmaps });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const createRoadmap = async (req, res) => {
  try {
    const { title, description, topics, color } = req.body;
    const formattedTopics = (topics || []).map(t => ({ name: typeof t === 'string' ? t : t.name }));
    const roadmap = await Roadmap.create({ user: req.user._id, title, description, topics: formattedTopics, color });
    res.status(201).json({ success: true, roadmap });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const updateRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });
    res.json({ success: true, roadmap });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const toggleTopic = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ _id: req.params.id, user: req.user._id });
    if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });
    const topic = roadmap.topics.id(req.params.topicId);
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });
    topic.completed = !topic.completed;
    topic.completedAt = topic.completed ? new Date() : null;
    await roadmap.save();
    res.json({ success: true, roadmap });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const deleteRoadmap = async (req, res) => {
  try {
    await Roadmap.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Roadmap deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getRoadmaps, createRoadmap, updateRoadmap, toggleTopic, deleteRoadmap };
