import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
//, { useState, useEffect } from 'react';
import { Filter, Sliders, Layers, Eye, MoveRight, Plus, Save, MousePointer2 } from 'lucide-react';
import { api } from '../services/api';
import { useProject } from '../context/ProjectContext';

export default function FilterPipeline() {
  const { activeProjectId } = useProject();
  const [nodes, setNodes] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await api.projects.getFilterNodes(activeProjectId || 'default_project');
        if (data && data.length > 0) {
          setNodes(data);
          setSelectedNode(data[0]);
        }
      } catch (error) {
        console.error("Failed to load filter nodes:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    try {
      await api.projects.updateFilterNodes(activeProjectId || 'default_project', nodes);
      toast("Pipeline saved successfully!");
    } catch (error) {
      console.error("Failed to save pipeline:", error);
      toast("Failed to save Pipeline.");
    }
  };

  const handleNodeToggle = (id: number) => {
    setNodes(nodes.map((n: any) => n.id === id ? { ...n, active: !n.active } : n));
  };

  const handleParamChange = (key: string, val: string) => {
    if (!selectedNode) return;
    const newNodes = nodes.map((n: any) => {
      if (n.id === selectedNode.id) {
        const updatedNode = { ...n, params: { ...n.params, [key]: parseFloat(val) } };
        setSelectedNode(updatedNode);
        return updatedNode;
      }
      return n;
    });
    setNodes(newNodes);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Pre-processing Pipeline</h2>
          <p className="text-sm text-slate-500 mt-1">Configure computer vision spatial filters, thresholding and ROI before AI model inference</p>
        </div>
        <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 text-sm transition font-semibold shadow-xs">
          <Save size={16} />
          <span>Save Pipeline</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Top/Left: Node Graph & Tuning */}
        <div className="col-span-1 lg:col-span-1 space-y-5">
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 flex items-center text-xs uppercase tracking-wider">
                <Layers size={16} className="mr-2 text-blue-600" /> 
                Pipeline Nodes
              </h3>
              <button onClick={() => setNodes([...nodes, { id: Date.now(), type: 'New Filter', active: true, params: {} }])} className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded-md transition"><Plus size={16} /></button>
            </div>
            
            <div className="space-y-2.5 relative">
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-200 z-0"></div>
              {nodes.map((node: any) => (
                <div 
                  key={node.id} 
                  onClick={() => setSelectedNode(node)}
                  className={`relative z-10 flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedNode?.id === node.id ? 'border-blue-500 bg-blue-50/70 shadow-xs' : 'border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="mr-3">
                    <input 
                      type="checkbox" 
                      checked={node.active} 
                      onChange={() => handleNodeToggle(node.id)} 
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-300" 
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex-1 font-semibold text-xs text-slate-800">{node.type}</div>
                  <Filter size={14} className="text-slate-400" />
                </div>
              ))}
              {nodes.length === 0 && (
                <div className="text-xs text-slate-500 text-center py-4 relative z-10 bg-white">No nodes defined</div>
              )}
            </div>
            <button className="w-full mt-4 py-2 border border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition">
              + Add Filter Node
            </button>
          </div>

          {selectedNode && (
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center text-xs uppercase tracking-wider">
                <Sliders size={16} className="mr-2 text-indigo-600" /> 
                {selectedNode.type} Params
              </h3>
              
              {Object.keys(selectedNode.params).length > 0 ? (
                <div className="space-y-3.5">
                  {Object.entries(selectedNode.params).map(([key, val]) => (
                    <div key={key}>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                      <input type="number" value={val as number} onChange={(e) => handleParamChange(key, e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic text-center py-4">No parameters for this filter.</div>
              )}
            </div>
          )}
        </div>

        {/* Right: Split View & ROI */}
        <div className="col-span-1 lg:col-span-3 space-y-6">
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xs border border-slate-800 h-[500px] flex flex-col relative">
            <div className="flex justify-between items-center bg-slate-900/80 text-white p-3.5 backdrop-blur-md z-20 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-medium">
                <Eye size={16} className="text-blue-400" />
                <span>Before / After Split Inspector</span>
              </div>
              <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs transition border border-slate-700 font-medium">
                <MousePointer2 size={13} />
                <span>Draw ROI Polygon</span>
              </button>
            </div>
            
            <div className="flex-1 relative flex">
              {/* Left Side (Raw) */}
              <div className="w-1/2 h-full bg-slate-800 relative flex items-center justify-center overflow-hidden border-r-2 border-white/20">
                <div className="absolute inset-0 bg-slate-850"></div>
                <span className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-md border border-slate-700 font-medium">Raw Input</span>
                <div className="w-48 h-48 rounded-full border-4 border-slate-600 bg-slate-700/50 opacity-60"></div>
              </div>
              
              {/* Right Side (Filtered) */}
              <div className="w-1/2 h-full bg-slate-900 relative flex items-center justify-center overflow-hidden">
                 <div className="absolute inset-0 bg-slate-950"></div>
                 <span className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-md border border-slate-700 font-medium">Filtered Output</span>
                 <div className="w-48 h-48 rounded-full border-4 border-blue-500 bg-slate-800 shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center">
                   <div className="w-24 h-24 border-2 border-blue-400 rounded-full"></div>
                 </div>
              </div>
              
              {/* Split Dragger */}
              <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-white/80 cursor-col-resize -translate-x-1/2 z-10 flex items-center justify-center hover:w-1.5 transition-all">
                <div className="w-6 h-8 bg-white rounded-md shadow-md flex items-center justify-center border border-slate-200">
                  <MoveRight size={13} className="text-slate-800 -rotate-90" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50/70 border border-blue-200/70 rounded-2xl p-5 flex items-start space-x-3.5">
             <div className="text-blue-600 mt-0.5"><Layers size={20} /></div>
             <div>
               <h4 className="text-sm font-bold text-slate-900">Current Pipeline Runtime Performance</h4>
               <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                 Processing takes approx. <strong className="text-slate-800">12ms</strong> per frame. Pipeline is running at <strong className="text-slate-800">60 FPS</strong> locally. 
                 Enabling additional morphological transforms will add ~4ms latency to edge inference.
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
