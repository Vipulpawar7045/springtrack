// AchievementsPage.jsx
import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const ALL_ACHIEVEMENTS = [
  { key: 'first_task', icon: '🏆', title: 'First Task Completed', description: 'Complete your very first task' },
  { key: 'tasks_10', icon: '✅', title: '10 Tasks Completed', description: 'Complete 10 tasks' },
  { key: 'tasks_50', icon: '🎯', title: '50 Tasks Completed', description: 'Complete 50 tasks' },
  { key: 'tasks_100', icon: '💯', title: '100 Tasks Completed', description: 'Complete 100 tasks' },
  { key: 'streak_3', icon: '🌱', title: '3-Day Streak', description: 'Maintain a 3-day streak' },
  { key: 'streak_7', icon: '🔥', title: '7-Day Streak', description: 'Maintain a 7-day streak' },
  { key: 'streak_30', icon: '⚡', title: '30-Day Streak', description: 'Maintain a 30-day streak' },
  { key: 'hours_10', icon: '⏱️', title: '10 Study Hours', description: 'Log 10 study hours' },
  { key: 'hours_50', icon: '🕐', title: '50 Study Hours', description: 'Log 50 study hours' },
  { key: 'hours_100', icon: '📚', title: '100 Study Hours', description: 'Log 100 study hours' },
  { key: 'first_proof', icon: '📸', title: 'First Proof Uploaded', description: 'Upload your first proof' },
];

export default function AchievementsPage() {
  const [earned, setEarned] = useState([]);

  useEffect(() => { api.get('/achievements').then(r => setEarned(r.data.achievements)); }, []);

  const earnedKeys = new Set(earned.map(a => a.key));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Achievements 🏆</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{earned.length}/{ALL_ACHIEVEMENTS.length} unlocked</p>
      </div>

      {/* Progress */}
      <div className="card p-4">
        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300 mb-2">
          <span>Overall Progress</span>
          <span className="font-semibold">{Math.round(earned.length / ALL_ACHIEVEMENTS.length * 100)}%</span>
        </div>
        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.round(earned.length / ALL_ACHIEVEMENTS.length * 100)}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_ACHIEVEMENTS.map(a => {
          const unlocked = earnedKeys.has(a.key);
          const earnedData = earned.find(e => e.key === a.key);
          return (
            <div key={a.key} className={`card p-5 transition-all ${unlocked ? 'border-l-4 border-indigo-400' : 'opacity-50 grayscale'}`}>
              <div className="flex items-start gap-3">
                <span className="text-3xl">{a.icon}</span>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white">{a.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{a.description}</p>
                  {unlocked && earnedData && (
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                      Unlocked {new Date(earnedData.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                  {!unlocked && <p className="text-xs text-slate-400 mt-1">🔒 Locked</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
