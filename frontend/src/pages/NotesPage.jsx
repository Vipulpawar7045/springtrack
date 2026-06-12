import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const empty = { title: '', topic: '', content: '', tags: '' };

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [form, setForm] = useState(empty);
  const [viewNote, setViewNote] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => fetchNotes(), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchNotes = async () => {
    const res = await api.get('/notes', { params: search ? { search } : {} });
    setNotes(res.data.notes);
  };

  const openCreate = () => { setForm(empty); setEditNote(null); setShowForm(true); };
  const openEdit = (n) => { setForm({ title: n.title, topic: n.topic, content: n.content, tags: (n.tags || []).join(', ') }); setEditNote(n); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    try {
      if (editNote) {
        const res = await api.put(`/notes/${editNote._id}`, payload);
        setNotes(ns => ns.map(n => n._id === editNote._id ? res.data.note : n));
        toast.success('Note updated!');
      } else {
        const res = await api.post('/notes', payload);
        setNotes(ns => [res.data.note, ...ns]);
        toast.success('Note created!');
      }
      setShowForm(false);
    } catch { toast.error('Failed to save note'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    await api.delete(`/notes/${id}`);
    setNotes(ns => ns.filter(n => n._id !== id));
    toast.success('Note deleted');
    if (viewNote?._id === id) setViewNote(null);
  };

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const colors = ['bg-yellow-50 dark:bg-yellow-900/20', 'bg-blue-50 dark:bg-blue-900/20', 'bg-green-50 dark:bg-green-900/20', 'bg-purple-50 dark:bg-purple-900/20', 'bg-pink-50 dark:bg-pink-900/20'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Study Notes 📝</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{notes.length} notes</p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ New Note</button>
      </div>

      <input className="input" placeholder="🔍 Search notes..." value={search} onChange={e => setSearch(e.target.value)} />

      {notes.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="text-5xl block mb-3">📓</span>
          <p className="text-slate-500 font-medium">No notes yet</p>
          <button onClick={openCreate} className="btn-primary mt-4">Write First Note</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((n, i) => (
            <div key={n._id} className={`${colors[i % colors.length]} rounded-2xl p-4 border border-slate-100 dark:border-slate-700 cursor-pointer hover:shadow-md transition-shadow`}
              onClick={() => setViewNote(n)}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 dark:text-white truncate">{n.title}</h3>
                  {n.topic && <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">{n.topic}</p>}
                </div>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => openEdit(n)} className="p-1 hover:bg-white/50 dark:hover:bg-slate-700 rounded-lg">✏️</button>
                  <button onClick={() => handleDelete(n._id)} className="p-1 hover:bg-white/50 dark:hover:bg-slate-700 rounded-lg">🗑️</button>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-3">{n.content}</p>
              {n.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {n.tags.map(tag => <span key={tag} className="badge bg-white/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300">#{tag}</span>)}
                </div>
              )}
              <p className="text-xs text-slate-400 mt-2">{new Date(n.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* View Note Modal */}
      {viewNote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{viewNote.title}</h2>
                {viewNote.topic && <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-0.5">{viewNote.topic}</p>}
                <p className="text-xs text-slate-400 mt-1">{new Date(viewNote.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <button onClick={() => setViewNote(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">✕</button>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-sans">{viewNote.content}</pre>
            </div>
            {viewNote.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-4">
                {viewNote.tags.map(tag => <span key={tag} className="badge bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">#{tag}</span>)}
              </div>
            )}
            <div className="flex gap-3 mt-5">
              <button onClick={() => { openEdit(viewNote); setViewNote(null); }} className="btn-secondary flex-1">Edit</button>
              <button onClick={() => setViewNote(null)} className="btn-primary flex-1">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">{editNote ? 'Edit Note' : 'New Note'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                <input className="input" placeholder="Note title" value={form.title} onChange={set('title')} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Topic</label>
                <input className="input" placeholder="e.g. Dependency Injection" value={form.topic} onChange={set('topic')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content *</label>
                <textarea className="input resize-none font-mono text-sm" rows={6} placeholder="Write your notes here..." value={form.content} onChange={set('content')} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags (comma separated)</label>
                <input className="input" placeholder="spring, java, di" value={form.tags} onChange={set('tags')} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">{editNote ? 'Update' : 'Save Note'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
