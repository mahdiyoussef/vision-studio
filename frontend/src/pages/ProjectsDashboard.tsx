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
        <div className="flex items-center space-x-3 text-slate-500 bg-white px-5 py-3 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Loading projects...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-blue-50 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Projects Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">Manage and monitor inspection sessions and automated metrology pipelines</p>
        </div>
        <button 
          onClick={() => setShowWizard(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-xs transition-colors font-medium text-sm"
        >
          <Plus size={18} />
          <span>New Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xs border-2 border-dashed border-slate-200 p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <FolderKanban size={28} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No projects found</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">Create your first computer vision metrology project to begin automated QA inspection.</p>
          <button 
            onClick={() => setShowWizard(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl inline-flex items-center space-x-2 transition shadow-xs font-medium text-sm"
          >
            <Plus size={18} />
            <span>Create First Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => (
          <div key={p.id} className="bg-white rounded-3xl shadow-sm border border-blue-50/50 overflow-hidden hover:shadow-lg hover:border-blue-100 transition-all duration-300">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-slate-900 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => navigate(`/project/${p.id}`)}>
                  {p.name}
                </h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${p.status === 'Running' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                  {p.status}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-500 mb-5">
                <span className="font-medium bg-blue-50 px-2 py-0.5 rounded text-blue-600 border border-blue-100">Domain: {p.domain}</span>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-50/80 text-sm">
                <div className="flex items-center space-x-1.5">
                  <Activity size={16} className="text-slate-400" />
                  <span className="text-slate-500 text-xs">Yield:</span>
                  <span className="font-semibold text-slate-800 text-xs">{p.yield}</span>
                </div>
                <div className="flex space-x-2 text-slate-400">
                  <button onClick={(e) => handleToggle(p.id, e)} className="hover:text-blue-600 transition p-1 hover:bg-blue-50 rounded-lg" title="Start/Pause">
                    {p.status === 'Running' ? <Pause size={17} /> : <Play size={17} />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setDeleteProjectTarget(p.id); }} className="hover:text-rose-600 transition p-1 hover:bg-rose-50 rounded-lg" title="Delete">
                    <Trash2 size={17} />
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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-rose-100 flex justify-between items-center bg-rose-50/70">
          <h3 className="text-base font-semibold text-rose-900 flex items-center space-x-2">
            <Trash2 size={18} />
            <span>Confirm Deletion</span>
          </h3>
          <button onClick={onClose} className="text-rose-400 hover:text-rose-600 text-xl font-light leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            This action cannot be undone. This will permanently delete the project and remove all associated data.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Please type <strong className="text-rose-600">delete</strong> to confirm
            </label>
            <input 
              required 
              type="text" 
              value={inputValue} 
              onChange={e => setInputValue(e.target.value)} 
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none text-sm transition" 
              placeholder="delete" 
            />
          </div>
          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-50/80">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition text-sm font-medium">Cancel</button>
            <button 
              type="submit" 
              disabled={inputValue.toLowerCase() !== 'delete'}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl transition shadow-xs text-sm font-semibold"
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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
          <h3 className="text-base font-semibold text-slate-900">Create New Project</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-light leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Project Name</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition" placeholder="e.g. Engine Block QA" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition" rows={3} placeholder="Project objectives and inspection scope..."></textarea>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Base Domain Template</label>
            <select value={domain} onChange={e => setDomain(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition">
              <option value="stator">Stator Engine</option>
              <option value="chignon">Chignon Assembly</option>
              <option value="file">Cable Color</option>
              <option value="blank">Blank Custom Domain</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-50/80">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition text-sm font-medium">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-xs text-sm font-semibold">Create Project</button>
          </div>
        </form>
      </div>
    </div>
  );
}
