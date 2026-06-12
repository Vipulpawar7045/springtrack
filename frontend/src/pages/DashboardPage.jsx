import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="card p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
        <p className={`text-3xl font-bold mt-1 ${color || 'text-slate-800 dark:text-white'}`}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const { dark } = useTheme();
  const [stats, setStats] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/dashboard'),
      api.get('/analytics/weekly'),
    ]).then(([s, w]) => {
      setStats(s.data.stats);
      setWeekly(w.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const chartData = {
    labels: weekly.map(d => d.date),
    datasets: [
      {
        label: 'Study Hours',
        data: weekly.map(d => d.studyHours),
        backgroundColor: 'rgba(99,102,241,0.7)',
        borderRadius: 8,
      },
      {
        label: 'Tasks Done',
        data: weekly.map(d => d.tasksCompleted),
        backgroundColor: 'rgba(168,85,247,0.6)',
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: dark ? '#94a3b8' : '#475569' } } },
    scales: {
      x: { ticks: { color: dark ? '#94a3b8' : '#475569' }, grid: { color: dark ? '#1e293b' : '#f1f5f9' } },
      y: { ticks: { color: dark ? '#94a3b8' : '#475569' }, grid: { color: dark ? '#1e293b' : '#f1f5f9' } },
    },
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Good {getGreeting()}, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{user?.currentGoal ? `Working on: ${user.currentGoal}` : 'Set a learning goal to get started'}</p>
        </div>
        <Link to="/tasks" className="btn-primary hidden sm:block">+ Add Task</Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="✅" label="Tasks Today" value={stats?.tasksCompletedToday ?? 0} sub="completed" color="text-green-600" />
        <StatCard icon="⏳" label="Pending Tasks" value={stats?.pendingTasks ?? 0} sub="to do" color="text-amber-500" />
        <StatCard icon="🔥" label="Current Streak" value={`${stats?.currentStreak ?? 0}d`} sub={`Best: ${stats?.longestStreak ?? 0}d`} color="text-orange-500" />
        <StatCard icon="⏱️" label="Study Today" value={`${stats?.studyHoursToday ?? 0}h`} sub={`${stats?.weeklyStudyHours ?? 0}h this week`} color="text-indigo-600" />
        <StatCard icon="🗺️" label="Roadmap" value={`${stats?.roadmapProgress ?? 0}%`} sub="completed" color="text-purple-600" />
        <StatCard icon="📸" label="Proofs Uploaded" value={stats?.totalUploadedProofs ?? 0} sub="evidence files" color="text-blue-600" />
        <StatCard icon="📚" label="Weekly Hours" value={`${stats?.weeklyStudyHours ?? 0}h`} sub="last 7 days" />
        <StatCard icon="🏆" label="Longest Streak" value={`${stats?.longestStreak ?? 0}d`} sub="personal best" color="text-yellow-500" />
      </div>

      {/* Chart */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">📈 Weekly Progress</h2>
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/tasks', icon: '✅', label: 'Manage Tasks', color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' },
          { to: '/timer', icon: '⏱️', label: 'Start Timer', color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' },
          { to: '/notes', icon: '📝', label: 'Write Notes', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' },
          { to: '/proofs', icon: '📸', label: 'Upload Proof', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' },
        ].map(({ to, icon, label, color }) => (
          <Link key={to} to={to} className={`${color} rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform`}>
            <span className="text-2xl">{icon}</span>
            <span className="text-sm font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
