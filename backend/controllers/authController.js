const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, currentGoal } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Please provide name, email and password' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password, currentGoal });
    res.status(201).json({ success: true, token: generateToken(user._id), user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    res.json({ success: true, token: generateToken(user._id), user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: sanitize(req.user) });
};

// @PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, currentGoal, theme, profilePicture } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, currentGoal, theme, profilePicture }, { new: true });
    res.json({ success: true, user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/auth/password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword)))
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const sanitize = (user) => ({
  _id: user._id, name: user.name, email: user.email,
  profilePicture: user.profilePicture, currentGoal: user.currentGoal,
  totalStudyHours: user.totalStudyHours, currentStreak: user.currentStreak,
  longestStreak: user.longestStreak, totalActiveDays: user.totalActiveDays,
  theme: user.theme, createdAt: user.createdAt,
});

module.exports = { register, login, getMe, updateProfile, changePassword };
