import { Toaster } from 'react-hot-toast';
import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Camera, Settings as SettingsIcon, FolderKanban, PlaySquare, BrainCircuit, Activity, BarChart3, Layers, Database, ScanEye } from 'lucide-react';
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
    <aside className="w-64 bg-white border-r border-slate-200 h-screen shrink-0 p-4 flex flex-col justify-between shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
      <div>
        <div className="flex items-center space-x-3 px-2 py-3 mb-6 border-b border-slate-100 pb-5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20">
            <ScanEye size={20} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 text-base tracking-tight">VisionStudio</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200/60">Edge</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Metrology & Inspection</p>
          </div>
        </div>

        <div className="mb-4 px-2">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Active Project</label>
          <select 
            value={activeProjectId || ''} 
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-2 outline-none transition-colors hover:border-slate-300"
          >
            <option value="" disabled>Select a project...</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <nav className="space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-100/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon size={18} className={active ? 'text-blue-600' : 'text-slate-400'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-800">Edge System</p>
              <p className="text-[10px] text-slate-500">Local compute ready</p>
            </div>
          </div>
          <span className="text-[10px] font-medium bg-emerald-100/70 text-emerald-800 px-1.5 py-0.5 rounded">v1.0</span>
        </div>
      </div>
    </aside>
  );
}

function App() {
  return (
    <div className="flex bg-slate-50/70 h-screen overflow-hidden text-slate-800">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto h-full">
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
      <Toaster position="top-right" />
      <ProjectProvider>
        <App />
      </ProjectProvider>
    </BrowserRouter>
  );
}
