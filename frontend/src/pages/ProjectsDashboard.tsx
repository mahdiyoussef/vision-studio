import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Play, Pause, Trash2, FolderKanban, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export default function ProjectsDashboard() {
  const navigate = useNavigate();
  const [showWizard, setShowWizard] = useState(false);
  const [deleteProjectTarget, setDeleteProjectTarget] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await api.projects.list();
      setProjects(data.map((p: any) => ({
        ...p,
        domain: p.domain || (p.description?.includes('plugin') ? 'Auto' : 'Custom'),
        status: p.status || 'Paused',
        yield: 'N/A'
      })));
    } catch (err: any) {
      console.error("Failed to load projects", err);
      toast.error(`Failed to load projects: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (newProjData: any) => {
    try {
      await api.projects.create({
        name: newProjData.name,
        description: newProjData.domain,
        domain_config: {
          domain_name: newProjData.domain,
          model_type: "yolo",
          camera_protocol: "uvc"
        }
      });
      loadProjects();
    } catch (err) {
      console.error("Failed to create project", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.projects.delete(id);
      toast.success("Project deleted successfully");
      loadProjects();
    } catch (err: any) {
      console.error("Failed to delete project", err);
      toast.error(`Failed to delete project: ${err.message}`);
    }
  };

  const handleToggle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await api.projects.toggleStatus(id);
      toast.success(`Project ${result.status === 'Running' ? 'started' : 'paused'}`);
      loadProjects();
    } catch (err: any) {
      console.error("Failed to toggle project status", err);
      toast.error(`Failed to toggle project: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3 text-[#9c9c9d] bg-[#0d0e12]/80 px-6 py-4 rounded-xl border border-white/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <div className="w-5 h-5 border-2 border-[#ff4d40] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Loading projects...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex justify-between items-center bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Projects Dashboard</h2>
          <p className="text-sm text-[#9c9c9d] mt-1">Manage and monitor inspection sessions and automated metrology pipelines</p>
        </div>
        <button 
          onClick={() => setShowWizard(true)}
          className="keycap-btn-primary"
        >
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-[#0d0e12]/70 backdrop-blur-xl rounded-2xl border-2 border-dashed border-white/[0.1] p-16 text-center shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
          <div className="w-14 h-14 rounded-2xl bg-[#ff2f3a]/15 text-[#ffb347] flex items-center justify-center mx-auto mb-4 border border-[#ff6b4a]/30 shadow-[0_0_20px_rgba(255,47,58,0.2)]">
            <FolderKanban size={28} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">No projects found</h3>
          <p className="text-sm text-[#9c9c9d] mb-6 max-w-sm mx-auto">Create your first computer vision metrology project to begin automated QA inspection.</p>
          <button 
            onClick={() => setShowWizard(true)}
            className="keycap-btn-primary"
          >
            <Plus size={16} />
            <span>Create First Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div 
              key={p.id} 
              className="bg-[#0d0e12]/80 backdrop-blur-xl rounded-2xl border border-white/[0.08] overflow-hidden hover:border-[#ff6b4a]/40 hover:shadow-[0_20px_48px_rgba(0,0,0,0.7),0_0_30px_rgba(255,47,58,0.12)] transition-all duration-300 group"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 
                    className="text-lg font-semibold text-white cursor-pointer group-hover:text-[#ffb347] transition-colors" 
                    onClick={() => navigate(`/project/${p.id}`)}
                  >
                    {p.name}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${
                    p.status === 'Running' 
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}>
                    {p.status}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 text-xs text-[#9c9c9d] mb-5">
                  <span className="font-mono bg-white/[0.05] px-2 py-0.5 rounded text-[#d1d1d2] border border-white/[0.08]">
                    Domain: {p.domain}
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] text-sm">
                  <div className="flex items-center space-x-1.5">
                    <Activity size={16} className="text-[#ff6b4a]" />
                    <span className="text-[#9c9c9d] text-xs">Yield:</span>
                    <span className="font-mono font-semibold text-white text-xs">{p.yield}</span>
                  </div>
                  <div className="flex space-x-2 text-[#9c9c9d]">
                    <button 
                      onClick={(e) => handleToggle(p.id, e)} 
                      className="hover:text-white transition p-1.5 hover:bg-white/[0.08] rounded-lg border border-transparent hover:border-white/10" 
                      title="Start/Pause"
                    >
                      {p.status === 'Running' ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDeleteProjectTarget(p.id); }} 
                      className="hover:text-[#ff4d40] transition p-1.5 hover:bg-[#ff2f3a]/15 rounded-lg border border-transparent hover:border-[#ff2f3a]/30" 
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showWizard && (
        <ProjectCreationWizard onClose={() => setShowWizard(false)} onCreate={handleCreate} />
      )}

      {deleteProjectTarget && (
        <DeleteConfirmationModal
          projectId={deleteProjectTarget}
          onClose={() => setDeleteProjectTarget(null)}
          onConfirm={(id) => {
             setDeleteProjectTarget(null);
             handleDelete(id);
          }}
        />
      )}
    </div>
  );
}

function DeleteConfirmationModal({ projectId, onClose, onConfirm }: { projectId: string, onClose: () => void, onConfirm: (id: string) => void }) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.toLowerCase() === 'delete') {
      onConfirm(projectId);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#07080a]/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d0e12] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.85)] w-full max-w-md overflow-hidden border border-white/[0.1]">
        <div className="px-6 py-4 border-b border-[#ff2f3a]/30 flex justify-between items-center bg-[#ff2f3a]/10">
          <h3 className="text-base font-semibold text-[#ff8075] flex items-center space-x-2">
            <Trash2 size={18} />
            <span>Confirm Deletion</span>
          </h3>
          <button onClick={onClose} className="text-[#9c9c9d] hover:text-white text-xl font-light leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-[#9c9c9d]">
            This action cannot be undone. This will permanently delete the project and remove all associated data.
          </p>
          <div>
            <label className="block text-xs font-semibold text-[#9c9c9d] mb-1.5 uppercase tracking-wider">
              Please type <strong className="text-[#ff4d40]">delete</strong> to confirm
            </label>
            <input 
              required 
              type="text" 
              value={inputValue} 
              onChange={e => setInputValue(e.target.value)} 
              className="w-full px-3.5 py-2.5 bg-[#12141a] border border-white/[0.1] rounded-xl text-white focus:border-[#ff4d40] focus:ring-1 focus:ring-[#ff4d40]/30 outline-none text-sm transition" 
              placeholder="delete" 
            />
          </div>
          <div className="pt-4 flex justify-end space-x-3 border-t border-white/[0.08]">
            <button type="button" onClick={onClose} className="keycap-btn-dark">Cancel</button>
            <button 
              type="submit" 
              disabled={inputValue.toLowerCase() !== 'delete'}
              className="keycap-btn-warm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Delete Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProjectCreationWizard({ onClose, onCreate }: { onClose: () => void, onCreate: (p: any) => void }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [domain, setDomain] = useState('stator');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      id: `proj_${Date.now()}`,
      name,
      domain,
      status: 'Paused',
      yield: 'N/A'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#07080a]/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d0e12] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.85)] w-full max-w-lg overflow-hidden border border-white/[0.1]">
        <div className="px-6 py-4 border-b border-white/[0.08] flex justify-between items-center bg-white/[0.02]">
          <h3 className="text-base font-semibold text-white">Create New Project</h3>
          <button onClick={onClose} className="text-[#9c9c9d] hover:text-white text-xl font-light leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#9c9c9d] mb-1.5 uppercase tracking-wider">Project Name</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3.5 py-2.5 bg-[#12141a] border border-white/[0.1] rounded-xl text-white focus:border-[#ff6b4a]/60 focus:ring-1 focus:ring-[#ff6b4a]/30 outline-none text-sm transition" placeholder="e.g. Engine Block QA" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#9c9c9d] mb-1.5 uppercase tracking-wider">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-3.5 py-2.5 bg-[#12141a] border border-white/[0.1] rounded-xl text-white focus:border-[#ff6b4a]/60 focus:ring-1 focus:ring-[#ff6b4a]/30 outline-none text-sm transition" rows={3} placeholder="Project objectives and inspection scope..."></textarea>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#9c9c9d] mb-1.5 uppercase tracking-wider">Base Domain Template</label>
            <select value={domain} onChange={e => setDomain(e.target.value)} className="w-full px-3.5 py-2.5 bg-[#12141a] border border-white/[0.1] rounded-xl text-white focus:border-[#ff6b4a]/60 focus:ring-1 focus:ring-[#ff6b4a]/30 outline-none text-sm transition">
              <option value="stator" className="bg-[#12141a] text-white">Stator Engine</option>
              <option value="chignon" className="bg-[#12141a] text-white">Chignon Assembly</option>
              <option value="file" className="bg-[#12141a] text-white">Cable Color</option>
              <option value="blank" className="bg-[#12141a] text-white">Blank Custom Domain</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end space-x-3 border-t border-white/[0.08]">
            <button type="button" onClick={onClose} className="keycap-btn-dark">Cancel</button>
            <button type="submit" className="keycap-btn-primary">Create Project</button>
          </div>
        </form>
      </div>
    </div>
  );
}
