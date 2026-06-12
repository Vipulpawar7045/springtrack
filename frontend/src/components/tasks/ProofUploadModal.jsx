import React, { useState, useRef } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ProofUploadModal({ taskId, taskTitle, onClose, onUploaded }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handleFiles = (selected) => {
    const valid = Array.from(selected).filter(f =>
      ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'].includes(f.type)
    );
    if (valid.length !== selected.length) toast.error('Only PNG, JPG, JPEG, PDF allowed');
    setFiles(valid);
    const previews = valid.map(f => ({
      name: f.name,
      type: f.type,
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
    }));
    setPreviews(previews);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (files.length === 0) { toast.error('Please select a file'); return; }
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        if (taskId) fd.append('taskId', taskId);
        if (description) fd.append('description', description);
        await api.post('/proofs/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      toast.success(`${files.length} file(s) uploaded successfully! 📸`);
      onUploaded?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Upload Proof 📸</h2>
            {taskTitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">For: {taskTitle}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition">✕</button>
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current.click()}
          className="border-2 border-dashed border-indigo-200 dark:border-indigo-700 rounded-2xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
        >
          <span className="text-4xl block mb-2">📤</span>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Drop files here or click to browse</p>
          <p className="text-xs text-slate-400 mt-1">PNG, JPG, JPEG, PDF • Max 10MB each</p>
          <input ref={inputRef} type="file" multiple accept=".png,.jpg,.jpeg,.pdf"
            className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        </div>

        {/* Previews */}
        {previews.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Selected files ({previews.length}):</p>
            <div className="flex flex-wrap gap-2">
              {previews.map((p, i) => (
                <div key={i} className="relative">
                  {p.preview ? (
                    <img src={p.preview} alt={p.name}
                      className="w-20 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-600" />
                  ) : (
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700 flex flex-col items-center justify-center">
                      <span className="text-2xl">📄</span>
                      <span className="text-xs text-red-600 dark:text-red-400 mt-1">PDF</span>
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); setFiles(f => f.filter((_, j) => j !== i)); setPreviews(p => p.filter((_, j) => j !== i)); }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (optional)</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="e.g. Screenshot of completed Spring DI lecture..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleUpload} disabled={uploading || files.length === 0} className="btn-primary flex-1">
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </span>
            ) : `Upload ${files.length > 0 ? `(${files.length})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
