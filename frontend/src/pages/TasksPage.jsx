import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ProofUploadModal from '../components/tasks/ProofUploadModal';

const PRIORITIES = ['Low', 'Medium', 'High'];
const CATEGORIES = ['General', 'Spring Boot', 'Java', 'DSA', 'Web Dev', 'Database', 'DevOps', 'Testing', 'Other'];
const FILTERS = ['All', 'Today', 'Completed', 'Pending', 'High Priority'];

const priorityColor = { Low: 'bg-green-100 text-green-700', Medium: 'bg-amber-100 text-amber-700', High: 'bg-red-100 text-red-700' };

const emptyForm = { title: '', description: '', category: 'General', priority: 'Medium', deadline: '' };

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [proofModal, setProofModal] = useState(null); // { taskId, taskTitle }

  const fetchTasks = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (filter === 'Completed') params.status = 'Completed';
      if (filter === 'Pending') params.status = 'Pending';
      if (filter === 'High Priority') params.priority = 'High';
      if (filter === 'Today') params.date = new Date().toISOString().split('T')[0];
      const res = await api.get('/tasks', { params });
      setTasks(res.data.tasks);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, [filter, search]);

  const openCreate = () => { setForm(emptyForm); setEditTask(null); setShowForm(true); };
  const openEdit = (t) => { setForm({ title: t.title, description: t.description, category: t.category, priority: t.priority, deadline: t.deadline ? t.deadline.split('T')[0] : '' }); setEditTask(t); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editTask) {
        const res = await api.put(`/tasks/${editTask._id}`, form);
        setTasks(ts => ts.map(t => t._id === editTask._id ? res.data.task : t));
        toast.success('Task updated!');
      } else {
        const res = await api.post('/tasks', form);
        setTasks(ts => [res.data.task, ...ts]);
        toast.success('Task created!');
      }
      setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleComplete = async (task) => {
    try {
      const res = await api.put(`/tasks/${task._id}/complete`);
      setTasks(ts => ts.map(t => t._id === task._id ? res.data.task : t));
      if (res.data.newAchievements?.length) {
        res.data.newAchievements.forEach(a => toast.success(`${a.icon} Achievement unlocked: ${a.title}!`));
      }
      toast.success('Task completed! 🎉');
      // Auto-open proof upload
      setProofModal({ taskId: task._id, taskTitle: task.title });
    } catch { toast.error('Failed to complete task'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(ts => ts.filter(t => t._id !== id));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Tasks ✅</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{tasks.length} tasks found</p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ New Task</button>
      </div>

      {/* Filters + Search */}
      <div className="card p-4 space-y-3">
        <input className="input" placeholder="🔍 Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="text-5xl block mb-3">📋</span>
          <p className="text-slate-500 dark:text-slate-400 font-medium">No tasks found</p>
          <p className="text-sm text-slate-400 mt-1">Create a task to get started</p>
          <button onClick={openCreate} className="btn-primary mt-4">+ Create Task</button>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task._id} className={`card p-4 border-l-4 ${task.status === 'Completed' ? 'border-green-400 opacity-75' : 'border-indigo-400'}`}>
              <div className="flex items-start gap-3">
                {/* Complete checkbox */}
                <button
                  onClick={() => task.status === 'Pending' && handleComplete(task)}
                  className={`mt-1 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${task.status === 'Completed' ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 dark:border-slate-500 hover:border-green-400'}`}
                >
                  {task.status === 'Completed' && <span className="text-xs">✓</span>}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`font-semibold text-slate-800 dark:text-white ${task.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </h3>
                    <span className={`badge ${priorityColor[task.priority]}`}>{task.priority}</span>
                    <span className="badge bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">{task.category}</span>
                    {task.proofs?.length > 0 && (
                      <span className="badge bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">📸 {task.proofs.length} proof(s)</span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{task.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
                    {task.deadline && <span>📅 Due: {new Date(task.deadline).toLocaleDateString()}</span>}
                    {task.completedAt && <span>✅ Done: {new Date(task.completedAt).toLocaleDateString()}</span>}
                    <span>📌 {new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setProofModal({ taskId: task._id, taskTitle: task.title })}
                    className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition"
                    title="Upload proof"
                  >📸</button>
                  <button onClick={() => openEdit(task)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition" title="Edit">✏️</button>
                  <button onClick={() => handleDelete(task._id)} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition" title="Delete">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">{editTask ? 'Edit Task' : 'New Task'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                <input className="input" placeholder="e.g. Learn Spring Dependency Injection" value={form.title} onChange={set('title')} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea className="input resize-none" rows={2} placeholder="What will you do?" value={form.description} onChange={set('description')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select className="input" value={form.category} onChange={set('category')}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select className="input" value={form.priority} onChange={set('priority')}>
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deadline</label>
                <input type="date" className="input" value={form.deadline} onChange={set('deadline')} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">{editTask ? 'Update' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proof Upload Modal */}
      {proofModal && (
        <ProofUploadModal
          taskId={proofModal.taskId}
          taskTitle={proofModal.taskTitle}
          onClose={() => setProofModal(null)}
          onUploaded={fetchTasks}
        />
      )}
    </div>
  );
}
