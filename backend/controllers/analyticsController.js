const Task = require('../models/Task');
const StudySession = require('../models/StudySession');
const User = require('../models/User');
const Proof = require('../models/Proof');
const Roadmap = require('../models/Roadmap');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const [tasksToday, pendingTasks, totalProofs, roadmaps, todaySessions, user] = await Promise.all([
      Task.countDocuments({ user: userId, status: 'Completed', completedAt: { $gte: todayStart, $lte: todayEnd } }),
      Task.countDocuments({ user: userId, status: 'Pending' }),
      Proof.countDocuments({ user: userId }),
      Roadmap.find({ user: userId }),
      StudySession.find({ user: userId, date: { $gte: todayStart, $lte: todayEnd } }),
      User.findById(userId),
    ]);

    const studyHoursToday = todaySessions.reduce((sum, s) => sum + s.duration, 0) / 60;
    const totalTopics = roadmaps.reduce((s, r) => s + r.topics.length, 0);
    const completedTopics = roadmaps.reduce((s, r) => s + r.topics.filter(t => t.completed).length, 0);
    const roadmapProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    // Weekly study hours (last 7 days)
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklySessions = await StudySession.find({ user: userId, date: { $gte: weekAgo } });
    const weeklyHours = weeklySessions.reduce((sum, s) => sum + s.duration, 0) / 60;

    res.json({
      success: true,
      stats: {
        tasksCompletedToday: tasksToday,
        pendingTasks,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        studyHoursToday: Math.round(studyHoursToday * 10) / 10,
        weeklyStudyHours: Math.round(weeklyHours * 10) / 10,
        roadmapProgress,
        totalUploadedProofs: totalProofs,
      },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getWeeklyData = async (req, res) => {
  try {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const start = new Date(d); start.setHours(0, 0, 0, 0);
      const end = new Date(d); end.setHours(23, 59, 59, 999);

      const [tasks, sessions] = await Promise.all([
        Task.countDocuments({ user: req.user._id, status: 'Completed', completedAt: { $gte: start, $lte: end } }),
        StudySession.find({ user: req.user._id, date: { $gte: start, $lte: end } }),
      ]);

      days.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: d.toISOString().split('T')[0],
        tasksCompleted: tasks,
        studyHours: Math.round(sessions.reduce((s, x) => s + x.duration, 0) / 60 * 10) / 10,
      });
    }
    res.json({ success: true, data: days });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getCalendarData = async (req, res) => {
  try {
    const { year, month } = req.query;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const [tasks, sessions, notes] = await Promise.all([
      Task.find({ user: req.user._id, status: 'Completed', completedAt: { $gte: start, $lte: end } }, 'completedAt title'),
      StudySession.find({ user: req.user._id, date: { $gte: start, $lte: end } }, 'date duration'),
      require('../models/Note').find({ user: req.user._id, createdAt: { $gte: start, $lte: end } }, 'createdAt title'),
    ]);

    res.json({ success: true, tasks, sessions, notes });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getDashboardStats, getWeeklyData, getCalendarData };
