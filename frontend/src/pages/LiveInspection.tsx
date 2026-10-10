import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Play, Square, Settings2, Download, AlertTriangle, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';
import { api } from '../services/api';
import { useProject } from '../context/ProjectContext';

export default function LiveInspection() {
  const { activeProjectId } = useProject();
  const [isInspecting, setIsInspecting] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState('all');
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const sessionIdRef = useRef<string>(Math.random().toString(36).substring(2, 15));

  useEffect(() => {
    if (isInspecting) {
      startWebRTC();
    } else {
      stopWebRTC();
    }
    return () => stopWebRTC();
  }, [isInspecting]);

  const startWebRTC = async () => {
    if (!activeProjectId) {
      toast.error('No active project selected.');
      setIsInspecting(false);
      return;
    }

    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    pc.addTransceiver('video', { direction: 'recvonly' });

    pc.ontrack = (event) => {
      if (videoRef.current && event.track.kind === 'video') {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    try {
      const response = await api.webrtc.offer(pc.localDescription!.sdp, pc.localDescription!.type, activeProjectId, sessionIdRef.current);
      await pc.setRemoteDescription(new RTCSessionDescription(response));
    } catch (e) {
      console.error("WebRTC Offer failed", e);
      toast.error('Failed to start inspection stream.');
      setIsInspecting(false);
    }
  };

  const stopWebRTC = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Live Inspection Monitor</h2>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isInspecting ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
              {isInspecting ? 'Live Feed Active' : 'Standby'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Real-time low-latency WebRTC video stream with synchronized AI metrology overlays</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl flex items-center space-x-2 transition text-sm font-medium shadow-xs">
            <Settings2 size={17} />
            <span>Settings</span>
          </button>
          <button 
            onClick={() => setIsInspecting(!isInspecting)}
            className={`px-5 py-2.5 rounded-xl flex items-center space-x-2 transition text-white shadow-xs text-sm font-semibold ${
              isInspecting ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isInspecting ? <Square size={17} /> : <Play size={17} />}
            <span>{isInspecting ? 'Stop Inspection' : 'Start Inspection'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left/Main Column: WebRTC Feed */}
        <div className="col-span-1 lg:col-span-3 space-y-4">
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-800 aspect-video relative flex items-center justify-center">
             <video ref={videoRef} autoPlay playsInline muted className={`absolute inset-0 w-full h-full object-contain ${isInspecting ? 'bg-black' : 'bg-slate-950'}`} />
             
             {isInspecting ? (
               <>
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-emerald-400 rounded-sm shadow-sm">
                    <div className="absolute -top-6 left-0 bg-emerald-500 text-white text-[11px] px-1.5 py-0.5 font-bold rounded-xs">Stator: 0.98</div>
                  </div>
                  <div className="absolute top-1/2 left-2/3 w-24 h-24 border-2 border-rose-500 rounded-sm shadow-sm">
                    <div className="absolute -top-6 left-0 bg-rose-500 text-white text-[11px] px-1.5 py-0.5 font-bold rounded-xs">Defect: 0.85</div>
                  </div>
               </>
             ) : (
                <div className="text-slate-400 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-3 text-slate-500">
                    <Play size={32} />
                  </div>
                  <p className="text-sm font-medium text-slate-300">Click Start Inspection to begin feed</p>
                  <p className="text-xs text-slate-500 mt-1">UVC or RTSP streaming direct to browser</p>
                </div>
             )}

             <div className="absolute top-4 right-4 flex space-x-2">
               <button className="bg-slate-800/80 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs backdrop-blur-md transition border border-slate-700/60 font-medium">
                 Toggle Overlays
               </button>
             </div>
             {isInspecting && (
                <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs flex space-x-6 border border-slate-700/60">
                  <div>FPS: <span className="text-emerald-400 font-mono font-semibold">29.9</span></div>
                  <div>Latency: <span className="text-emerald-400 font-mono font-semibold">45ms</span></div>
                  <div>Resolution: <span className="font-mono text-slate-300">1080p</span></div>
                </div>
             )}
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Display Filters:</span>
              <div className="flex space-x-2">
                {['all', 'defects', 'measurements', 'classes'].map(filter => (
                  <button 
                    key={filter}
                    onClick={() => setActiveOverlay(filter)}
                    className={`px-3 py-1 text-xs rounded-lg capitalize transition font-medium ${
                      activeOverlay === filter 
                        ? 'bg-blue-50 text-blue-600 border border-blue-200/70 font-semibold shadow-xs' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
            <button className="text-xs text-slate-600 hover:text-blue-600 flex items-center space-x-1.5 transition px-3 py-1.5 bg-slate-50 hover:bg-blue-50 rounded-lg border border-slate-200/60 font-medium">
              <Download size={14} />
              <span>Snapshot</span>
            </button>
          </div>
        </div>

        {/* Right Column: Real-time Stats & Logs */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
            <h3 className="font-bold text-slate-900 text-sm mb-4 uppercase tracking-wider">Current Shift Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 text-center">
                <div className="text-2xl font-bold text-slate-900">1,248</div>
                <div className="text-[11px] text-slate-500 font-medium uppercase mt-1">Total Inspected</div>
              </div>
              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100 text-center">
                <div className="text-2xl font-bold text-emerald-700">98.5%</div>
                <div className="text-[11px] text-emerald-600 font-medium uppercase mt-1">Yield Rate</div>
              </div>
              <div className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-100 text-center">
                <div className="text-2xl font-bold text-rose-700">18</div>
                <div className="text-[11px] text-rose-600 font-medium uppercase mt-1">Defects</div>
              </div>
              <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 text-center">
                <div className="text-2xl font-bold text-blue-700">42ms</div>
                <div className="text-[11px] text-blue-600 font-medium uppercase mt-1">Infer Time</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col h-[380px]">
            <h3 className="font-bold text-slate-900 text-sm mb-4 uppercase tracking-wider flex items-center justify-between">
              <span>Live Event Log</span>
              <Activity size={15} className="text-slate-400" />
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
               {isInspecting ? (
                 <>
                  <div className="flex items-start space-x-2.5 p-2.5 bg-amber-50/60 border border-amber-100 rounded-xl text-xs">
                    <AlertTriangle size={15} className="text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Measurement warning</div>
                      <div className="text-slate-600 mt-0.5">Diameter 15.2mm (limit 15.0mm)</div>
                      <div className="text-slate-400 text-[10px] mt-1 font-mono">10:45:32 AM</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2.5 p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs">
                    <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Passed Inspection</div>
                      <div className="text-slate-600 mt-0.5">Item #89201</div>
                      <div className="text-slate-400 text-[10px] mt-1 font-mono">10:45:28 AM</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2.5 p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs">
                    <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Passed Inspection</div>
                      <div className="text-slate-600 mt-0.5">Item #89200</div>
                      <div className="text-slate-400 text-[10px] mt-1 font-mono">10:45:24 AM</div>
                    </div>
                  </div>
                 </>
               ) : (
                 <div className="text-center text-slate-400 text-xs py-14 flex flex-col items-center">
                    <ShieldCheck size={28} className="text-slate-300 mb-2" />
                    <p>System in standby mode.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Live events appear here when inspecting.</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
