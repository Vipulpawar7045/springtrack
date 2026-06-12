import React, { useEffect, useState } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function AnalyticsPage() {
  const { dark } = useTheme();
  const [weekly, setWeekly] = useState([]);
  const [stats, setStats] = useState(null);
  const [calDate, setCalDate] = useState(new Date());
  const [calData, setCalData] = useState({ tasks: [], sessions: [], notes: [] });
  const [selectedDay, setSelectedDay] = useState(null);

  const tc = dark ? '#94a3b8' : '#475569';
  const gc = dark ? '#1e293b' : '#f1f5f9';

  useEffect(() => {
    Promise.all([
      api.get('/analytics/weekly'),
      api.get('/analytics/dashboard'),
    ]).then(([w, s]) => { setWeekly(w.data.data); setStats(s.data.stats); });
  }, []);

  useEffect(() => {
    const y = calDate.getFullYear(), m = calDate.getMonth() + 1;
    api.get('/analytics/calendar', { params: { year: y, month: m } }).then(r => setCalData(r.data));
  }, [calDate]);

  const chartOpts = (title) => ({
    responsive: true,
    plugins: { legend: { labels: { color: tc } }, title: { display: !!title, text: title, color: tc } },
    scales: { x: { ticks: { color: tc }, grid: { color: gc } }, y: { ticks: { color: tc }, grid: { color: gc } } },
  });

  const hoursData = {
    labels: weekly.map(d => d.date),
    datasets: [{ label: 'Study Hours', data: weekly.map(d => d.studyHours), borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.15)', fill: true, tension: 0.4, pointBackgroundColor: '#6366f1' }],
  };

  const tasksData = {
    labels: weekly.map(d => d.date),
    datasets: [{ label: 'Tasks Completed', data: weekly.map(d => d.tasksCompleted), backgroundColor: weekly.map((_, i) => `rgba(99,102,241,${0.4 + i * 0.08})`), borderRadius: 8 }],
  };

  const getTileClass = ({ date }) => {
    const dateStr = date.toISOString().split('T')[0];
    const hasTask = calData.tasks?.some(t => (t.completedAt || t.createdAt)?.split('T')[0] === dateStr);
    const hasSession = calData.sessions?.some(s => s.date?.split('T')[0] === dateStr);
    if (hasTask && hasSession) return 'bg-indigo-500 text-white rounded-xl';
    if (hasTask) return 'bg-green-100 dark:bg-green-900/30 rounded-xl';
    if (hasSession) return 'bg-blue-100 dark:bg-blue-900/30 rounded-xl';
    return '';
  };

  const handleDayClick = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayTasks = calData.tasks?.filter(t => (t.completedAt || '').split('T')[0] === dateStr);
    const daySessions = calData.sessions?.filter(s => s.date?.split('T')[0] === dateStr);
    const dayNotes = calData.notes?.filter(n => (n.createdAt || '').split('T')[0] === dateStr);
    setSelectedDay({ date: dateStr, tasks: dayTasks, sessions: daySessions, notes: dayNotes });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Analytics 📊</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Visualize your learning progress</p>
      </div>

      {/* Stat summary */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Current Streak', value: `${stats.currentStreak}d`, icon: '🔥' },
            { label: 'Weekly Hours', value: `${stats.weeklyStudyHours}h`, icon: '⏱️' },
            { label: 'Tasks Today', value: stats.tasksCompletedToday, icon: '✅' },
            { label: 'Roadmap', value: `${stats.roadmapProgress}%`, icon: '🗺️' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="card p-4 text-center">
              <span className="text-2xl">{icon}</span>
              <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">📈 Daily Study Hours</h2>
          <Line data={hoursData} options={{ ...chartOpts(), plugins: { ...chartOpts().plugins, legend: { display: false } } }} />
        </div>
        <div className="card p-5">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">✅ Tasks Completed</h2>
          <Bar data={tasksData} options={{ ...chartOpts(), plugins: { ...chartOpts().plugins, legend: { display: false } } }} />
        </div>
      </div>

      {/* Calendar */}
      <div className="card p-5">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">📅 Study Calendar</h2>
        <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-indigo-500 rounded-full inline-block" /> Task + Session</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-200 rounded-full inline-block" /> Task Completed</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-200 rounded-full inline-block" /> Study Session</span>
        </div>
        <Calendar
          onChange={setCalDate}
          value={calDate}
          onActiveStartDateChange={({ activeStartDate }) => setCalDate(activeStartDate)}
          onClickDay={handleDayClick}
          tileClassName={getTileClass}
        />
        {selectedDay && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-slate-800 dark:text-white">{selectedDay.date}</h3>
              <button onClick={() => setSelectedDay(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            {selectedDay.tasks?.length > 0 && <p className="text-sm text-green-600">✅ {selectedDay.tasks.length} task(s) completed</p>}
            {selectedDay.sessions?.length > 0 && <p className="text-sm text-blue-600">⏱️ {selectedDay.sessions.reduce((s, x) => s + x.duration, 0)} minutes studied</p>}
            {selectedDay.notes?.length > 0 && <p className="text-sm text-purple-600">📝 {selectedDay.notes.length} note(s) created</p>}
            {!selectedDay.tasks?.length && !selectedDay.sessions?.length && !selectedDay.notes?.length && (
              <p className="text-sm text-slate-400">No activity recorded</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
