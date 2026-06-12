import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/tasks', icon: '✅', label: 'Tasks' },
  { to: '/timer', icon: '⏱️', label: 'Pomodoro Timer' },
  { to: '/notes', icon: '📝', label: 'Notes' },
  { to: '/roadmap', icon: '🗺️', label: 'Roadmap' },
  { to: '/goals', icon: '🎯', label: 'Goals' },
  { to: '/proofs', icon: '📸', label: 'My Proofs' },
  { to: '/analytics', icon: '📊', label: 'Analytics' },
  { to: '/achievements', icon: '🏆', label: 'Achievements' },
  { to: '/profile', icon: '👤', label: 'Profile' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out!');
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">SpringTrack</span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">Learning & Productivity</p>
      </div>

      {/* User mini card */}
      <div className="px-4 py-3 mx-3 mt-3 rounded-xl bg-indigo-50 dark:bg-slate-700">
        <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">{user?.name}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.currentGoal || 'Set a goal!'}</p>
        <div className="flex gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
          <span>🔥 {user?.currentStreak}d streak</span>
          <span>📚 {Math.round(user?.totalStudyHours || 0)}h</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="text-lg">{icon}</span>
            <span className="text-sm">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-700 space-y-1">
        <button onClick={toggle} className="sidebar-link w-full">
          <span>{dark ? '☀️' : '🌙'}</span>
          <span className="text-sm">{dark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
          <span>🚪</span>
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-white dark:bg-slate-800 h-full shadow-2xl flex flex-col">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-4 lg:px-6 py-3 flex items-center justify-between shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700">
            <span className="text-xl">☰</span>
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
