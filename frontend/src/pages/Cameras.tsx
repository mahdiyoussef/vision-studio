import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
//, { useState, useEffect } from 'react';
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
  }, []);

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
      toast("Camera parameters saved!");
    } catch (error) {
      console.error("Failed to save params:", error);
      toast("Failed to save parameters.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Camera & Hardware Management</h2>
          <p className="text-sm text-slate-500 mt-1">Discover, tune exposure and configure industrial inspection camera inputs</p>
        </div>
        <button 
          onClick={handleScan}
          disabled={isScanning}
          className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl flex items-center space-x-2 transition disabled:opacity-50 text-sm font-semibold shadow-xs"
        >
          <RefreshCw size={17} className={isScanning ? "animate-spin text-blue-600" : ""} />
          <span>{isScanning ? 'Scanning Network...' : 'Discover Cameras'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Camera Selection */}
        <div className="col-span-1 space-y-5">
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-4 flex items-center">
              <Camera size={17} className="mr-2 text-blue-600" /> 
              Available Cameras
            </h3>
            <div className="space-y-2.5">
              {discoveredCameras.map(cam => (
                <div 
                  key={cam.id}
                  onClick={() => setSelectedCamera(cam.id)}
                  className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
                    selectedCamera === cam.id 
                      ? 'border-blue-500 bg-blue-50/70 shadow-xs' 
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{cam.name}</h4>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase mt-0.5">{cam.protocol}</p>
                    </div>
                    <div className="flex items-center space-x-1.5 mt-1">
                      <span className={`w-2 h-2 rounded-full ${cam.status === 'online' ? 'bg-emerald-500' : 'bg-rose-400'}`}></span>
                      <span className="text-[10px] font-medium capitalize text-slate-500">{cam.status}</span>
                    </div>
                  </div>
                </div>
              ))}
              {discoveredCameras.length === 0 && (
                <div className="text-xs text-slate-500 text-center py-4">No cameras found.</div>
              )}
            </div>
            
            <button className="w-full mt-4 border border-dashed border-slate-300 text-slate-600 hover:text-blue-600 hover:border-blue-400 py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1 bg-slate-50/50 hover:bg-blue-50/50">
              <Plus size={14} />
              <span>Add RTSP Source Manually</span>
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
             <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-4 flex items-center">
              <Activity size={17} className="mr-2 text-emerald-600" /> 
              Active Sensor Stats
            </h3>
            <div className="space-y-3 text-xs">
               <div className="flex justify-between py-1.5 border-b border-slate-100">
                 <span className="text-slate-500 font-medium">FPS Rate</span>
                 <span className="font-bold text-slate-800 font-mono">30.0 fps</span>
               </div>
               <div className="flex justify-between py-1.5 border-b border-slate-100">
                 <span className="text-slate-500 font-medium">Resolution</span>
                 <span className="font-bold text-slate-800 font-mono">1920x1080</span>
               </div>
               <div className="flex justify-between py-1.5 border-b border-slate-100">
                 <span className="text-slate-500 font-medium">Bandwidth</span>
                 <span className="font-bold text-slate-800 font-mono">12.4 Mbps</span>
               </div>
               <div className="flex justify-between py-1.5">
                 <span className="text-slate-500 font-medium">Sensor Temp</span>
                 <span className="font-bold text-amber-600 font-mono">45°C</span>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Feed and Parameters */}
        <div className="col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xs border border-slate-800 aspect-video relative flex items-center justify-center">
             <Video size={48} className="text-slate-600" />
             <div className="absolute top-4 left-4 bg-slate-800/80 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-lg border border-slate-700 font-medium">
               {discoveredCameras.find(c => c.id === selectedCamera)?.name || 'No Camera Selected'}
             </div>
             <div className="absolute top-4 right-4 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-xs">
               <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
               <span>LIVE</span>
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center">
                  <Sliders size={17} className="mr-2 text-indigo-600" /> 
                  Hardware Parameter Tuning
                </h3>
                <button onClick={handleSaveParams} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition shadow-xs font-semibold">
                  <Save size={15} />
                  <span>Save Parameters</span>
                </button>
             </div>

             <div className="grid grid-cols-2 gap-8">
               <div className="space-y-5">
                 <div>
                   <div className="flex justify-between text-xs font-medium mb-1.5">
                     <label className="text-slate-700">Exposure Time</label>
                     <span className="text-slate-500 font-mono font-bold">{params.exposureTime} µs</span>
                   </div>
                   <input type="range" min="100" max="5000" value={params.exposureTime} onChange={(e) => handleParamChange('exposureTime', parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                 </div>
                 
                 <div>
                   <div className="flex justify-between text-xs font-medium mb-1.5">
                     <label className="text-slate-700">Sensor Gain</label>
                     <span className="text-slate-500 font-mono font-bold">{params.sensorGain}x</span>
                   </div>
                   <input type="range" min="1" max="10" step="0.1" value={params.sensorGain} onChange={(e) => handleParamChange('sensorGain', parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                 </div>
               </div>

               <div className="space-y-5">
                 <div>
                   <div className="flex justify-between text-xs font-medium mb-1.5">
                     <label className="text-slate-700">Digital Contrast</label>
                     <span className="text-slate-500 font-mono font-bold">{params.digitalContrast}%</span>
                   </div>
                   <input type="range" min="0" max="100" value={params.digitalContrast} onChange={(e) => handleParamChange('digitalContrast', parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                 </div>
                 
                 <div>
                   <div className="flex justify-between text-xs font-medium mb-1.5">
                     <label className="text-slate-700">White Balance (Red)</label>
                     <span className="text-slate-500 font-mono font-bold">{params.whiteBalanceRed}</span>
                   </div>
                   <input type="range" min="0" max="3" step="0.1" value={params.whiteBalanceRed} onChange={(e) => handleParamChange('whiteBalanceRed', parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                 </div>
               </div>
             </div>
             
             <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Automated Calibration:</span>
                <div className="flex space-x-2.5">
                  <button className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-medium border border-slate-200 transition">Auto Focus</button>
                  <button className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-medium border border-slate-200 transition">Auto Exposure</button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
