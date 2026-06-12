const Achievement = require('../models/Achievement');
const Task = require('../models/Task');
const User = require('../models/User');
const StudySession = require('../models/StudySession');
const Proof = require('../models/Proof');

const ACHIEVEMENTS = [
  { key: 'first_task', icon: '🏆', title: 'First Task Completed', description: 'Completed your very first task!' },
  { key: 'streak_7', icon: '🔥', title: '7-Day Streak', description: 'Maintained a 7-day learning streak!' },
  { key: 'streak_30', icon: '⚡', title: '30-Day Streak', description: 'Incredible! 30 days of consistency!' },
  { key: 'hours_100', icon: '📚', title: '100 Study Hours', description: 'Logged 100 total study hours!' },
  { key: 'tasks_100', icon: '💯', title: '100 Tasks Completed', description: 'Completed 100 tasks!' },
  { key: 'tasks_10', icon: '✅', title: '10 Tasks Completed', description: 'Completed 10 tasks!' },
  { key: 'tasks_50', icon: '🎯', title: '50 Tasks Completed', description: 'Completed 50 tasks!' },
  { key: 'first_proof', icon: '📸', title: 'First Proof Uploaded', description: 'Uploaded your first proof of work!' },
  { key: 'streak_3', icon: '🌱', title: '3-Day Streak', description: 'Started building your streak!' },
  { key: 'hours_10', icon: '⏱️', title: '10 Study Hours', description: 'Logged 10 study hours!' },
  { key: 'hours_50', icon: '🕐', title: '50 Study Hours', description: 'Logged 50 study hours!' },
];

const checkAchievements = async (userId) => {
  const user = await User.findById(userId);
  const existing = await Achievement.find({ user: userId }).select('key');
  const existingKeys = new Set(existing.map(a => a.key));

  const [taskCount, proofCount] = await Promise.all([
    Task.countDocuments({ user: userId, status: 'Completed' }),
    Proof.countDocuments({ user: userId }),
  ]);

  const newAchievements = [];

  const unlock = async (def) => {
    if (!existingKeys.has(def.key)) {
      const a = await Achievement.create({ user: userId, ...def });
      await User.findByIdAndUpdate(userId, { $push: { achievements: a._id } });
      newAchievements.push(a);
      existingKeys.add(def.key);
    }
  };

  for (const def of ACHIEVEMENTS) {
    switch (def.key) {
      case 'first_task': if (taskCount >= 1) await unlock(def); break;
      case 'tasks_10': if (taskCount >= 10) await unlock(def); break;
      case 'tasks_50': if (taskCount >= 50) await unlock(def); break;
      case 'tasks_100': if (taskCount >= 100) await unlock(def); break;
      case 'streak_3': if (user.currentStreak >= 3) await unlock(def); break;
      case 'streak_7': if (user.currentStreak >= 7) await unlock(def); break;
      case 'streak_30': if (user.currentStreak >= 30) await unlock(def); break;
      case 'hours_10': if (user.totalStudyHours >= 10) await unlock(def); break;
      case 'hours_50': if (user.totalStudyHours >= 50) await unlock(def); break;
      case 'hours_100': if (user.totalStudyHours >= 100) await unlock(def); break;
      case 'first_proof': if (proofCount >= 1) await unlock(def); break;
    }
  }

  return newAchievements;
};

module.exports = { checkAchievements };
