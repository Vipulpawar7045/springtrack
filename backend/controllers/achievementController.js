const Achievement = require('../models/Achievement');

const getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ user: req.user._id }).sort({ unlockedAt: -1 });
    res.json({ success: true, achievements });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getAchievements };
