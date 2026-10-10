import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
//, { useState, useEffect } from 'react';
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
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium">Loading project details...</p>
      </div>
    );
  }
  if (!project) return <div className="p-8 max-w-5xl mx-auto text-rose-600 bg-white rounded-2xl border border-rose-100">Project not found.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <Link to="/" className="p-2.5 bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-slate-200/60 transition-colors shadow-xs">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Project Details: {project.name}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{project.description || "Configure domain rules and camera hardware settings"}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="flex border-b border-slate-100 px-3 pt-2 bg-slate-50/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-5 py-3.5 text-sm font-medium transition-colors rounded-t-xl ${
                activeTab === tab.id 
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-white font-semibold shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
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
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Domain Name</label>
          <input type="text" value={formData.domain_name} onChange={e => setFormData({...formData, domain_name: e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Model Type</label>
          <select value={formData.model_type} onChange={e => setFormData({...formData, model_type: e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition">
            <option value="yolo">YOLOv8 Object Detection</option>
            <option value="unet">UNet Segmentation</option>
            <option value="resnet">ResNet Classification</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Model Weights Path</label>
        <div className="flex space-x-2">
          <input type="text" value={formData.model_weights_path} onChange={e => setFormData({...formData, model_weights_path: e.target.value})} className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition" />
          <button type="button" className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl border border-slate-200 transition text-sm font-medium">Browse</button>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-800 mb-3 mt-6 border-b border-slate-100 pb-2 uppercase tracking-wider">Expected Counts (Optional)</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <input type="text" defaultValue="stator" className="w-1/3 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="Class name" />
            <span className="text-slate-400">=</span>
            <input type="number" defaultValue="1" className="w-24 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="Count" />
            <button type="button" className="text-rose-500 hover:text-rose-700 text-sm font-medium">Remove</button>
          </div>
          <button type="button" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">+ Add expected count</button>
        </div>
      </div>

      <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
        <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center space-x-2 shadow-xs transition font-semibold text-sm">
          <Save size={17} />
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
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Camera Protocol</label>
        <select value={camProtocol} onChange={e => setCamProtocol(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition">
          <option value="uvc">UVC (USB Webcams)</option>
          <option value="rtsp">RTSP (Network Cameras)</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Target FPS</label>
          <input type="number" defaultValue="30" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Resolution</label>
          <select defaultValue="1080p" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm">
            <option value="720p">1280x720 (720p)</option>
            <option value="1080p">1920x1080 (1080p)</option>
            <option value="4k">3840x2160 (4K)</option>
            <option value="max">Max Supported</option>
          </select>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-800 mb-3 mt-6 border-b border-slate-100 pb-2 uppercase tracking-wider">Hardware Triggers</h4>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-300" />
            <span className="text-sm font-medium text-slate-700">Enable Hardware Trigger (GPIO)</span>
          </label>
          <div className="pl-7 grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Trigger Pin</label>
                <input type="text" defaultValue="PIN_0" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm" />
             </div>
             <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Delay (ms)</label>
                <input type="number" defaultValue="0" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm" />
             </div>
          </div>
        </div>
      </div>

      <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
        <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center space-x-2 shadow-xs transition font-semibold text-sm">
          <Save size={17} />
          <span>Save Camera Config</span>
        </button>
      </div>
    </form>
  );
}
