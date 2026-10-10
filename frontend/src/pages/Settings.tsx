import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
//, { useState, useEffect } from 'react';
import { Settings2, Cpu, HardDrive, Download, Upload, Server, Shield, Activity, RefreshCw, Database } from 'lucide-react';

export default function Settings() {
  const [kaggleUsername, setKaggleUsername] = useState('');
  const [kaggleKey, setKaggleKey] = useState('');

  useEffect(() => {
    setKaggleUsername(localStorage.getItem('kaggleUsername') || '');
    setKaggleKey(localStorage.getItem('kaggleKey') || '');
  }, []);

  const handleSaveKaggle = () => {
    localStorage.setItem('kaggleUsername', kaggleUsername);
    localStorage.setItem('kaggleKey', kaggleKey);
    alert('Kaggle credentials saved!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings & Hardware</h2>
          <p className="text-sm text-slate-500 mt-1">Monitor local compute telemetry and configure external Kaggle integrations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Resource Monitor */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white p-7 rounded-2xl shadow-xs border border-slate-200/80">
             <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center">
                 <Activity size={17} className="mr-2 text-blue-600" /> 
                 Hardware Telemetry
               </h3>
               <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-semibold border border-emerald-100">System Healthy</span>
             </div>
             
             <div className="grid grid-cols-3 gap-5">
               <div className="space-y-2 p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                 <div className="flex justify-between text-xs">
                   <span className="text-slate-600 font-medium flex items-center"><Cpu size={14} className="mr-1 text-slate-400" /> CPU Load</span>
                   <span className="font-bold text-slate-900 font-mono">42%</span>
                 </div>
                 <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                   <div className="bg-blue-600 h-full rounded-full" style={{ width: '42%' }}></div>
                 </div>
                 <p className="text-[10px] text-slate-400 font-medium">Intel Core i7-12700TE</p>
               </div>
               
               <div className="space-y-2 p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                 <div className="flex justify-between text-xs">
                   <span className="text-slate-600 font-medium flex items-center"><Server size={14} className="mr-1 text-slate-400" /> GPU VRAM</span>
                   <span className="font-bold text-slate-900 font-mono">8.2 / 16 GB</span>
                 </div>
                 <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                   <div className="bg-indigo-500 h-full rounded-full" style={{ width: '51%' }}></div>
                 </div>
                 <p className="text-[10px] text-slate-400 font-medium">NVIDIA RTX A4000</p>
               </div>
               
               <div className="space-y-2 p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                 <div className="flex justify-between text-xs">
                   <span className="text-slate-600 font-medium flex items-center"><HardDrive size={14} className="mr-1 text-slate-400" /> Disk Storage</span>
                   <span className="font-bold text-slate-900 font-mono">210 GB Free</span>
                 </div>
                 <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                   <div className="bg-emerald-500 h-full rounded-full" style={{ width: '30%' }}></div>
                 </div>
                 <p className="text-[10px] text-slate-400 font-medium">NVMe SSD (Images/Logs)</p>
               </div>
             </div>
             
             <div className="mt-6 pt-5 border-t border-slate-100 flex justify-end space-x-3">
               <button className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition flex items-center shadow-xs">
                 <RefreshCw size={13} className="mr-1.5" /> Refresh
               </button>
               <button className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200 transition">
                 Restart Services
               </button>
             </div>
          </div>

          <div className="bg-white p-7 rounded-2xl shadow-xs border border-slate-200/80">
             <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-4 flex items-center">
               <Settings2 size={17} className="mr-2 text-indigo-600" /> 
               Application Settings
             </h3>
             <div className="space-y-4 max-w-md">
               <div>
                 <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Log Level</label>
                 <select className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                   <option>INFO</option>
                   <option>DEBUG</option>
                   <option>WARNING</option>
                   <option>ERROR</option>
                 </select>
               </div>
               <div>
                 <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Data Retention (Days)</label>
                 <input type="number" defaultValue="30" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium" />
                 <p className="text-[11px] text-slate-400 mt-1">Inspection snapshots older than this will be pruned automatically.</p>
               </div>
             </div>
          </div>

          <div className="bg-white p-7 rounded-2xl shadow-xs border border-slate-200/80">
             <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-4 flex items-center">
               <Database size={17} className="mr-2 text-blue-600" /> 
               Kaggle Integration
             </h3>
             <div className="space-y-4 max-w-md">
               <div>
                 <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Kaggle Username</label>
                 <input type="text" value={kaggleUsername} onChange={e => setKaggleUsername(e.target.value)} placeholder="e.g. johndoe" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
               </div>
               <div>
                 <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Kaggle API Key</label>
                 <input type="password" value={kaggleKey} onChange={e => setKaggleKey(e.target.value)} placeholder="••••••••••••" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                 <p className="text-[11px] text-slate-400 mt-1">Obtained from Kaggle Account Settings under 'Create New API Token'.</p>
               </div>
               <button onClick={handleSaveKaggle} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-xs">
                 Save Kaggle Credentials
               </button>
             </div>
          </div>
        </div>

        {/* Right Column: Config Import/Export */}
        <div className="col-span-1 space-y-6">
           <div className="bg-white p-7 rounded-2xl shadow-xs border border-slate-200/80">
             <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-2 flex items-center">
               <Shield size={17} className="mr-2 text-slate-600" /> 
               Configuration Backup
             </h3>
             <p className="text-xs text-slate-500 mb-6 leading-relaxed">Import or export the complete VisionStudio YAML pipeline state and measurement thresholds.</p>
             
             <div className="space-y-3">
               <button className="w-full py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition flex justify-center items-center shadow-xs">
                 <Download size={15} className="mr-2" /> Export config.yaml
               </button>
               <div className="relative py-2">
                 <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                 <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-white px-2 text-slate-400">OR</span></div>
               </div>
               <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition flex justify-center items-center shadow-xs">
                 <Upload size={15} className="mr-2" /> Upload config.yaml
               </button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
