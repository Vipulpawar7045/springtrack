const Note = require('../models/Note');

const getNotes = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { user: req.user._id };
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { topic: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];
    const notes = await Note.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, notes });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const createNote = async (req, res) => {
  try {
    const { title, topic, content, tags } = req.body;
    const note = await Note.create({ user: req.user._id, title, topic, content, tags });
    res.status(201).json({ success: true, note });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const updateNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, note });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, message: 'Note deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getNotes, createNote, updateNote, deleteNote };
