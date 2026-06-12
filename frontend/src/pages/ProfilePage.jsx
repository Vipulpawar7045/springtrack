import React, { useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', currentGoal: user?.currentGoal || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSavingPw(true);
    try {
      await api.put('/auth/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSavingPw(false); }
  };

  const downloadReport = async () => {
    setReportLoading(true);
    try {
      const token = localStorage.getItem('springtrack_token');
      const res = await fetch('/api/reports/generate', { headers: { Authorization: `Bearer ${token}` } });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `springtrack-report-${Date.now()}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast.success('Report downloaded!');
    } catch { toast.error('Failed to generate report'); }
    finally { setReportLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Profile 👤</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your account settings</p>
      </div>

      {/* Stats Summary */}
      <div className="card p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <p className="text-xs text-slate-400 mt-0.5">Member since {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Streak', value: `${user?.currentStreak || 0}d`, icon: '🔥' },
            { label: 'Study Hours', value: `${Math.round(user?.totalStudyHours || 0)}h`, icon: '📚' },
            { label: 'Active Days', value: user?.totalActiveDays || 0, icon: '📅' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
              <span className="text-xl">{icon}</span>
              <p className="font-bold text-slate-800 dark:text-white mt-0.5">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile */}
      <div className="card p-5">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Edit Profile</h2>
        <form onSubmit={handleProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Learning Goal</label>
            <input className="input" placeholder="e.g. Master Spring Boot" value={form.currentGoal} onChange={e => setForm({ ...form, currentGoal: e.target.value })} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card p-5">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Change Password</h2>
        <form onSubmit={handlePassword} className="space-y-4">
          {[
            { label: 'Current Password', key: 'currentPassword' },
            { label: 'New Password', key: 'newPassword' },
            { label: 'Confirm New Password', key: 'confirm' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
              <input type="password" className="input" value={pwForm[key]} onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })} required />
            </div>
          ))}
          <button type="submit" disabled={savingPw} className="btn-primary">{savingPw ? 'Changing...' : 'Change Password'}</button>
        </form>
      </div>

      {/* Export Report */}
      <div className="card p-5">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">Progress Report</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Download a PDF report of your learning journey including tasks, hours, achievements, and roadmap progress.</p>
        <button onClick={downloadReport} disabled={reportLoading} className="btn-primary flex items-center gap-2">
          {reportLoading ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
          ) : '📄 Download PDF Report'}
        </button>
      </div>
    </div>
  );
}
