const User = require('../models/User');
const Task = require('../models/Task');
const StudySession = require('../models/StudySession');

const updateStreak = async (userId) => {
  const user = await User.findById(userId);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

  const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
  if (lastActive) lastActive.setHours(0, 0, 0, 0);

  // Check if user did something today
  const todayEnd = new Date(today); todayEnd.setHours(23, 59, 59, 999);
  const [taskToday, sessionToday] = await Promise.all([
    Task.exists({ user: userId, status: 'Completed', completedAt: { $gte: today, $lte: todayEnd } }),
    StudySession.exists({ user: userId, date: { $gte: today, $lte: todayEnd } }),
  ]);

  const activeToday = taskToday || sessionToday;
  if (!activeToday) return;

  let newStreak = user.currentStreak;
  let newTotalDays = user.totalActiveDays;

  if (!lastActive) {
    // First ever activity
    newStreak = 1;
    newTotalDays = 1;
  } else if (lastActive.getTime() === today.getTime()) {
    // Already counted today
    return;
  } else if (lastActive.getTime() === yesterday.getTime()) {
    // Consecutive day
    newStreak += 1;
    newTotalDays += 1;
  } else {
    // Streak broken
    newStreak = 1;
    newTotalDays += 1;
  }

  const newLongest = Math.max(newStreak, user.longestStreak);

  await User.findByIdAndUpdate(userId, {
    currentStreak: newStreak,
    longestStreak: newLongest,
    totalActiveDays: newTotalDays,
    lastActiveDate: new Date(),
  });
};

module.exports = { updateStreak };
