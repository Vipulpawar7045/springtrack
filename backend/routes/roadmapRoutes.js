// routes/roadmapRoutes.js
const express = require('express');
const r = express.Router();
const { getRoadmaps, createRoadmap, updateRoadmap, toggleTopic, deleteRoadmap } = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');
r.use(protect);
r.get('/', getRoadmaps);
r.post('/', createRoadmap);
r.put('/:id', updateRoadmap);
r.put('/:id/topics/:topicId/toggle', toggleTopic);
r.delete('/:id', deleteRoadmap);
module.exports = r;
