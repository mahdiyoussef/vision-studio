import React, { useState, useEffect, useRef } from 'react';
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
      {/* Header Banner */}
      <div className="flex justify-between items-center bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Live Inspection Monitor</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${
              isInspecting 
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                : 'bg-white/[0.06] text-[#9c9c9d] border-white/[0.08]'
            }`}>
              {isInspecting ? 'Live Feed Active' : 'Standby'}
            </span>
          </div>
          <p className="text-sm text-[#9c9c9d] mt-1">Real-time low-latency WebRTC video stream with synchronized AI metrology overlays</p>
        </div>
        <div className="flex space-x-3">
          <button className="keycap-btn-dark">
            <Settings2 size={16} />
            <span>Settings</span>
          </button>
          <button 
            onClick={() => setIsInspecting(!isInspecting)}
            className={isInspecting ? "keycap-btn-warm" : "keycap-btn-primary"}
          >
            {isInspecting ? <Square size={16} /> : <Play size={16} />}
            <span>{isInspecting ? 'Stop Inspection' : 'Start Inspection'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left/Main Column: WebRTC Feed */}
        <div className="col-span-1 lg:col-span-3 space-y-4">
          <div className="bg-[#050608] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/[0.1] aspect-video relative flex items-center justify-center">
             <video ref={videoRef} autoPlay playsInline muted className={`absolute inset-0 w-full h-full object-contain ${isInspecting ? 'bg-black' : 'bg-[#050608]'}`} />
             
             {isInspecting ? (
               <>
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-emerald-400 rounded-sm shadow-[0_0_15px_rgba(52,211,153,0.4)]">
                    <div className="absolute -top-6 left-0 bg-emerald-500 text-white text-[11px] px-1.5 py-0.5 font-mono font-bold rounded-xs shadow-xs">Stator: 0.98</div>
                  </div>
                  <div className="absolute top-1/2 left-2/3 w-24 h-24 border-2 border-[#ff2f3a] rounded-sm shadow-[0_0_15px_rgba(255,47,58,0.5)]">
                    <div className="absolute -top-6 left-0 bg-[#ff2f3a] text-white text-[11px] px-1.5 py-0.5 font-mono font-bold rounded-xs shadow-xs">Defect: 0.85</div>
                  </div>
               </>
             ) : (
                <div className="text-[#9c9c9d] flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#12141a] flex items-center justify-center mb-3 text-[#ff6b4a] border border-white/[0.08] shadow-[0_0_24px_rgba(255,107,74,0.15)]">
                    <Play size={28} />
                  </div>
                  <p className="text-sm font-medium text-white">Click Start Inspection to begin feed</p>
                  <p className="text-xs text-[#9c9c9d] mt-1">UVC or RTSP streaming direct to browser</p>
                </div>
             )}

             <div className="absolute top-4 right-4 flex space-x-2">
               <button className="bg-[#0d0e12]/80 hover:bg-[#12141a] text-white px-3 py-1.5 rounded-lg text-xs backdrop-blur-md transition border border-white/[0.1] font-medium shadow-sm">
                 Toggle Overlays
               </button>
             </div>
             {isInspecting && (
                <div className="absolute bottom-4 left-4 bg-[#0d0e12]/85 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs flex space-x-6 border border-white/[0.1] shadow-lg">
                  <div>FPS: <span className="text-[#ffb347] font-mono font-semibold">29.9</span></div>
                  <div>Latency: <span className="text-emerald-400 font-mono font-semibold">45ms</span></div>
                  <div>Resolution: <span className="font-mono text-[#d1d1d2]">1080p</span></div>
                </div>
             )}
          </div>

          <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-4 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.5)] border border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-semibold text-[#9c9c9d] uppercase tracking-wider">Display Filters:</span>
              <div className="flex space-x-2">
                {['all', 'defects', 'measurements', 'classes'].map(filter => (
                  <button 
                    key={filter}
                    onClick={() => setActiveOverlay(filter)}
                    className={`px-3 py-1 text-xs rounded-lg capitalize transition font-medium ${
                      activeOverlay === filter 
                        ? 'bg-[#ff2f3a]/15 text-blue-600 text-[#ffb347] border border-[#ff6b4a]/30 font-semibold shadow-xs' 
                        : 'bg-white/[0.04] text-[#9c9c9d] hover:bg-white/[0.08] hover:text-white border border-transparent'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
            <button className="keycap-btn-dark text-xs py-1.5 px-3">
              <Download size={14} />
              <span>Snapshot</span>
            </button>
          </div>
        </div>

        {/* Right Column: Real-time Stats & Logs */}
        <div className="col-span-1 space-y-6">
          <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/[0.08]">
            <h3 className="font-bold text-white text-sm mb-4 uppercase tracking-wider">Current Shift Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#12141a]/90 p-3.5 rounded-xl border border-white/[0.08] text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="text-2xl font-bold font-mono text-white">1,248</div>
                <div className="text-[11px] text-[#9c9c9d] font-medium uppercase mt-1">Total Inspected</div>
              </div>
              <div className="bg-[#12141a]/90 p-3.5 rounded-xl border border-emerald-500/20 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="text-2xl font-bold font-mono text-emerald-400">98.5%</div>
                <div className="text-[11px] text-emerald-500 font-medium uppercase mt-1">Yield Rate</div>
              </div>
              <div className="bg-[#12141a]/90 p-3.5 rounded-xl border border-[#ff2f3a]/25 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="text-2xl font-bold font-mono text-[#ff4d40]">18</div>
                <div className="text-[11px] text-[#ff8075] font-medium uppercase mt-1">Defects</div>
              </div>
              <div className="bg-[#12141a]/90 p-3.5 rounded-xl border border-[#ffb347]/25 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="text-2xl font-bold font-mono text-[#ffb347]">42ms</div>
                <div className="text-[11px] text-[#ffb347] font-medium uppercase mt-1">Infer Time</div>
              </div>
            </div>
          </div>

          <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/[0.08] flex flex-col h-[380px]">
            <h3 className="font-bold text-white text-sm mb-4 uppercase tracking-wider flex items-center justify-between">
              <span>Live Event Log</span>
              <Activity size={15} className="text-[#ff6b4a]" />
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
               {isInspecting ? (
                 <>
                  <div className="flex items-start space-x-2.5 p-2.5 bg-[#ff6b4a]/10 border border-[#ff6b4a]/25 rounded-xl text-xs">
                    <AlertTriangle size={15} className="text-[#ffb347] mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-white">Measurement warning</div>
                      <div className="text-[#9c9c9d] mt-0.5">Diameter 15.2mm (limit 15.0mm)</div>
                      <div className="text-[#ffcca0] text-[10px] mt-1 font-mono">10:45:32 AM</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2.5 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs">
                    <CheckCircle2 size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-white">Passed Inspection</div>
                      <div className="text-[#9c9c9d] mt-0.5">Item #89201</div>
                      <div className="text-[#9c9c9d] text-[10px] mt-1 font-mono">10:45:28 AM</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2.5 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs">
                    <CheckCircle2 size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-white">Passed Inspection</div>
                      <div className="text-[#9c9c9d] mt-0.5">Item #89200</div>
                      <div className="text-[#9c9c9d] text-[10px] mt-1 font-mono">10:45:24 AM</div>
                    </div>
                  </div>
                 </>
               ) : (
                  <div className="text-center text-[#9c9c9d] text-xs py-14 flex flex-col items-center">
                     <ShieldCheck size={28} className="text-white/20 mb-2" />
                     <p className="text-white font-medium">System in standby mode.</p>
                     <p className="text-[11px] text-[#9c9c9d] mt-0.5">Live events appear here when inspecting.</p>
                  </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
