const StudySession = require('../models/StudySession');
const User = require('../models/User');
const { updateStreak } = require('../utils/streakEngine');
const { checkAchievements } = require('../utils/achievementEngine');

const getSessions = async (req, res) => {
  try {
    const sessions = await StudySession.find({ user: req.user._id }).sort({ date: -1 }).limit(100);
    res.json({ success: true, sessions });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const createSession = async (req, res) => {
  try {
    const { duration, type, notes } = req.body;
    const session = await StudySession.create({ user: req.user._id, duration, type, notes });

    // Update total study hours
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalStudyHours: duration / 60 } });

    await updateStreak(req.user._id);
    const newAchievements = await checkAchievements(req.user._id);

    res.status(201).json({ success: true, session, newAchievements });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const deleteSession = async (req, res) => {
  try {
    await StudySession.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Session deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getSessions, createSession, deleteSession };
