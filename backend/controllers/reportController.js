const PDFDocument = require('pdfkit');
const Task = require('../models/Task');
const StudySession = require('../models/StudySession');
const Achievement = require('../models/Achievement');
const Roadmap = require('../models/Roadmap');
const Proof = require('../models/Proof');
const User = require('../models/User');

const generateReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    const [tasks, sessions, achievements, roadmaps, proofs] = await Promise.all([
      Task.find({ user: userId, status: 'Completed' }).sort({ completedAt: -1 }).limit(50),
      StudySession.find({ user: userId }).sort({ date: -1 }).limit(100),
      Achievement.find({ user: userId }),
      Roadmap.find({ user: userId }),
      Proof.countDocuments({ user: userId }),
    ]);

    const totalMinutes = sessions.reduce((s, x) => s + x.duration, 0);
    const totalTopics = roadmaps.reduce((s, r) => s + r.topics.length, 0);
    const completedTopics = roadmaps.reduce((s, r) => s + r.topics.filter(t => t.completed).length, 0);

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=springtrack-report-${Date.now()}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(28).fillColor('#6366f1').text('SpringTrack', { align: 'center' });
    doc.fontSize(14).fillColor('#64748b').text('Learning Progress Report', { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e2e8f0').stroke();
    doc.moveDown();

    // User Info
    doc.fontSize(18).fillColor('#1e293b').text('User Information');
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#475569');
    doc.text(`Name: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Member Since: ${new Date(user.createdAt).toLocaleDateString()}`);
    doc.text(`Current Goal: ${user.currentGoal || 'Not set'}`);
    doc.moveDown();

    // Stats
    doc.fontSize(18).fillColor('#1e293b').text('Study Statistics');
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#475569');
    doc.text(`Total Study Hours: ${Math.round(totalMinutes / 60 * 10) / 10} hours`);
    doc.text(`Tasks Completed: ${tasks.length}`);
    doc.text(`Current Streak: ${user.currentStreak} days`);
    doc.text(`Longest Streak: ${user.longestStreak} days`);
    doc.text(`Total Active Days: ${user.totalActiveDays}`);
    doc.text(`Evidence Files Uploaded: ${proofs}`);
    doc.moveDown();

    // Roadmap
    doc.fontSize(18).fillColor('#1e293b').text('Roadmap Progress');
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#475569');
    doc.text(`Total Topics: ${totalTopics} | Completed: ${completedTopics} | Progress: ${totalTopics > 0 ? Math.round(completedTopics / totalTopics * 100) : 0}%`);
    roadmaps.forEach(r => {
      const done = r.topics.filter(t => t.completed).length;
      doc.text(`  • ${r.title}: ${done}/${r.topics.length} topics`);
    });
    doc.moveDown();

    // Achievements
    doc.fontSize(18).fillColor('#1e293b').text('Achievements Earned');
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#475569');
    if (achievements.length === 0) {
      doc.text('No achievements yet. Keep going!');
    } else {
      achievements.forEach(a => doc.text(`  ${a.icon} ${a.title} – ${new Date(a.unlockedAt).toLocaleDateString()}`));
    }
    doc.moveDown();

    // Recent Tasks
    doc.fontSize(18).fillColor('#1e293b').text('Recent Completed Tasks');
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#475569');
    tasks.slice(0, 15).forEach(t => {
      doc.text(`  ✓ ${t.title} [${t.category}] – ${new Date(t.completedAt).toLocaleDateString()}`);
    });

    doc.moveDown(2);
    doc.fontSize(10).fillColor('#94a3b8').text(`Generated on ${new Date().toLocaleString()} by SpringTrack`, { align: 'center' });

    doc.end();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { generateReport };
