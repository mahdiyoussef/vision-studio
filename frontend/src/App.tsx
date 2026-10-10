import { Toaster } from 'react-hot-toast';
import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Camera, Settings as SettingsIcon, FolderKanban, PlaySquare, BrainCircuit, Activity, BarChart3, Layers, Database } from 'lucide-react';
import ProjectsDashboard from './pages/ProjectsDashboard';
import ProjectDetails from './pages/ProjectDetails';
import Cameras from './pages/Cameras';
import LiveInspection from './pages/LiveInspection';
import MLOps from './pages/MLOps';
import TrainingStudio from './pages/TrainingStudio';
import Analytics from './pages/Analytics';
import FilterPipeline from './pages/FilterPipeline';
import Settings from './pages/Settings';
import DataStudio from './pages/DataStudio';

import { ProjectProvider, useProject } from './context/ProjectContext';

function Sidebar() {
  const location = useLocation();
  const { projects, activeProjectId, setActiveProjectId } = useProject();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname.startsWith('/project');
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/', label: 'Projects', icon: FolderKanban },
    { path: '/data', label: 'Data Studio', icon: Database },
    { path: '/inspection', label: 'Live Inspection', icon: PlaySquare },
    { path: '/filters', label: 'Filters & Pre-proc', icon: Layers },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/cameras', label: 'Cameras', icon: Camera },
    { path: '/mlops', label: 'MLOps', icon: BrainCircuit },
    { path: '/training', label: 'Training Studio', icon: Activity },
    { path: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-[#0d0e12]/85 backdrop-blur-2xl border-r border-white/[0.08] h-screen shrink-0 p-4 flex flex-col justify-between shadow-[4px_0_24px_rgba(0,0,0,0.5),inset_-1px_0_0_rgba(255,255,255,0.04)] relative z-20">
      <div>
        {/* Brand Header */}
        <div className="flex items-center space-x-3 px-2 py-3 mb-6 border-b border-white/[0.07] pb-5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff6b4a] to-[#ff2f3a] text-white flex items-center justify-center shadow-[0_0_16px_rgba(255,47,58,0.35),inset_0_1px_0_rgba(255,255,255,0.4)]">
            {/* Warm Diamond Glyph */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <polygon points="12,2 22,12 12,22 2,12" fill="#ffffff" />
              <polygon points="12,6.5 17.5,12 12,17.5 6.5,12" fill="#ff2f3a" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-base tracking-tight">VisionStudio</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#ff2f3a]/15 text-[#ffb347] px-1.5 py-0.5 rounded border border-[#ff6b4a]/30">Edge</span>
            </div>
            <p className="text-[11px] text-[#9c9c9d] font-medium">Metrology & Inspection</p>
          </div>
        </div>

        {/* Active Project Selector */}
        <div className="mb-4 px-2">
          <label className="text-[10px] font-semibold text-[#9c9c9d] uppercase tracking-wider mb-1.5 block">Active Project</label>
          <select 
            value={activeProjectId || ''} 
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="w-full bg-[#12141a]/90 border border-white/[0.09] text-white text-sm rounded-lg focus:ring-1 focus:ring-[#ff6b4a]/40 focus:border-[#ff6b4a]/60 block px-2.5 py-2 outline-none transition-colors hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            <option value="" disabled className="bg-[#12141a] text-[#9c9c9d]">Select a project...</option>
            {projects.map(p => (
              <option key={p.id} value={p.id} className="bg-[#12141a] text-white">{p.name}</option>
            ))}
          </select>
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? 'bg-gradient-to-r from-[#ff2f3a]/18 via-[#ff6b4a]/08 to-transparent text-white font-semibold border-l-2 border-[#ff4d40] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                    : 'text-[#9c9c9d] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon size={18} className={active ? 'text-[#ffb347]' : 'text-[#717174]'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Edge System Status Card */}
      <div className="pt-4 border-t border-white/[0.07]">
        <div className="bg-[#12141a]/80 backdrop-blur-md rounded-xl p-3 border border-white/[0.08] flex items-center justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff6b4a] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff4d40]"></span>
            </span>
            <div>
              <p className="text-xs font-semibold text-white">Edge System</p>
              <p className="text-[10px] text-[#9c9c9d]">Local compute ready</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-medium bg-white/[0.06] text-[#ffcca0] px-1.5 py-0.5 rounded border border-white/[0.08]">v1.0</span>
        </div>
      </div>
    </aside>
  );
}

function App() {
  return (
    <div className="flex bg-[#07080a] h-screen overflow-hidden text-white relative">
      {/* Living Animated Aurora Backdrop */}
      <div className="aurora-backdrop-layer" aria-hidden="true">
        {/* Subtle feTurbulence Film-Grain */}
        <svg className="app-film-grain" xmlns="http://www.w3.org/2000/svg">
          <filter id="app-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.04 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#app-grain)" />
        </svg>
        <div className="app-vignette"></div>
        <div className="aurora-blades-container">
          <div className="app-aurora-bloom"></div>
          <div className="app-light-blade-1"></div>
          <div className="app-light-blade-2"></div>
        </div>
      </div>

      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto h-full relative z-10">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<ProjectsDashboard />} />
            <Route path="/data" element={<DataStudio />} />
            <Route path="/project/:id" element={<ProjectDetails />} />
            <Route path="/inspection" element={<LiveInspection />} />
            <Route path="/filters" element={<FilterPipeline />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/cameras" element={<Cameras />} />
            <Route path="/mlops" element={<MLOps />} />
            <Route path="/training" element={<TrainingStudio />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#12141a',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.7)',
            fontSize: '13px',
          }
        }}
      />
      <ProjectProvider>
        <App />
      </ProjectProvider>
    </BrowserRouter>
  );
}
