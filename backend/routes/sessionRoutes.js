const express = require('express');
const r = express.Router();
const { getSessions, createSession, deleteSession } = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');
r.use(protect);
r.get('/', getSessions);
r.post('/', createSession);
r.delete('/:id', deleteSession);
module.exports = r;
