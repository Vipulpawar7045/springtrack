const Proof = require('../models/Proof');
const Task = require('../models/Task');
const { cloudinary } = require('../config/cloudinary');

const uploadProof = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const { taskId, description } = req.body;
    const fileType = req.file.mimetype.includes('pdf') ? 'pdf' : 'image';

    const proof = await Proof.create({
      user: req.user._id,
      task: taskId || null,
      url: req.file.path,
      publicId: req.file.filename,
      fileType,
      originalName: req.file.originalname,
      description,
    });

    if (taskId) await Task.findByIdAndUpdate(taskId, { $push: { proofs: proof._id } });

    res.status(201).json({ success: true, proof });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getProofs = async (req, res) => {
  try {
    const proofs = await Proof.find({ user: req.user._id }).populate('task', 'title').sort({ createdAt: -1 });
    res.json({ success: true, proofs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const deleteProof = async (req, res) => {
  try {
    const proof = await Proof.findOne({ _id: req.params.id, user: req.user._id });
    if (!proof) return res.status(404).json({ success: false, message: 'Proof not found' });
    await cloudinary.uploader.destroy(proof.publicId, { resource_type: proof.fileType === 'pdf' ? 'raw' : 'image' });
    await proof.deleteOne();
    res.json({ success: true, message: 'Proof deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { uploadProof, getProofs, deleteProof };
