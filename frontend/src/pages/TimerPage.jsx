import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const PRESETS = [
  { label: 'Pomodoro', minutes: 25, type: 'Focus', color: 'text-red-500' },
  { label: 'Short Break', minutes: 5, type: 'Break', color: 'text-green-500' },
  { label: 'Long Break', minutes: 15, type: 'Break', color: 'text-blue-500' },
];

export default function TimerPage() {
  const { updateUser } = useAuth();
  const [preset, setPreset] = useState(PRESETS[0]);
  const [customMin, setCustomMin] = useState(25);
  const [useCustom, setUseCustom] = useState(false);
  const [timeLeft, setTimeLeft] = useState(preset.minutes * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [sessionNote, setSessionNote] = useState('');
  const intervalRef = useRef(null);
  const startedAt = useRef(null);

  useEffect(() => {
    api.get('/sessions').then(res => setSessions(res.data.sessions));
  }, []);

  useEffect(() => {
    const mins = useCustom ? customMin : preset.minutes;
    setTimeLeft(mins * 60);
    setRunning(false);
    clearInterval(intervalRef.current);
  }, [preset, customMin, useCustom]);

  useEffect(() => {
    if (running) {
      startedAt.current = Date.now();
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            handleSessionComplete();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const handleSessionComplete = async () => {
    const mins = useCustom ? customMin : preset.minutes;
    try {
      const res = await api.post('/sessions', { duration: mins, type: preset.type, notes: sessionNote });
      setSessions(s => [res.data.session, ...s]);
      if (res.data.newAchievements?.length) {
        res.data.newAchievements.forEach(a => toast.success(`${a.icon} ${a.title}`));
      }
      toast.success(`🎉 Session complete! ${mins} minutes logged!`);
      // Play a sound notification
      try { new Audio('https://www.soundjay.com/buttons/sounds/button-09.mp3').play(); } catch {}
    } catch { toast.error('Failed to save session'); }
  };

  const handleStop = async () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    const elapsed = Math.round((Date.now() - startedAt.current) / 60000);
    if (elapsed >= 1) {
      try {
        const res = await api.post('/sessions', { duration: elapsed, type: preset.type, notes: sessionNote });
        setSessions(s => [res.data.session, ...s]);
        toast.success(`Saved ${elapsed} minute session`);
      } catch {}
    }
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const total = (useCustom ? customMin : preset.minutes) * 60;
  const progress = ((total - timeLeft) / total) * 100;
  const circumference = 2 * Math.PI * 90;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Pomodoro Timer ⏱️</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Stay focused, take breaks, build habits</p>
      </div>

      {/* Timer Card */}
      <div className="card p-8 text-center">
        {/* Preset buttons */}
        <div className="flex justify-center gap-2 mb-8">
          {PRESETS.map(p => (
            <button key={p.label} onClick={() => { setPreset(p); setUseCustom(false); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!useCustom && preset.label === p.label ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
              {p.label}
            </button>
          ))}
          <button onClick={() => setUseCustom(true)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${useCustom ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
            Custom
          </button>
        </div>

        {/* Custom input */}
        {useCustom && (
          <div className="mb-6 flex items-center justify-center gap-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Minutes:</label>
            <input type="number" min="1" max="120" value={customMin}
              onChange={e => setCustomMin(Number(e.target.value))}
              className="input w-24 text-center" />
          </div>
        )}

        {/* Circular progress */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative w-52 h-52">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="none" stroke="#e2e8f0" strokeWidth="8" className="dark:stroke-slate-700" />
              <circle cx="100" cy="100" r="90" fill="none" stroke="#6366f1" strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (progress / 100) * circumference}
                strokeLinecap="round" className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-slate-800 dark:text-white font-mono">{mm}:{ss}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">{preset.type}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          {!running ? (
            <button onClick={() => setRunning(true)} className="btn-primary px-10 py-3 text-lg">
              ▶ Start
            </button>
          ) : (
            <>
              <button onClick={() => setRunning(false)} className="btn-secondary px-6 py-3">⏸ Pause</button>
              <button onClick={handleStop} className="btn-danger px-6 py-3">⏹ Stop & Save</button>
            </>
          )}
        </div>

        {/* Session note */}
        <div className="mt-6">
          <input className="input text-center" placeholder="What are you working on? (optional)"
            value={sessionNote} onChange={e => setSessionNote(e.target.value)} />
        </div>
      </div>

      {/* Session History */}
      <div className="card p-5">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">Recent Sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">No sessions yet. Start your first timer!</p>
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 10).map(s => (
              <div key={s._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{s.type === 'Focus' ? '🎯' : '☕'}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{s.type} Session</p>
                    {s.notes && <p className="text-xs text-slate-400">{s.notes}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{s.duration} min</p>
                  <p className="text-xs text-slate-400">{new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
