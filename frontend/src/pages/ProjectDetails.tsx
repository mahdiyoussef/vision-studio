import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Settings, Video, Network, ShieldCheck } from 'lucide-react';
import MeasurementBuilderForm from '../components/MeasurementBuilderForm';
import QAConfigForm from '../components/QAConfigForm';
import { api } from '../services/api';

export default function ProjectDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('domain');
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.projects.get(id).then(data => {
        setProject(data);
        setLoading(false);
      }).catch(err => {
        console.error("Failed to load project", err);
        setLoading(false);
      });
    }
  }, [id]);

  const tabs = [
    { id: 'domain', label: 'Domain Config', icon: <Settings size={18} /> },
    { id: 'qa', label: 'QA & Tolerances', icon: <ShieldCheck size={18} /> },
    { id: 'measurement', label: 'Measurement Rules', icon: <Network size={18} /> },
    { id: 'camera', label: 'Camera & Hardware', icon: <Video size={18} /> },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#9c9c9d]">
        <div className="w-8 h-8 border-2 border-[#ff4d40] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium">Loading project details...</p>
      </div>
    );
  }
  if (!project) return <div className="p-8 max-w-5xl mx-auto text-[#ff8075] bg-[#0d0e12] rounded-2xl border border-[#ff2f3a]/30">Project not found.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex items-center space-x-4 bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]">
        <Link to="/" className="p-2.5 bg-[#12141a] text-[#9c9c9d] hover:text-white hover:bg-white/[0.06] rounded-xl border border-white/[0.08] transition-colors shadow-xs">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Project Details: {project.name}</h2>
          <p className="text-sm text-[#9c9c9d] mt-0.5">{project.description || "Configure domain rules and camera hardware settings"}</p>
        </div>
      </div>

      {/* Main Tabbed Panel */}
      <div className="bg-[#0d0e12]/80 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-white/[0.08] overflow-hidden">
        <div className="flex border-b border-white/[0.08] px-3 pt-2 bg-white/[0.02]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-5 py-3.5 text-sm font-medium transition-colors rounded-t-xl ${
                activeTab === tab.id 
                  ? 'border-b-2 border-[#ff4d40] text-[#ffb347] bg-white/[0.05] font-semibold' 
                  : 'text-[#9c9c9d] hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === 'domain' && <DomainConfigForm config={project.domain_config} />}
          {activeTab === 'qa' && <QAConfigForm projectId={id || ''} />}
          {activeTab === 'measurement' && <MeasurementBuilderForm projectId={id || ''} />}
          {activeTab === 'camera' && <CameraConfigForm config={project.domain_config} />}
        </div>
      </div>
    </div>
  );
}

function DomainConfigForm({ config }: { config: any }) {
  const [formData, setFormData] = useState({
    domain_name: config?.domain_name || 'custom_domain',
    model_type: config?.model_type || 'yolo',
    model_weights_path: config?.model_weights_path || ''
  });

  return (
    <form className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-[#9c9c9d] mb-1.5 uppercase tracking-wider">Domain Name</label>
          <input type="text" value={formData.domain_name} onChange={e => setFormData({...formData, domain_name: e.target.value})} className="w-full px-3.5 py-2.5 bg-[#12141a] border border-white/[0.1] rounded-xl text-white focus:border-[#ff6b4a]/60 focus:ring-1 focus:ring-[#ff6b4a]/30 outline-none text-sm transition" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#9c9c9d] mb-1.5 uppercase tracking-wider">Model Type</label>
          <select value={formData.model_type} onChange={e => setFormData({...formData, model_type: e.target.value})} className="w-full px-3.5 py-2.5 bg-[#12141a] border border-white/[0.1] rounded-xl text-white focus:border-[#ff6b4a]/60 focus:ring-1 focus:ring-[#ff6b4a]/30 outline-none text-sm transition">
            <option value="yolo" className="bg-[#12141a] text-white">YOLOv8 Object Detection</option>
            <option value="unet" className="bg-[#12141a] text-white">UNet Segmentation</option>
            <option value="resnet" className="bg-[#12141a] text-white">ResNet Classification</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#9c9c9d] mb-1.5 uppercase tracking-wider">Model Weights Path</label>
        <div className="flex space-x-2">
          <input type="text" value={formData.model_weights_path} onChange={e => setFormData({...formData, model_weights_path: e.target.value})} className="flex-1 px-3.5 py-2.5 bg-[#12141a] border border-white/[0.1] rounded-xl text-white focus:border-[#ff6b4a]/60 focus:ring-1 focus:ring-[#ff6b4a]/30 outline-none text-sm transition font-mono" />
          <button type="button" className="keycap-btn-dark">Browse</button>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-white mb-3 mt-6 border-b border-white/[0.08] pb-2 uppercase tracking-wider">Expected Counts (Optional)</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <input type="text" defaultValue="stator" className="w-1/3 px-3.5 py-2 bg-[#12141a] border border-white/[0.1] rounded-xl text-sm text-white focus:border-[#ff6b4a]/60 outline-none" placeholder="Class name" />
            <span className="text-[#9c9c9d]">=</span>
            <input type="number" defaultValue="1" className="w-24 px-3.5 py-2 bg-[#12141a] border border-white/[0.1] rounded-xl text-sm text-white focus:border-[#ff6b4a]/60 outline-none font-mono" placeholder="Count" />
            <button type="button" className="text-[#ff4d40] hover:text-[#ff8075] text-sm font-medium">Remove</button>
          </div>
          <button type="button" className="text-sm text-[#ffb347] hover:text-white font-semibold transition">+ Add expected count</button>
        </div>
      </div>

      <div className="pt-6 mt-6 border-t border-white/[0.08] flex justify-end">
        <button type="button" className="keycap-btn-primary">
          <Save size={16} />
          <span>Save Configuration</span>
        </button>
      </div>
    </form>
  );
}

function CameraConfigForm({ config }: { config: any }) {
  const [camProtocol, setCamProtocol] = useState(config?.camera_protocol || 'uvc');

  return (
    <form className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-xs font-semibold text-[#9c9c9d] mb-1.5 uppercase tracking-wider">Camera Protocol</label>
        <select value={camProtocol} onChange={e => setCamProtocol(e.target.value)} className="w-full px-3.5 py-2.5 bg-[#12141a] border border-white/[0.1] rounded-xl text-white focus:border-[#ff6b4a]/60 outline-none text-sm transition">
          <option value="uvc" className="bg-[#12141a] text-white">UVC (USB Webcams)</option>
          <option value="rtsp" className="bg-[#12141a] text-white">RTSP (Network Cameras)</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-[#9c9c9d] mb-1.5 uppercase tracking-wider">Target FPS</label>
          <input type="number" defaultValue="30" className="w-full px-3.5 py-2.5 bg-[#12141a] border border-white/[0.1] rounded-xl text-white focus:border-[#ff6b4a]/60 outline-none text-sm font-mono" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#9c9c9d] mb-1.5 uppercase tracking-wider">Resolution</label>
          <select defaultValue="1080p" className="w-full px-3.5 py-2.5 bg-[#12141a] border border-white/[0.1] rounded-xl text-white focus:border-[#ff6b4a]/60 outline-none text-sm">
            <option value="720p" className="bg-[#12141a] text-white">1280x720 (720p)</option>
            <option value="1080p" className="bg-[#12141a] text-white">1920x1080 (1080p)</option>
            <option value="4k" className="bg-[#12141a] text-white">3840x2160 (4K)</option>
            <option value="max" className="bg-[#12141a] text-white">Max Supported</option>
          </select>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-white mb-3 mt-6 border-b border-white/[0.08] pb-2 uppercase tracking-wider">Hardware Triggers</h4>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded text-[#ff4d40] focus:ring-[#ff6b4a]/30 w-4 h-4 bg-[#12141a] border-white/20" />
            <span className="text-sm font-medium text-white">Enable Hardware Trigger (GPIO)</span>
          </label>
          <div className="pl-7 grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-medium text-[#9c9c9d] mb-1">Trigger Pin</label>
                <input type="text" defaultValue="PIN_0" className="w-full px-3 py-2 bg-[#12141a] border border-white/[0.1] rounded-xl text-white focus:border-[#ff6b4a]/60 outline-none text-sm font-mono" />
             </div>
             <div>
                <label className="block text-xs font-medium text-[#9c9c9d] mb-1">Delay (ms)</label>
                <input type="number" defaultValue="0" className="w-full px-3 py-2 bg-[#12141a] border border-white/[0.1] rounded-xl text-white focus:border-[#ff6b4a]/60 outline-none text-sm font-mono" />
             </div>
          </div>
        </div>
      </div>

      <div className="pt-6 mt-6 border-t border-white/[0.08] flex justify-end">
        <button type="button" className="keycap-btn-primary">
          <Save size={16} />
          <span>Save Camera Config</span>
        </button>
      </div>
    </form>
  );
}
