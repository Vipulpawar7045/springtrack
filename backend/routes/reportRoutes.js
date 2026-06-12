const express = require('express');
const r = express.Router();
const { generateReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
r.use(protect);
r.get('/generate', generateReport);
module.exports = r;
