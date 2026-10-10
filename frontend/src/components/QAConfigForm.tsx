import React, { useState, useEffect } from 'react';
import { Save, Sliders, Palette, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

export default function QAConfigForm({ projectId }: { projectId: string }) {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await api.projects.getQaConfig(projectId);
        setClasses(data);
      } catch (error) {
        console.error("Failed to load QA config:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [projectId]);

  const handleSave = async () => {
    try {
      await api.projects.updateQaConfig(projectId, classes);
      alert("QA Tolerances saved successfully!");
    } catch (error) {
      console.error("Failed to save QA config:", error);
      alert("Failed to save QA Tolerances.");
    }
  };

  const handleClassChange = (index: number, key: string, value: any) => {
    const newClasses = [...classes];
    newClasses[index][key] = value;
    setClasses(newClasses);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-6 h-6 border-2 border-[#ff4d40] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tolerance Band Editor */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-white flex items-center">
            <Sliders size={18} className="mr-2 text-[#ff6b4a]" />
            Tolerance Band Editor
          </h3>
          <button 
            onClick={() => setClasses([...classes, { id: Date.now().toString(), name: 'New Class', nominal: '0', upper: '+0', lower: '-0', unit: 'mm', colorCheck: false }])} 
            className="keycap-btn-dark text-xs py-1.5 px-3"
          >
            + Add Class / Feature
          </button>
        </div>

        <div className="bg-[#0d0e12]/80 border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] border-b border-white/[0.08] text-[#9c9c9d] font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Target Feature</th>
                <th className="px-4 py-3">Nominal Value</th>
                <th className="px-4 py-3 text-emerald-400">Upper Tol (+)</th>
                <th className="px-4 py-3 text-[#ff8075]">Lower Tol (-)</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3 text-center">Color Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {classes.map((cls, idx) => (
                <tr key={cls.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <input type="text" value={cls.name} onChange={(e) => handleClassChange(idx, 'name', e.target.value)} className="w-full px-2.5 py-1.5 bg-[#12141a] border border-white/[0.1] rounded-lg text-xs font-semibold text-white focus:border-[#ff6b4a]/60 outline-none" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="text" value={cls.nominal} onChange={(e) => handleClassChange(idx, 'nominal', e.target.value)} className="w-20 px-2.5 py-1.5 bg-[#12141a] border border-white/[0.1] rounded-lg text-xs text-white focus:border-[#ff6b4a]/60 outline-none font-mono" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="text" value={cls.upper} onChange={(e) => handleClassChange(idx, 'upper', e.target.value)} className="w-20 px-2.5 py-1.5 border border-emerald-500/30 rounded-lg text-xs text-emerald-400 bg-emerald-500/10 focus:border-emerald-400 outline-none font-mono font-semibold" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="text" value={cls.lower} onChange={(e) => handleClassChange(idx, 'lower', e.target.value)} className="w-20 px-2.5 py-1.5 border border-[#ff2f3a]/30 rounded-lg text-xs text-[#ff8075] bg-[#ff2f3a]/10 focus:border-[#ff4d40] outline-none font-mono font-semibold" />
                  </td>
                  <td className="px-4 py-3">
                    <select value={cls.unit} onChange={(e) => handleClassChange(idx, 'unit', e.target.value)} className="bg-[#12141a] border border-white/[0.1] rounded-lg px-2 py-1.5 text-xs text-white outline-none">
                      <option value="mm" className="bg-[#12141a]">mm</option>
                      <option value="deg" className="bg-[#12141a]">deg</option>
                      <option value="count" className="bg-[#12141a]">count</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input type="checkbox" checked={cls.colorCheck} onChange={(e) => handleClassChange(idx, 'colorCheck', e.target.checked)} className="rounded text-[#ff4d40] focus:ring-[#ff6b4a]/30 cursor-pointer w-4 h-4 bg-[#12141a] border-white/20" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Color Validation Configurator */}
      <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
        <h3 className="text-base font-bold text-white mb-1 flex items-center">
          <Palette size={18} className="mr-2 text-[#ffb347]" />
          Color Validation Configurator
        </h3>
        <p className="text-xs text-[#9c9c9d] mb-6">Define valid color spaces (HSV) for inspection components where pigment or material color is checked.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#9c9c9d] mb-1.5 uppercase tracking-wider">Target Feature</label>
              <select defaultValue="winding" className="w-full px-3.5 py-2 border border-white/[0.1] rounded-xl text-xs focus:border-[#ff6b4a]/60 outline-none bg-[#12141a] text-white font-medium">
                <option value="winding" className="bg-[#12141a]">Winding (Copper)</option>
                <option value="stator" className="bg-[#12141a]">Stator (Steel)</option>
              </select>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium text-[#9c9c9d]">
                  <span>Hue Range</span>
                  <span className="font-mono font-bold text-[#ffcca0]">10 - 25</span>
                </div>
                <div className="h-2 w-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 rounded-full relative">
                  <div className="absolute left-[10%] right-[75%] h-full bg-white/40 border-y-2 border-white"></div>
                  <div className="absolute left-[10%] w-3 h-3 bg-white border-2 border-[#ff2f3a] rounded-full -top-0.5 shadow-sm cursor-ew-resize -ml-1.5"></div>
                  <div className="absolute right-[75%] w-3 h-3 bg-white border-2 border-[#ff2f3a] rounded-full -top-0.5 shadow-sm cursor-ew-resize -mr-1.5"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-medium text-[#9c9c9d]">
                  <span>Saturation Range</span>
                  <span className="font-mono font-bold text-[#ffcca0]">50 - 100%</span>
                </div>
                <div className="h-2 w-full bg-gradient-to-r from-white/20 to-orange-500 rounded-full relative">
                  <div className="absolute left-[50%] right-[0%] h-full bg-white/40 border-y-2 border-white"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-medium text-[#9c9c9d]">
                  <span>Value (Brightness) Range</span>
                  <span className="font-mono font-bold text-[#ffcca0]">40 - 100%</span>
                </div>
                <div className="h-2 w-full bg-gradient-to-r from-black to-white/80 rounded-full relative">
                   <div className="absolute left-[40%] right-[0%] h-full bg-[#ff4d40]/40 border-y-2 border-[#ff4d40]"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center space-y-3 bg-[#12141a]/80 p-6 rounded-xl border border-white/[0.08] shadow-inner">
             <div className="w-24 h-24 rounded-full bg-[#B87333] shadow-[0_0_24px_rgba(184,115,51,0.5)] border-4 border-white/20 flex items-center justify-center text-white font-bold text-xs font-mono">
                Preview
             </div>
             <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/25">
                <CheckCircle size={14} className="text-emerald-400" />
                <span>Valid Copper Spec</span>
             </div>
          </div>
        </div>
      </div>

      <div className="pt-5 border-t border-white/[0.08] flex justify-end">
        <button type="button" onClick={handleSave} className="keycap-btn-primary">
          <Save size={16} />
          <span>Save QA Tolerances</span>
        </button>
      </div>
    </div>
  );
}
