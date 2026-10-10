import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Play, Square, Settings, Database, Activity, Server, FileText } from 'lucide-react';
import { api } from '../services/api';
import { useProject } from '../context/ProjectContext';

export default function TrainingStudio() {
  const { activeProjectId } = useProject();
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [computeTarget, setComputeTarget] = useState('local');
  
  const handleStartTraining = async () => {
    const pid = activeProjectId || 'default_project';
    try {
      const data = await api.mlops.train({ model_type: 'yolo', epochs: 100, compute_target: computeTarget }, pid);
      setJobId(data.job_id);
      setIsTraining(true);
      setProgress(0);
      setLogs([`[INFO] Compute Target: ${computeTarget}`, '[INFO] Loading dataset...', '[INFO] Initializing weights...', `[INFO] Starting training job ${data.job_id}`]);
    } catch (e) {
      console.error(e);
      toast.error('Failed to start training.');
    }
  };

  useEffect(() => {
    let interval: any;
    const pid = activeProjectId || 'default_project';
    if (isTraining && jobId) {
      interval = setInterval(async () => {
        try {
          const job = await api.mlops.getJob(jobId, pid);
          setProgress(job.progress);
          setLogs((prev: any) => [...prev, `Epoch metrics - Loss: ${job.metrics.loss.toFixed(2)}, mAP: ${job.metrics.mAP.toFixed(2)}`]);
          if (job.status === 'completed') {
            setIsTraining(false);
            clearInterval(interval);
            setLogs((prev: any) => [...prev, '[SUCCESS] Training completed. Model saved.']);
          }
        } catch (e) {
          console.error(e);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTraining, jobId]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Model Training Studio</h2>
          <p className="text-sm text-slate-500 mt-1">Train and fine-tune YOLO, ResNet, and UNet edge models with hardware acceleration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Configuration */}
        <div className="col-span-1 space-y-5">
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-4 flex items-center">
              <Settings size={16} className="mr-2 text-blue-600" /> 
              Training Hyperparameters
            </h3>
            
            <form className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Architecture</label>
                <select className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-medium">
                  <option value="yolov8">YOLOv8 (Object Detection)</option>
                  <option value="resnet50">ResNet50 (Classification)</option>
                  <option value="unet">UNet (Segmentation)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Dataset</label>
                <select className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-medium">
                  <option value="stator_ds_v2">Stator Dataset v2 (1.2k images)</option>
                  <option value="chignon_ds">Chignon Defects (500 images)</option>
                  <option value="custom">Upload New Dataset...</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Epochs</label>
                  <input type="number" defaultValue="100" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Batch Size</label>
                  <input type="number" defaultValue="16" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Learning Rate</label>
                <input type="number" step="0.0001" defaultValue="0.001" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-mono" />
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={isTraining ? () => setIsTraining(false) : handleStartTraining}
                  className={`w-full py-2.5 rounded-xl flex justify-center items-center space-x-2 text-white transition shadow-xs font-semibold text-xs ${
                    isTraining ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isTraining ? <Square size={16} /> : <Play size={16} />}
                  <span>{isTraining ? 'Stop Training' : 'Start Training Run'}</span>
                </button>
              </div>
            </form>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
             <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-4 flex items-center">
               <Server size={16} className="mr-2 text-indigo-600" /> 
               Hardware Allocation
             </h3>
             <div className="space-y-3 text-xs">
                <label className="flex items-center space-x-2.5 cursor-pointer p-2.5 rounded-xl border border-slate-200/60 bg-slate-50/50 hover:bg-white">
                  <input type="radio" name="compute" value="local" checked={computeTarget === 'local'} onChange={(e) => setComputeTarget(e.target.value)} className="text-blue-600 focus:ring-blue-500" />
                  <span className="font-medium text-slate-800">Local GPU / Accelerator (CUDA)</span>
                </label>
                <label className="flex items-center space-x-2.5 cursor-pointer p-2.5 rounded-xl border border-slate-200/60 bg-slate-50/50 hover:bg-white">
                  <input type="radio" name="compute" value="local-cpu" checked={computeTarget === 'local-cpu'} onChange={(e) => setComputeTarget(e.target.value)} className="text-blue-600 focus:ring-blue-500" />
                  <span className="font-medium text-slate-800">Local CPU Fallback</span>
                </label>
             </div>
          </div>
        </div>

        {/* Right Column: Monitoring */}
        <div className="col-span-2 space-y-6">
           <div className="bg-white p-7 rounded-2xl shadow-xs border border-slate-200/80 min-h-[300px]">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center">
                  <Activity size={17} className="mr-2 text-emerald-600" /> 
                  Training Metrics (Live)
                </h3>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">Epoch {Math.floor(progress)}/100</span>
             </div>
             
             {isTraining || progress > 0 ? (
               <div className="space-y-7">
                 <div>
                   <div className="flex justify-between text-xs font-semibold mb-2">
                     <span className="text-slate-700">Overall Progress</span>
                     <span className="text-blue-600 font-bold">{progress}%</span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                     <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6">
                   <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 h-48 flex flex-col items-center justify-center relative">
                     <div className="absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Loss Curve</div>
                     <svg className="w-full h-full text-blue-600 opacity-60" viewBox="0 0 100 50" preserveAspectRatio="none">
                       <polyline fill="none" stroke="currentColor" strokeWidth="2.5" points={`0,45 ${progress/2},${45 - progress/3} ${progress},${45 - progress/2.5}`} />
                     </svg>
                   </div>
                   <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 h-48 flex flex-col items-center justify-center relative">
                     <div className="absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">mAP @ 0.5</div>
                     <svg className="w-full h-full text-emerald-500 opacity-60" viewBox="0 0 100 50" preserveAspectRatio="none">
                       <polyline fill="none" stroke="currentColor" strokeWidth="2.5" points={`0,45 ${progress/2},${45 - progress/3} ${progress},${10}`} />
                     </svg>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="h-48 flex flex-col items-center justify-center text-slate-400">
                 <Activity size={40} className="mb-3 opacity-30 text-slate-400" />
                 <p className="text-sm font-medium">Start training run to stream real-time metrics</p>
                 <p className="text-xs text-slate-400 mt-1">Loss and mean average precision (mAP) will plot here</p>
               </div>
             )}
           </div>

           <div className="bg-slate-900 p-6 rounded-2xl shadow-xs border border-slate-800 text-slate-300 font-mono text-xs h-64 overflow-y-auto">
             <div className="flex items-center text-slate-400 mb-2 border-b border-slate-800 pb-2 text-[11px] font-semibold">
               <FileText size={14} className="mr-2" /> 
               Console Output
             </div>
             {logs.length > 0 && (
               <div className="space-y-1">
                 {logs.map((log: any, i: number) => (
                   <div key={i} className={log.includes('[SUCCESS]') ? 'text-emerald-400' : ''}>{log}</div>
                 ))}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
