import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
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
  }, [activeProjectId]);

  const handleSave = async () => {
    try {
      await api.projects.updateFilterNodes(activeProjectId || 'default_project', nodes);
      toast.success("Pipeline saved successfully!");
    } catch (error) {
      console.error("Failed to save pipeline:", error);
      toast.error("Failed to save Pipeline.");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-7 h-7 border-2 border-[#ff4d40] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex justify-between items-center bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Pre-processing Pipeline</h2>
          <p className="text-sm text-[#9c9c9d] mt-1">Configure computer vision spatial filters, thresholding and ROI before AI model inference</p>
        </div>
        <button onClick={handleSave} className="keycap-btn-primary">
          <Save size={16} />
          <span>Save Pipeline</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Top/Left: Node Graph & Tuning */}
        <div className="col-span-1 lg:col-span-1 space-y-5">
          <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/[0.08]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white flex items-center text-xs uppercase tracking-wider">
                <Layers size={16} className="mr-2 text-[#ff6b4a]" /> 
                Pipeline Nodes
              </h3>
              <button 
                onClick={() => setNodes([...nodes, { id: Date.now(), type: 'New Filter', active: true, params: {} }])} 
                className="text-[#ffb347] hover:text-white p-1 hover:bg-white/[0.08] rounded-md transition"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <div className="space-y-2.5 relative">
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-white/[0.08] z-0"></div>
              {nodes.map((node: any) => (
                <div 
                  key={node.id} 
                  onClick={() => setSelectedNode(node)}
                  className={`relative z-10 flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedNode?.id === node.id 
                      ? 'border-[#ff6b4a]/60 bg-[#ff2f3a]/15 text-[#ffb347] shadow-[0_0_15px_rgba(255,47,58,0.2)]' 
                      : 'border-white/[0.08] bg-[#12141a]/60 hover:bg-[#12141a] hover:border-white/20 text-[#d1d1d2]'
                  }`}
                >
                  <div className="mr-3">
                    <input 
                      type="checkbox" 
                      checked={node.active} 
                      onChange={() => handleNodeToggle(node.id)} 
                      className="rounded text-[#ff4d40] focus:ring-[#ff6b4a]/30 w-4 h-4 bg-[#12141a] border-white/20" 
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex-1 font-semibold text-xs">{node.type}</div>
                  <Filter size={14} className="text-[#9c9c9d]" />
                </div>
              ))}
              {nodes.length === 0 && (
                <div className="text-xs text-[#9c9c9d] text-center py-4 relative z-10 bg-transparent">No nodes defined</div>
              )}
            </div>
            <button 
              onClick={() => setNodes([...nodes, { id: Date.now(), type: 'New Filter', active: true, params: {} }])}
              className="w-full mt-4 py-2 border border-dashed border-white/20 rounded-xl text-xs font-semibold text-[#9c9c9d] hover:text-[#ffb347] hover:border-[#ff6b4a]/50 hover:bg-white/[0.03] transition"
            >
              + Add Filter Node
            </button>
          </div>

          {selectedNode && (
            <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/[0.08]">
              <h3 className="font-bold text-white mb-4 flex items-center text-xs uppercase tracking-wider">
                <Sliders size={16} className="mr-2 text-[#ffb347]" /> 
                {selectedNode.type} Params
              </h3>
              
              {Object.keys(selectedNode.params).length > 0 ? (
                <div className="space-y-3.5">
                  {Object.entries(selectedNode.params).map(([key, val]) => (
                    <div key={key}>
                      <label className="block text-[11px] font-semibold text-[#9c9c9d] mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                      <input 
                        type="number" 
                        value={val as number} 
                        onChange={(e) => handleParamChange(key, e.target.value)} 
                        className="w-full px-3 py-1.5 bg-[#12141a] border border-white/[0.1] rounded-lg text-xs text-white focus:border-[#ff6b4a]/60 outline-none font-mono" 
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-[#9c9c9d] italic text-center py-4">No parameters for this filter.</div>
              )}
            </div>
          )}
        </div>

        {/* Right: Split View & ROI */}
        <div className="col-span-1 lg:col-span-3 space-y-6">
          <div className="bg-[#050608] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/[0.1] h-[500px] flex flex-col relative">
            <div className="flex justify-between items-center bg-[#0d0e12]/90 text-white p-3.5 backdrop-blur-md z-20 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2 text-xs font-medium">
                <Eye size={16} className="text-[#ff6b4a]" />
                <span>Before / After Split Inspector</span>
              </div>
              <button className="keycap-btn-dark text-xs py-1.5 px-3">
                <MousePointer2 size={13} />
                <span>Draw ROI Polygon</span>
              </button>
            </div>
            
            <div className="flex-1 relative flex">
              {/* Left Side (Raw) */}
              <div className="w-1/2 h-full bg-[#0a0c10] relative flex items-center justify-center overflow-hidden border-r-2 border-white/20">
                <span className="absolute bottom-4 left-4 bg-[#0d0e12]/80 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-md border border-white/10 font-mono font-medium">Raw Input</span>
                <div className="w-48 h-48 rounded-full border-4 border-white/15 bg-white/[0.02]"></div>
              </div>
              
              {/* Right Side (Filtered) */}
              <div className="w-1/2 h-full bg-[#050608] relative flex items-center justify-center overflow-hidden">
                 <span className="absolute bottom-4 right-4 bg-[#0d0e12]/80 backdrop-blur-md text-[#ffcca0] text-[11px] px-2.5 py-1 rounded-md border border-[#ff6b4a]/30 font-mono font-medium">Filtered Output</span>
                 <div className="w-48 h-48 rounded-full border-4 border-[#ff4d40] bg-[#ff2f3a]/10 shadow-[0_0_30px_rgba(255,47,58,0.35)] flex items-center justify-center">
                   <div className="w-24 h-24 border-2 border-[#ffb347] rounded-full"></div>
                 </div>
              </div>
              
              {/* Split Dragger */}
              <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-white/80 cursor-col-resize -translate-x-1/2 z-10 flex items-center justify-center hover:w-1.5 transition-all">
                <div className="w-6 h-8 bg-[#e6e6e6] text-[#2f3031] rounded-md shadow-lg flex items-center justify-center border border-black/40">
                  <MoveRight size={13} className="-rotate-90" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#12141a]/80 border border-white/[0.08] rounded-2xl p-5 flex items-start space-x-3.5 shadow-sm">
             <div className="text-[#ff6b4a] mt-0.5"><Layers size={20} /></div>
             <div>
               <h4 className="text-sm font-bold text-white">Current Pipeline Runtime Performance</h4>
               <p className="text-xs text-[#9c9c9d] mt-1 leading-relaxed">
                 Processing takes approx. <strong className="text-white font-mono">12ms</strong> per frame. Pipeline is running at <strong className="text-[#ffb347] font-mono">60 FPS</strong> locally. 
                 Enabling additional morphological transforms will add ~4ms latency to edge inference.
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
