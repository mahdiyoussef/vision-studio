import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Database, UploadCloud, Sliders, BrainCircuit, CloudCog, ShieldAlert, Plus } from 'lucide-react';
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
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Machine Learning & MLOps</h2>
          <p className="text-sm text-slate-500 mt-1">Manage local model artifacts, inference thresholds, and active learning queues</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Model Registry & Upload */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white p-7 rounded-2xl shadow-xs border border-slate-200/80">
             <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center">
                 <Database size={17} className="mr-2 text-blue-600" /> 
                 Model Registry
               </h3>
               <div className="flex items-center space-x-3">
                 <Link to="/training" className="text-xs bg-blue-50 text-blue-600 border border-blue-200 font-semibold px-3 py-1.5 rounded-xl hover:bg-blue-100 transition flex items-center shadow-xs">
                   <Plus size={15} className="mr-1" /> Train New Model
                 </Link>
               </div>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                     <th className="pb-3">Model Name</th>
                     <th className="pb-3">Architecture</th>
                     <th className="pb-3">Size</th>
                     <th className="pb-3">Status</th>
                     <th className="pb-3 text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="text-xs divide-y divide-slate-100">
                   {models.map((model: any) => (
                     <tr key={model.id} className="hover:bg-slate-50/60 transition-colors">
                       <td className="py-4 font-semibold text-slate-900">{model.name}</td>
                       <td className="py-4 text-slate-600">{model.architecture}</td>
                       <td className="py-4 font-mono text-slate-500">{model.size}</td>
                       <td className="py-4">
                         <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                           model.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 
                           model.status === 'Standby' ? 'bg-amber-50 text-amber-700 border-amber-200/60' : 
                           'bg-slate-100 text-slate-600 border-slate-200'
                         }`}>
                           {model.status}
                         </span>
                       </td>
                       <td className="py-4 text-right">
                         <button className="text-blue-600 hover:text-blue-700 transition font-semibold text-xs hover:underline" onClick={() => api.mlops.deploy(model.id)}>Deploy</button>
                       </td>
                     </tr>
                   ))}
                   {models.length === 0 && (
                     <tr><td colSpan={5} className="py-4 text-center text-slate-500 text-sm">No models found</td></tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>

          <div className="bg-white p-7 rounded-2xl shadow-xs border border-slate-200/80">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-4 flex items-center">
              <UploadCloud size={17} className="mr-2 text-indigo-600" /> 
              Weights Uploader
            </h3>
            <div 
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${
                dragActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
                <UploadCloud size={24} />
              </div>
              <p className="text-sm font-semibold text-slate-800">Drag and drop model weights here</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">Supports .pt and .onnx weights files up to 500MB</p>
              <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition">
                Browse Files
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Active Learning & Parameters */}
        <div className="col-span-1 space-y-6">
           <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
             <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-5 flex items-center">
               <Sliders size={17} className="mr-2 text-indigo-600" /> 
               Inference Thresholds
             </h3>
             <div className="space-y-5">
               <div>
                 <div className="flex justify-between text-xs font-medium mb-1.5">
                   <label className="text-slate-700">Confidence Threshold</label>
                   <span className="text-slate-600 font-mono font-bold">{settings.confidenceThreshold}</span>
                 </div>
                 <input type="range" min="0" max="1" step="0.01" value={settings.confidenceThreshold} onChange={(e) => handleSettingChange('confidenceThreshold', parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                 <p className="text-[11px] text-slate-400 mt-1.5">Predictions below this score are filtered out.</p>
               </div>
               
               <div>
                 <div className="flex justify-between text-xs font-medium mb-1.5">
                   <label className="text-slate-700">NMS IoU Threshold</label>
                   <span className="text-slate-600 font-mono font-bold">{settings.nmsIouThreshold}</span>
                 </div>
                 <input type="range" min="0" max="1" step="0.01" value={settings.nmsIouThreshold} onChange={(e) => handleSettingChange('nmsIouThreshold', parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
               </div>
             </div>
           </div>

           <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
             <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-4 flex items-center">
               <CloudCog size={17} className="mr-2 text-blue-600" /> 
               Local Active Learning
             </h3>
             
             <div className="flex items-center justify-between mb-5 pb-5 border-b border-slate-100">
               <div>
                 <div className="font-semibold text-slate-800 text-xs">Active Learning Queue</div>
                 <div className="text-[11px] text-slate-500 mt-0.5">Buffer low-confidence frames locally</div>
               </div>
               <button 
                 onClick={() => {
                   setActiveLearningEnabled(!activeLearningEnabled);
                   handleSettingChange('activeLearningEnabled', !activeLearningEnabled);
                 }}
                aria-label="Toggle active learning"
                 className={`w-11 h-6 rounded-full transition-colors relative ${
                   activeLearningEnabled ? 'bg-blue-600' : 'bg-slate-300'
                 }`}
               >
                 <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-xs ${
                   activeLearningEnabled ? 'transform translate-x-5' : ''
                 }`} />
               </button>
             </div>

             <div className={`space-y-4 transition ${activeLearningEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
               <div>
                 <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Uncertainty Threshold</label>
                 <input type="number" step="0.01" min="0" max="1" value={settings.uncertaintyThreshold} onChange={(e) => handleSettingChange('uncertaintyThreshold', parseFloat(e.target.value))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs" />
                 <p className="text-[10px] text-slate-400 mt-1">Frames with confidence below this threshold are queued.</p>
               </div>
               
               <div className="bg-blue-50/70 border border-blue-200/70 p-3 rounded-xl flex items-start space-x-2.5">
                 <ShieldAlert size={16} className="text-blue-600 mt-0.5 shrink-0" />
                 <p className="text-[11px] text-blue-900 leading-relaxed">
                   <strong>145 frames</strong> buffered locally in <code>data/active_learning_queue/</code> ready for re-labeling.
                 </p>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

