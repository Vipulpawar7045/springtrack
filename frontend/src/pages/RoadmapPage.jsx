import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'];
const DEFAULT_TOPICS = ['Topic 1', 'Topic 2', 'Topic 3'];

const TEMPLATES = {
  'Spring Boot': ['Spring Core', 'Dependency Injection', 'Bean Lifecycle', 'Spring MVC', 'REST APIs', 'Spring Data JPA', 'Hibernate', 'Spring Security', 'JWT Auth', 'Microservices', 'Docker', 'Testing'],
  'Java DSA': ['Arrays', 'Strings', 'Linked List', 'Stack & Queue', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Binary Search', 'Recursion'],
  'Web Dev': ['HTML & CSS', 'JavaScript', 'React.js', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'Authentication', 'Deployment'],
};

export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', topics: '', color: COLORS[0] });

  useEffect(() => { api.get('/roadmap').then(r => setRoadmaps(r.data.roadmaps)); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const topics = form.topics.split('\n').map(t => t.trim()).filter(Boolean);
      const res = await api.post('/roadmap', { ...form, topics });
      setRoadmaps(r => [res.data.roadmap, ...r]);
      setShowForm(false);
      toast.success('Roadmap created!');
    } catch { toast.error('Failed'); }
  };

  const handleToggle = async (roadmapId, topicId) => {
    try {
      const res = await api.put(`/roadmap/${roadmapId}/topics/${topicId}/toggle`);
      setRoadmaps(rs => rs.map(r => r._id === roadmapId ? res.data.roadmap : r));
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this roadmap?')) return;
    await api.delete(`/roadmap/${id}`);
    setRoadmaps(rs => rs.filter(r => r._id !== id));
    toast.success('Deleted');
  };

  const applyTemplate = (name) => {
    setForm({ ...form, title: name, topics: TEMPLATES[name].join('\n') });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Learning Roadmap 🗺️</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track your learning journey</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">+ New Roadmap</button>
      </div>

      {roadmaps.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="text-5xl block mb-3">🗺️</span>
          <p className="text-slate-500 font-medium">No roadmaps yet</p>
          <p className="text-sm text-slate-400 mt-1">Create a roadmap to track your learning path</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mt-4">Create Roadmap</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {roadmaps.map(r => {
            const done = r.topics.filter(t => t.completed).length;
            const progress = r.topics.length > 0 ? Math.round(done / r.topics.length * 100) : 0;
            return (
              <div key={r._id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                      <h3 className="font-bold text-slate-800 dark:text-white">{r.title}</h3>
                    </div>
                    {r.description && <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>}
                  </div>
                  <button onClick={() => handleDelete(r._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 rounded-lg transition">🗑️</button>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{done}/{r.topics.length} topics</span>
                    <span className="font-semibold" style={{ color: r.color }}>{progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: r.color }} />
                  </div>
                </div>

                {/* Topics */}
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {r.topics.map(topic => (
                    <button key={topic._id} onClick={() => handleToggle(r._id, topic._id)}
                      className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all ${topic.completed ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${topic.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 dark:border-slate-500'}`}>
                        {topic.completed && <span className="text-xs">✓</span>}
                      </div>
                      <span className={`text-sm ${topic.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                        {topic.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">New Roadmap</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">✕</button>
            </div>

            {/* Templates */}
            <div className="mb-4">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Quick templates:</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(TEMPLATES).map(t => (
                  <button key={t} onClick={() => applyTemplate(t)} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-medium hover:bg-indigo-100 transition">
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                <input className="input" placeholder="e.g. Spring Boot Mastery" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <input className="input" placeholder="What's this roadmap about?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Topics (one per line) *</label>
                <textarea className="input resize-none font-mono text-sm" rows={8} placeholder={"Spring Core\nDependency Injection\nBeans\n..."} value={form.topics} onChange={e => setForm({ ...form, topics: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Color</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                      className={`w-8 h-8 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-offset-2 ring-indigo-400' : ''}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Create Roadmap</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
