const express = require('express');
const r = express.Router();
const { getDashboardStats, getWeeklyData, getCalendarData } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
r.use(protect);
r.get('/dashboard', getDashboardStats);
r.get('/weekly', getWeeklyData);
r.get('/calendar', getCalendarData);
module.exports = r;
