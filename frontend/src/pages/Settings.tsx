import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Settings2, Cpu, HardDrive, Download, Upload, Server, Shield, Activity, RefreshCw, Database } from 'lucide-react';
import { api } from '../services/api';

export default function Settings() {
  const [kaggleUsername, setKaggleUsername] = useState('');
  const [kaggleKey, setKaggleKey] = useState('');
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);

  const fetchTelemetry = async () => {
    setLoadingTelemetry(true);
    try {
      const data = await api.system.telemetry();
      setTelemetry(data);
    } catch (err) {
      toast.error('Failed to fetch telemetry');
    } finally {
      setLoadingTelemetry(false);
    }
  };

  useEffect(() => {
    setKaggleUsername(localStorage.getItem('kaggleUsername') || '');
    setKaggleKey(localStorage.getItem('kaggleKey') || '');
    fetchTelemetry();
  }, []);

  const handleSaveKaggle = () => {
    localStorage.setItem('kaggleUsername', kaggleUsername);
    localStorage.setItem('kaggleKey', kaggleKey);
    alert('Kaggle credentials saved!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex justify-between items-center bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">System Settings &amp; Hardware</h2>
          <p className="text-sm text-[#9c9c9d] mt-1">Monitor local compute telemetry and configure external Kaggle integrations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Resource Monitor */}
        <div className="col-span-2 space-y-6">
          <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-7 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/[0.08]">
             <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center">
                 <Activity size={17} className="mr-2 text-[#ff6b4a]" /> 
                 Hardware Telemetry
               </h3>
               <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md font-mono font-semibold border border-emerald-500/25">System Healthy</span>
             </div>
             
             <div className="grid grid-cols-3 gap-5">
               <div className="space-y-2 p-3.5 bg-[#12141a]/90 rounded-xl border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                 <div className="flex justify-between text-xs">
                   <span className="text-[#9c9c9d] font-medium flex items-center"><Cpu size={14} className="mr-1 text-[#ff6b4a]" /> CPU Load</span>
                   <span className="font-bold text-white font-mono">{telemetry ? telemetry.cpu.load_percent : '...'}%</span>
                 </div>
                 <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                   <div className="bg-[#ff4d40] h-full rounded-full transition-all" style={{ width: `${telemetry ? telemetry.cpu.load_percent : 0}%` }}></div>
                 </div>
                 <p className="text-[10px] text-[#717174] font-medium truncate font-mono" title={telemetry?.cpu.model || 'Loading'}>{telemetry ? telemetry.cpu.model : 'Loading...'}</p>
               </div>
               
               <div className="space-y-2 p-3.5 bg-[#12141a]/90 rounded-xl border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                 <div className="flex justify-between text-xs">
                   <span className="text-[#9c9c9d] font-medium flex items-center"><Server size={14} className="mr-1 text-[#ffb347]" /> GPU VRAM</span>
                   <span className="font-bold text-[#ffcca0] font-mono">{telemetry ? `${telemetry.vram.used_gb} / ${telemetry.vram.total_gb} GB` : '...'}</span>
                 </div>
                 <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                   <div className="bg-[#ffb347] h-full rounded-full transition-all" style={{ width: `${telemetry ? telemetry.vram.percent : 0}%` }}></div>
                 </div>
                 <p className="text-[10px] text-[#717174] font-medium truncate font-mono" title={telemetry?.vram.model || 'Loading'}>{telemetry ? telemetry.vram.model : 'Loading...'}</p>
               </div>
               
               <div className="space-y-2 p-3.5 bg-[#12141a]/90 rounded-xl border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                 <div className="flex justify-between text-xs">
                   <span className="text-[#9c9c9d] font-medium flex items-center"><HardDrive size={14} className="mr-1 text-emerald-400" /> Disk Storage</span>
                   <span className="font-bold text-white font-mono">{telemetry ? `${telemetry.disk.free_gb} GB Free` : '...'}</span>
                 </div>
                 <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                   <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${telemetry ? telemetry.disk.percent : 0}%` }}></div>
                 </div>
                 <p className="text-[10px] text-[#717174] font-medium">NVMe SSD (Images/Logs)</p>
               </div>
             </div>
             
             <div className="mt-6 pt-5 border-t border-white/[0.08] flex justify-end space-x-3">
               <button onClick={fetchTelemetry} disabled={loadingTelemetry} className="keycap-btn-dark text-xs py-1.5 px-3">
                 <RefreshCw size={13} className={`mr-1.5 ${loadingTelemetry ? 'animate-spin' : ''}`} /> Refresh
               </button>
               <button className="keycap-btn-warm text-xs py-1.5 px-3">
                 Restart Services
               </button>
             </div>
          </div>

          <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-7 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/[0.08]">
             <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4 flex items-center">
               <Settings2 size={17} className="mr-2 text-[#ffb347]" /> 
               Application Settings
             </h3>
             <div className="space-y-4 max-w-md">
               <div>
                 <label className="block text-xs font-semibold text-[#9c9c9d] mb-1.5 uppercase tracking-wider">Log Level</label>
                 <select className="w-full px-3.5 py-2.5 bg-[#12141a] border border-white/[0.1] rounded-xl text-xs text-white focus:border-[#ff6b4a]/60 outline-none">
                   <option className="bg-[#12141a]">INFO</option>
                   <option className="bg-[#12141a]">DEBUG</option>
                   <option className="bg-[#12141a]">WARNING</option>
                   <option className="bg-[#12141a]">ERROR</option>
                 </select>
               </div>
               <div>
                 <label className="block text-xs font-semibold text-[#9c9c9d] mb-1.5 uppercase tracking-wider">Data Retention (Days)</label>
                 <input type="number" defaultValue="30" className="w-full px-3.5 py-2.5 bg-[#12141a] border border-white/[0.1] rounded-xl text-xs text-white focus:border-[#ff6b4a]/60 outline-none font-mono" />
                 <p className="text-[11px] text-[#717174] mt-1">Inspection snapshots older than this will be pruned automatically.</p>
               </div>
             </div>
          </div>

          <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-7 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/[0.08]">
             <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4 flex items-center">
               <Database size={17} className="mr-2 text-[#ff6b4a]" /> 
               Kaggle Integration
             </h3>
             <div className="space-y-4 max-w-md">
               <div>
                 <label className="block text-xs font-semibold text-[#9c9c9d] mb-1.5 uppercase tracking-wider">Kaggle Username</label>
                 <input type="text" value={kaggleUsername} onChange={e => setKaggleUsername(e.target.value)} placeholder="e.g. johndoe" className="w-full px-3.5 py-2.5 bg-[#12141a] border border-white/[0.1] rounded-xl text-xs text-white placeholder:text-[#5a5a5c] focus:border-[#ff6b4a]/60 outline-none font-mono" />
               </div>
               <div>
                 <label className="block text-xs font-semibold text-[#9c9c9d] mb-1.5 uppercase tracking-wider">Kaggle API Key</label>
                 <input type="password" value={kaggleKey} onChange={e => setKaggleKey(e.target.value)} placeholder="••••••••••••" className="w-full px-3.5 py-2.5 bg-[#12141a] border border-white/[0.1] rounded-xl text-xs text-white placeholder:text-[#5a5a5c] focus:border-[#ff6b4a]/60 outline-none font-mono" />
                 <p className="text-[11px] text-[#717174] mt-1">Obtained from Kaggle Account Settings under 'Create New API Token'.</p>
               </div>
               <button onClick={handleSaveKaggle} className="keycap-btn-primary">
                 Save Kaggle Credentials
               </button>
             </div>
          </div>
        </div>

        {/* Right Column: Config Import/Export */}
        <div className="col-span-1 space-y-6">
           <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-7 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/[0.08]">
             <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-2 flex items-center">
               <Shield size={17} className="mr-2 text-[#ffb347]" /> 
               Configuration Backup
             </h3>
             <p className="text-xs text-[#9c9c9d] mb-6 leading-relaxed">Import or export the complete VisionStudio YAML pipeline state and measurement thresholds.</p>
             
             <div className="space-y-3">
               <button className="w-full keycap-btn-dark py-2.5 flex justify-center items-center">
                 <Download size={15} className="mr-2" /> Export config.yaml
               </button>
               <div className="relative py-2">
                 <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.08]"></div></div>
                 <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-[#0d0e12] px-2 text-[#717174] font-mono">OR</span></div>
               </div>
               <button className="w-full keycap-btn-primary py-2.5 flex justify-center items-center">
                 <Upload size={15} className="mr-2" /> Upload config.yaml
               </button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
