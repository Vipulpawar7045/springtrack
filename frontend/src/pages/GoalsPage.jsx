import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const empty = { title: '', description: '', targetDate: '', totalTopics: 0, completedTopics: 0, status: 'Active' };

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [form, setForm] = useState(empty);

  useEffect(() => { api.get('/goals').then(r => setGoals(r.data.goals)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editGoal) {
        const res = await api.put(`/goals/${editGoal._id}`, form);
        setGoals(gs => gs.map(g => g._id === editGoal._id ? res.data.goal : g));
        toast.success('Goal updated!');
      } else {
        const res = await api.post('/goals', form);
        setGoals(gs => [res.data.goal, ...gs]);
        toast.success('Goal created!');
      }
      setShowForm(false); setEditGoal(null); setForm(empty);
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete goal?')) return;
    await api.delete(`/goals/${id}`);
    setGoals(gs => gs.filter(g => g._id !== id));
    toast.success('Goal deleted');
  };

  const openEdit = (g) => {
    setForm({ title: g.title, description: g.description, targetDate: g.targetDate?.split('T')[0] || '', totalTopics: g.totalTopics, completedTopics: g.completedTopics, status: g.status });
    setEditGoal(g); setShowForm(true);
  };

  const set = k => e => setForm({ ...form, [k]: e.target.value });
  const statusColor = { Active: 'bg-green-100 text-green-700', Completed: 'bg-blue-100 text-blue-700', Paused: 'bg-amber-100 text-amber-700' };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Goals 🎯</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track your long-term objectives</p>
        </div>
        <button onClick={() => { setEditGoal(null); setForm(empty); setShowForm(true); }} className="btn-primary">+ New Goal</button>
      </div>

      {goals.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="text-5xl block mb-3">🎯</span>
          <p className="text-slate-500 font-medium">No goals yet</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mt-4">Set First Goal</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {goals.map(g => {
            const progress = g.totalTopics > 0 ? Math.round(g.completedTopics / g.totalTopics * 100) : 0;
            const daysLeft = g.targetDate ? Math.ceil((new Date(g.targetDate) - new Date()) / 86400000) : null;
            return (
              <div key={g._id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-800 dark:text-white">{g.title}</h3>
                      <span className={`badge ${statusColor[g.status]}`}>{g.status}</span>
                    </div>
                    {g.description && <p className="text-sm text-slate-500 mt-0.5">{g.description}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(g)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">✏️</button>
                    <button onClick={() => handleDelete(g._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 rounded-lg">🗑️</button>
                  </div>
                </div>

                {g.totalTopics > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>{g.completedTopics}/{g.totalTopics} topics</span>
                      <span className="font-semibold text-indigo-600">{progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

                <div className="flex gap-4 text-xs text-slate-400">
                  {g.targetDate && <span>📅 Target: {new Date(g.targetDate).toLocaleDateString()}</span>}
                  {daysLeft !== null && <span className={daysLeft < 0 ? 'text-red-500' : daysLeft < 7 ? 'text-amber-500' : ''}>{daysLeft < 0 ? 'Overdue' : `${daysLeft} days left`}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">{editGoal ? 'Edit Goal' : 'New Goal'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Goal Title *</label>
                <input className="input" placeholder="e.g. Complete Spring Security" value={form.title} onChange={set('title')} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea className="input resize-none" rows={2} value={form.description} onChange={set('description')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Date</label>
                  <input type="date" className="input" value={form.targetDate} onChange={set('targetDate')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select className="input" value={form.status} onChange={set('status')}>
                    {['Active', 'Completed', 'Paused'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Topics</label>
                  <input type="number" min="0" className="input" value={form.totalTopics} onChange={set('totalTopics')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Completed Topics</label>
                  <input type="number" min="0" className="input" value={form.completedTopics} onChange={set('completedTopics')} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">{editGoal ? 'Update' : 'Create Goal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
