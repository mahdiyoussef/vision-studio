import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Camera, RefreshCw, Sliders, Video, Activity, Save, Plus } from 'lucide-react';
import { api } from '../services/api';
import { useProject } from '../context/ProjectContext';

export default function Cameras() {
  const { activeProjectId } = useProject();
  const [selectedCamera, setSelectedCamera] = useState('cam-01');
  const [isScanning, setIsScanning] = useState(false);
  
  const [discoveredCameras, setDiscoveredCameras] = useState<any[]>([]);
  const [params, setParams] = useState({
    exposureTime: 1200,
    sensorGain: 2.5,
    digitalContrast: 50,
    whiteBalanceRed: 1.2
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [camsData, paramsData] = await Promise.all([
          api.projects.getCameras(activeProjectId || 'default_project'),
          api.projects.getCameraParams(activeProjectId || 'default_project')
        ]);
        setDiscoveredCameras(camsData);
        setParams(paramsData);
      } catch (error) {
        console.error("Failed to load camera data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [activeProjectId]);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 1500);
  };

  const handleParamChange = (key: string, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveParams = async () => {
    try {
      await api.projects.updateCameraParams(activeProjectId || 'default_project', params);
      toast.success("Camera parameters saved!");
    } catch (error) {
      console.error("Failed to save params:", error);
      toast.error("Failed to save parameters.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-7 h-7 border-2 border-[#ff4d40] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex justify-between items-center bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Camera &amp; Hardware Management</h2>
          <p className="text-sm text-[#9c9c9d] mt-1">Discover, tune exposure and configure industrial inspection camera inputs</p>
        </div>
        <button 
          onClick={handleScan}
          disabled={isScanning}
          className="keycap-btn-dark"
        >
          <RefreshCw size={16} className={isScanning ? "animate-spin text-[#ffb347]" : ""} />
          <span>{isScanning ? 'Scanning Network...' : 'Discover Cameras'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Camera Selection */}
        <div className="col-span-1 space-y-5">
          <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/[0.08]">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4 flex items-center">
              <Camera size={17} className="mr-2 text-[#ff6b4a]" /> 
              Available Cameras
            </h3>
            <div className="space-y-2.5">
              {discoveredCameras.map(cam => (
                <div 
                  key={cam.id}
                  onClick={() => setSelectedCamera(cam.id)}
                  className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
                    selectedCamera === cam.id 
                      ? 'border-[#ff6b4a]/60 bg-[#ff2f3a]/15 text-[#ffb347] shadow-[0_0_15px_rgba(255,47,58,0.2)]' 
                      : 'border-white/[0.08] bg-[#12141a]/60 hover:bg-[#12141a] hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-white text-sm">{cam.name}</h4>
                      <p className="text-[11px] font-mono font-semibold text-[#9c9c9d] uppercase mt-0.5">{cam.protocol}</p>
                    </div>
                    <div className="flex items-center space-x-1.5 mt-1">
                      <span className={`w-2 h-2 rounded-full ${cam.status === 'online' ? 'bg-emerald-400' : 'bg-[#ff4d40]'}`}></span>
                      <span className="text-[10px] font-medium capitalize text-[#9c9c9d]">{cam.status}</span>
                    </div>
                  </div>
                </div>
              ))}
              {discoveredCameras.length === 0 && (
                <div className="text-xs text-[#9c9c9d] text-center py-4">No cameras found.</div>
              )}
            </div>
            
            <button className="w-full mt-4 border border-dashed border-white/20 text-[#9c9c9d] hover:text-[#ffb347] hover:border-[#ff6b4a]/50 py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1 bg-white/[0.02] hover:bg-white/[0.05]">
              <Plus size={14} />
              <span>Add RTSP Source Manually</span>
            </button>
          </div>
          
          <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/[0.08]">
             <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4 flex items-center">
              <Activity size={17} className="mr-2 text-[#ff6b4a]" /> 
              Active Sensor Stats
            </h3>
            <div className="space-y-3 text-xs">
               <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                 <span className="text-[#9c9c9d] font-medium">FPS Rate</span>
                 <span className="font-bold text-white font-mono">30.0 fps</span>
               </div>
               <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                 <span className="text-[#9c9c9d] font-medium">Resolution</span>
                 <span className="font-bold text-white font-mono">1920x1080</span>
               </div>
               <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                 <span className="text-[#9c9c9d] font-medium">Bandwidth</span>
                 <span className="font-bold text-white font-mono">12.4 Mbps</span>
               </div>
               <div className="flex justify-between py-1.5">
                 <span className="text-[#9c9c9d] font-medium">Sensor Temp</span>
                 <span className="font-bold text-[#ffb347] font-mono">45°C</span>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Feed and Parameters */}
        <div className="col-span-2 space-y-6">
          <div className="bg-[#050608] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/[0.1] aspect-video relative flex items-center justify-center">
             <Video size={48} className="text-white/20" />
             <div className="absolute top-4 left-4 bg-[#0d0e12]/85 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-lg border border-white/[0.1] font-mono font-medium">
               {discoveredCameras.find(c => c.id === selectedCamera)?.name || 'No Camera Selected'}
             </div>
             <div className="absolute top-4 right-4 bg-[#ff2f3a] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-[0_0_12px_rgba(255,47,58,0.5)]">
               <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
               <span>LIVE</span>
             </div>
          </div>

          <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/[0.08]">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center">
                  <Sliders size={17} className="mr-2 text-[#ffb347]" /> 
                  Hardware Parameter Tuning
                </h3>
                <button onClick={handleSaveParams} className="keycap-btn-primary text-xs py-2 px-4">
                  <Save size={15} />
                  <span>Save Parameters</span>
                </button>
             </div>

             <div className="grid grid-cols-2 gap-8">
               <div className="space-y-5">
                 <div>
                   <div className="flex justify-between text-xs font-medium mb-1.5">
                     <label className="text-[#9c9c9d]">Exposure Time</label>
                     <span className="text-[#ffcca0] font-mono font-bold">{params.exposureTime} µs</span>
                   </div>
                   <input type="range" min="100" max="5000" value={params.exposureTime} onChange={(e) => handleParamChange('exposureTime', parseInt(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ff4d40]" />
                 </div>
                 
                 <div>
                   <div className="flex justify-between text-xs font-medium mb-1.5">
                     <label className="text-[#9c9c9d]">Sensor Gain</label>
                     <span className="text-[#ffcca0] font-mono font-bold">{params.sensorGain}x</span>
                   </div>
                   <input type="range" min="1" max="10" step="0.1" value={params.sensorGain} onChange={(e) => handleParamChange('sensorGain', parseFloat(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ff4d40]" />
                 </div>
               </div>

               <div className="space-y-5">
                 <div>
                   <div className="flex justify-between text-xs font-medium mb-1.5">
                     <label className="text-[#9c9c9d]">Digital Contrast</label>
                     <span className="text-[#ffcca0] font-mono font-bold">{params.digitalContrast}%</span>
                   </div>
                   <input type="range" min="0" max="100" value={params.digitalContrast} onChange={(e) => handleParamChange('digitalContrast', parseInt(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ff4d40]" />
                 </div>
                 
                 <div>
                   <div className="flex justify-between text-xs font-medium mb-1.5">
                     <label className="text-[#9c9c9d]">White Balance (Red)</label>
                     <span className="text-[#ffcca0] font-mono font-bold">{params.whiteBalanceRed}</span>
                   </div>
                   <input type="range" min="0" max="3" step="0.1" value={params.whiteBalanceRed} onChange={(e) => handleParamChange('whiteBalanceRed', parseFloat(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ff4d40]" />
                 </div>
               </div>
             </div>
             
             <div className="mt-8 pt-5 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-xs text-[#9c9c9d] font-medium">Automated Calibration:</span>
                <div className="flex space-x-2.5">
                  <button className="keycap-btn-dark text-xs py-1.5 px-3">Auto Focus</button>
                  <button className="keycap-btn-dark text-xs py-1.5 px-3">Auto Exposure</button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
