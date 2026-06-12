import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ProofUploadModal from '../components/tasks/ProofUploadModal';

export default function ProofsPage() {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchProofs = async () => {
    const res = await api.get('/proofs');
    setProofs(res.data.proofs);
    setLoading(false);
  };

  useEffect(() => { fetchProofs(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this proof?')) return;
    try {
      await api.delete(`/proofs/${id}`);
      setProofs(ps => ps.filter(p => p._id !== id));
      if (selected?._id === id) setSelected(null);
      toast.success('Proof deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Proofs 📸</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{proofs.length} files uploaded</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="btn-primary">+ Upload Proof</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Files', value: proofs.length, icon: '📁' },
          { label: 'Images', value: proofs.filter(p => p.fileType === 'image').length, icon: '🖼️' },
          { label: 'PDFs', value: proofs.filter(p => p.fileType === 'pdf').length, icon: '📄' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card p-4 text-center">
            <span className="text-2xl">{icon}</span>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading proofs...</div>
      ) : proofs.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="text-5xl block mb-3">📸</span>
          <p className="text-slate-500 font-medium">No proofs uploaded yet</p>
          <p className="text-sm text-slate-400 mt-1">Upload screenshots, notes, or certificates as proof of completion</p>
          <button onClick={() => setShowUpload(true)} className="btn-primary mt-4">Upload First Proof</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {proofs.map(proof => (
            <div key={proof._id} className="card p-2 group relative">
              {/* Thumbnail */}
              <div
                onClick={() => setSelected(proof)}
                className="cursor-pointer aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center"
              >
                {proof.fileType === 'image' ? (
                  <img src={proof.url} alt={proof.originalName} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4">
                    <span className="text-4xl">📄</span>
                    <span className="text-xs text-slate-500 mt-2 text-center truncate w-full">PDF</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-2">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{proof.originalName || 'Untitled'}</p>
                {proof.task?.title && <p className="text-xs text-indigo-600 dark:text-indigo-400 truncate">📌 {proof.task.title}</p>}
                <p className="text-xs text-slate-400 mt-0.5">{new Date(proof.createdAt).toLocaleDateString()}</p>
              </div>

              {/* Actions overlay */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <a href={proof.url} target="_blank" rel="noreferrer"
                  className="w-7 h-7 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center shadow hover:bg-indigo-50 transition text-sm">
                  🔗
                </a>
                <button onClick={() => handleDelete(proof._id)}
                  className="w-7 h-7 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center shadow hover:bg-red-50 transition text-sm">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">{selected.originalName}</p>
                  {selected.description && <p className="text-sm text-slate-500">{selected.description}</p>}
                  {selected.task?.title && <p className="text-xs text-indigo-600 dark:text-indigo-400">Task: {selected.task.title}</p>}
                </div>
                <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">✕</button>
              </div>
              {selected.fileType === 'image' ? (
                <img src={selected.url} alt={selected.originalName} className="w-full max-h-[60vh] object-contain rounded-xl" />
              ) : (
                <div className="text-center py-8">
                  <span className="text-6xl block mb-4">📄</span>
                  <a href={selected.url} target="_blank" rel="noreferrer" className="btn-primary">
                    Open PDF in new tab
                  </a>
                </div>
              )}
              <div className="flex gap-3 mt-4">
                <a href={selected.url} target="_blank" rel="noreferrer" className="btn-secondary flex-1 text-center">🔗 Open</a>
                <button onClick={() => handleDelete(selected._id)} className="btn-danger flex-1">🗑️ Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUpload && (
        <ProofUploadModal onClose={() => setShowUpload(false)} onUploaded={fetchProofs} />
      )}
    </div>
  );
}
