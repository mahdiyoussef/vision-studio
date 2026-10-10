import React, { useState, useEffect } from 'react';
import { Database, UploadCloud, Sliders, CloudCog, ShieldAlert, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useProject } from '../context/ProjectContext';

export default function MLOps() {
  const { activeProjectId } = useProject();
  const [dragActive, setDragActive] = useState(false);
  const [activeLearningEnabled, setActiveLearningEnabled] = useState(true);
  const [models, setModels] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    confidenceThreshold: 0.75,
    nmsIouThreshold: 0.45,
    uncertaintyThreshold: 0.60
  });

  useEffect(() => {
    const loadData = async () => {
      const pid = activeProjectId || 'default_project';
      try {
        const [modelsData, settingsData] = await Promise.all([
          api.mlops.getModels(pid),
          api.mlops.getSettings(pid)
        ]);
        setModels(modelsData);
        setSettings(settingsData);
        setActiveLearningEnabled(settingsData.activeLearningEnabled);
      } catch (error) {
        console.error("Failed to load MLOps data:", error);
      }
    };
    loadData();
  }, [activeProjectId]);

  const handleSettingChange = async (key: string, value: any) => {
    const pid = activeProjectId || 'default_project';
    try {
      const newSettings = { ...settings, activeLearningEnabled, [key]: value };
      if (key === 'activeLearningEnabled') {
          newSettings.activeLearningEnabled = value;
      } else {
          setSettings(newSettings);
      }
      
      await api.mlops.updateSettings(pid, { [key]: value });
    } catch (error) {
      console.error("Failed to update setting:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex justify-between items-center bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Machine Learning &amp; MLOps</h2>
          <p className="text-sm text-[#9c9c9d] mt-1">Manage local model artifacts, inference thresholds, and active learning queues</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Model Registry & Upload */}
        <div className="col-span-2 space-y-6">
          <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-7 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/[0.08]">
             <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center">
                 <Database size={17} className="mr-2 text-[#ff6b4a]" /> 
                 Model Registry
               </h3>
               <div className="flex items-center space-x-3">
                 <Link to="/training" className="keycap-btn-primary text-xs py-1.5 px-3">
                   <Plus size={14} className="mr-1" /> Train New Model
                 </Link>
               </div>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-white/[0.08] text-xs font-semibold text-[#9c9c9d] uppercase tracking-wider">
                     <th className="pb-3">Model Name</th>
                     <th className="pb-3">Architecture</th>
                     <th className="pb-3">Size</th>
                     <th className="pb-3">Status</th>
                     <th className="pb-3 text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="text-xs divide-y divide-white/[0.06]">
                   {models.map((model: any) => (
                     <tr key={model.id} className={`hover:bg-white/[0.02] transition-colors ${model.status === 'Active' ? 'bg-[#ff2f3a]/[0.06]' : ''}`}>
                       <td className="py-4 font-mono font-semibold text-white">{model.name}</td>
                       <td className="py-4 text-[#9c9c9d]">{model.architecture}</td>
                       <td className="py-4 font-mono text-[#ffcca0]">{model.size}</td>
                       <td className="py-4">
                         <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                           model.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 
                           model.status === 'Standby' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 
                           'bg-white/[0.06] text-[#9c9c9d] border-white/10'
                         }`}>
                           {model.status}
                         </span>
                       </td>
                       <td className="py-4 text-right">
                         <button 
                           className="text-[#ffb347] hover:text-white transition font-semibold text-xs px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08]" 
                           onClick={() => api.mlops.deploy(model.id, activeProjectId || 'default_project')}
                         >
                           Deploy
                         </button>
                       </td>
                     </tr>
                   ))}
                   {models.length === 0 && (
                     <tr><td colSpan={5} className="py-4 text-center text-[#9c9c9d] text-sm">No models found</td></tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>

          <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-7 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/[0.08]">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4 flex items-center">
              <UploadCloud size={17} className="mr-2 text-[#ffb347]" /> 
              Weights Uploader
            </h3>
            <div 
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${
                dragActive ? 'border-[#ff4d40] bg-[#ff2f3a]/10' : 'border-white/15 bg-[#12141a]/40 hover:bg-[#12141a]/70 hover:border-white/25'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
            >
              <div className="w-12 h-12 rounded-xl bg-white/[0.05] text-[#ff6b4a] flex items-center justify-center mb-3 border border-white/[0.08] shadow-[0_0_16px_rgba(255,107,74,0.15)]">
                <UploadCloud size={24} />
              </div>
              <p className="text-sm font-semibold text-white">Drag and drop model weights here</p>
              <p className="text-xs text-[#9c9c9d] mt-1 mb-4">Supports .pt and .onnx weights files up to 500MB</p>
              <button className="keycap-btn-dark text-xs py-1.5 px-3">
                Browse Files
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Active Learning & Parameters */}
        <div className="col-span-1 space-y-6">
           <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/[0.08]">
             <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-5 flex items-center">
               <Sliders size={17} className="mr-2 text-[#ff6b4a]" /> 
               Inference Thresholds
             </h3>
             <div className="space-y-5">
               <div>
                 <div className="flex justify-between text-xs font-medium mb-1.5">
                   <label className="text-[#9c9c9d]">Confidence Threshold</label>
                   <span className="text-[#ffcca0] font-mono font-bold">{settings.confidenceThreshold}</span>
                 </div>
                 <input type="range" min="0" max="1" step="0.01" value={settings.confidenceThreshold} onChange={(e) => handleSettingChange('confidenceThreshold', parseFloat(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ff4d40]" />
                 <p className="text-[11px] text-[#717174] mt-1.5">Predictions below this score are filtered out.</p>
               </div>
               
               <div>
                 <div className="flex justify-between text-xs font-medium mb-1.5">
                   <label className="text-[#9c9c9d]">NMS IoU Threshold</label>
                   <span className="text-[#ffcca0] font-mono font-bold">{settings.nmsIouThreshold}</span>
                 </div>
                 <input type="range" min="0" max="1" step="0.01" value={settings.nmsIouThreshold} onChange={(e) => handleSettingChange('nmsIouThreshold', parseFloat(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ff4d40]" />
               </div>
             </div>
           </div>

           <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/[0.08]">
             <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4 flex items-center">
               <CloudCog size={17} className="mr-2 text-[#ffb347]" /> 
               Local Active Learning
             </h3>
             
             <div className="flex items-center justify-between mb-5 pb-5 border-b border-white/[0.08]">
               <div>
                 <div className="font-semibold text-white text-xs">Active Learning Queue</div>
                 <div className="text-[11px] text-[#9c9c9d] mt-0.5">Buffer low-confidence frames locally</div>
               </div>
               <button 
                 onClick={() => {
                   setActiveLearningEnabled(!activeLearningEnabled);
                   handleSettingChange('activeLearningEnabled', !activeLearningEnabled);
                 }}
                 aria-label="Toggle active learning"
                 className={`w-11 h-6 rounded-full transition-colors relative ${
                   activeLearningEnabled ? 'bg-gradient-to-r from-[#ff6b4a] to-[#ff2f3a]' : 'bg-white/20'
                 }`}
               >
                 <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${
                   activeLearningEnabled ? 'transform translate-x-5' : ''
                 }`} />
               </button>
             </div>

             <div className={`space-y-4 transition ${activeLearningEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
               <div>
                 <label className="block text-[11px] font-semibold text-[#9c9c9d] mb-1.5">Uncertainty Threshold</label>
                 <input type="number" step="0.01" min="0" max="1" value={settings.uncertaintyThreshold} onChange={(e) => handleSettingChange('uncertaintyThreshold', parseFloat(e.target.value))} className="w-full px-3 py-1.5 bg-[#12141a] border border-white/[0.1] rounded-xl text-white focus:border-[#ff6b4a]/60 outline-none text-xs font-mono" />
                 <p className="text-[10px] text-[#717174] mt-1">Frames with confidence below this threshold are queued.</p>
               </div>
               
               <div className="bg-[#ff2f3a]/10 border border-[#ff2f3a]/25 p-3 rounded-xl flex items-start space-x-2.5">
                 <ShieldAlert size={16} className="text-[#ff6b4a] mt-0.5 shrink-0" />
                 <p className="text-[11px] text-[#ffcca0] leading-relaxed">
                   <strong>145 frames</strong> buffered locally in <code className="bg-white/10 px-1 py-0.5 rounded font-mono">data/active_learning_queue/</code> ready for re-labeling.
                 </p>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
