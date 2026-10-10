import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Play, Square, Settings, Server, FileText, Activity } from 'lucide-react';
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
  }, [isTraining, jobId, activeProjectId]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex justify-between items-center bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Model Training Studio</h2>
          <p className="text-sm text-[#9c9c9d] mt-1">Train and fine-tune YOLO, ResNet, and UNet edge models with hardware acceleration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Configuration */}
        <div className="col-span-1 space-y-5">
          <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/[0.08]">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-4 flex items-center">
              <Settings size={16} className="mr-2 text-[#ff6b4a]" /> 
              Training Hyperparameters
            </h3>
            
            <form className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#9c9c9d] mb-1.5 uppercase tracking-wider">Architecture</label>
                <select className="w-full px-3.5 py-2.5 bg-[#12141a] border border-white/[0.1] rounded-xl text-xs text-white focus:border-[#ff6b4a]/60 outline-none">
                  <option value="yolov8" className="bg-[#12141a] text-white">YOLOv8 (Object Detection)</option>
                  <option value="resnet50" className="bg-[#12141a] text-white">ResNet50 (Classification)</option>
                  <option value="unet" className="bg-[#12141a] text-white">UNet (Segmentation)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-[#9c9c9d] mb-1.5 uppercase tracking-wider">Dataset</label>
                <select className="w-full px-3.5 py-2.5 bg-[#12141a] border border-white/[0.1] rounded-xl text-xs text-white focus:border-[#ff6b4a]/60 outline-none">
                  <option value="stator_ds_v2" className="bg-[#12141a] text-white">Stator Dataset v2 (1.2k images)</option>
                  <option value="chignon_ds" className="bg-[#12141a] text-white">Chignon Defects (500 images)</option>
                  <option value="custom" className="bg-[#12141a] text-white">Upload New Dataset...</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#9c9c9d] mb-1.5 uppercase tracking-wider">Epochs</label>
                  <input type="number" defaultValue="100" className="w-full px-3.5 py-2 bg-[#12141a] border border-white/[0.1] rounded-xl text-white focus:border-[#ff6b4a]/60 outline-none text-xs font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9c9c9d] mb-1.5 uppercase tracking-wider">Batch Size</label>
                  <input type="number" defaultValue="16" className="w-full px-3.5 py-2 bg-[#12141a] border border-white/[0.1] rounded-xl text-white focus:border-[#ff6b4a]/60 outline-none text-xs font-mono" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-[#9c9c9d] mb-1.5 uppercase tracking-wider">Learning Rate</label>
                <input type="number" step="0.0001" defaultValue="0.001" className="w-full px-3.5 py-2 bg-[#12141a] border border-white/[0.1] rounded-xl text-white focus:border-[#ff6b4a]/60 outline-none text-xs font-mono" />
              </div>
              
              <div className="pt-4 border-t border-white/[0.08]">
                <button 
                  type="button" 
                  onClick={isTraining ? () => setIsTraining(false) : handleStartTraining}
                  className={`w-full ${isTraining ? 'keycap-btn-warm' : 'keycap-btn-primary'}`}
                >
                  {isTraining ? <Square size={16} /> : <Play size={16} />}
                  <span>{isTraining ? 'Stop Training' : 'Start Training Run'}</span>
                </button>
              </div>
            </form>
          </div>
          
          <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/[0.08]">
             <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-4 flex items-center">
               <Server size={16} className="mr-2 text-[#ffb347]" /> 
               Hardware Allocation
             </h3>
             <div className="space-y-3 text-xs">
                <label className="flex items-center space-x-2.5 cursor-pointer p-2.5 rounded-xl border border-white/[0.08] bg-[#12141a]/60 hover:bg-[#12141a]">
                  <input type="radio" name="compute" value="local" checked={computeTarget === 'local'} onChange={(e) => setComputeTarget(e.target.value)} className="text-[#ff4d40] focus:ring-[#ff6b4a]/30" />
                  <span className="font-medium text-white">Local GPU / Accelerator (CUDA)</span>
                </label>
                <label className="flex items-center space-x-2.5 cursor-pointer p-2.5 rounded-xl border border-white/[0.08] bg-[#12141a]/60 hover:bg-[#12141a]">
                  <input type="radio" name="compute" value="local-cpu" checked={computeTarget === 'local-cpu'} onChange={(e) => setComputeTarget(e.target.value)} className="text-[#ff4d40] focus:ring-[#ff6b4a]/30" />
                  <span className="font-medium text-[#d1d1d2]">Local CPU Fallback</span>
                </label>
             </div>
          </div>
        </div>

        {/* Right Column: Monitoring */}
        <div className="col-span-2 space-y-6">
           <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-7 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/[0.08] min-h-[300px]">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center">
                  <Activity size={17} className="mr-2 text-[#ff6b4a]" /> 
                  Training Metrics (Live)
                </h3>
                <span className="text-xs font-mono font-semibold text-[#ffcca0] bg-white/[0.06] border border-white/[0.08] px-2.5 py-1 rounded-md">Epoch {Math.floor(progress)}/100</span>
             </div>
             
             {isTraining || progress > 0 ? (
               <div className="space-y-7">
                 <div>
                   <div className="flex justify-between text-xs font-semibold mb-2">
                     <span className="text-[#9c9c9d]">Overall Progress</span>
                     <span className="text-[#ffb347] font-mono font-bold">{progress}%</span>
                   </div>
                   <div className="w-full bg-white/[0.08] rounded-full h-2.5 overflow-hidden border border-white/[0.08]">
                     <div className="bg-gradient-to-r from-[#ff2f3a] via-[#ff6b4a] to-[#ffb347] h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(255,107,74,0.4)]" style={{ width: `${progress}%` }}></div>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6">
                   <div className="bg-[#12141a]/80 rounded-xl p-4 border border-white/[0.08] h-48 flex flex-col items-center justify-center relative">
                     <div className="absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wider text-[#9c9c9d]">Loss Curve</div>
                     <svg className="w-full h-full text-[#ff4d40] opacity-80" viewBox="0 0 100 50" preserveAspectRatio="none">
                       <polyline fill="none" stroke="currentColor" strokeWidth="2.5" points={`0,45 ${progress/2},${45 - progress/3} ${progress},${45 - progress/2.5}`} />
                     </svg>
                   </div>
                   <div className="bg-[#12141a]/80 rounded-xl p-4 border border-white/[0.08] h-48 flex flex-col items-center justify-center relative">
                     <div className="absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wider text-[#9c9c9d]">mAP @ 0.5</div>
                     <svg className="w-full h-full text-[#ffb347] opacity-80" viewBox="0 0 100 50" preserveAspectRatio="none">
                       <polyline fill="none" stroke="currentColor" strokeWidth="2.5" points={`0,45 ${progress/2},${45 - progress/3} ${progress},${10}`} />
                     </svg>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="h-48 flex flex-col items-center justify-center text-[#9c9c9d]">
                 <Activity size={40} className="mb-3 opacity-25 text-white" />
                 <p className="text-sm font-medium text-white">Start training run to stream real-time metrics</p>
                 <p className="text-xs text-[#9c9c9d] mt-1">Loss and mean average precision (mAP) will plot here</p>
               </div>
             )}
           </div>

           <div className="bg-[#050608] p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/[0.1] text-[#d1d1d2] font-mono text-xs h-64 overflow-y-auto">
             <div className="flex items-center text-[#9c9c9d] mb-2 border-b border-white/[0.08] pb-2 text-[11px] font-semibold">
               <FileText size={14} className="mr-2 text-[#ff6b4a]" /> 
               Console Output
             </div>
             {logs.length > 0 && (
               <div className="space-y-1">
                 {logs.map((log: any, i: number) => (
                   <div key={i} className={log.includes('[SUCCESS]') ? 'text-emerald-400' : log.includes('[INFO]') ? 'text-[#ffcca0]' : ''}>{log}</div>
                 ))}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
