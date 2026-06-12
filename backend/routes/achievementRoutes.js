const express = require('express');
const r = express.Router();
const { getAchievements } = require('../controllers/achievementController');
const { protect } = require('../middleware/authMiddleware');
r.use(protect);
r.get('/', getAchievements);
module.exports = r;
