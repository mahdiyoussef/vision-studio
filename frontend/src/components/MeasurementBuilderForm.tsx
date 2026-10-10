import React, { useState, useEffect } from 'react';
import { Plus, Ruler, Network, Save, Maximize, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function MeasurementBuilderForm({ projectId }: { projectId: string }) {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await api.projects.getMeasurements(projectId);
        if (data && data.length > 0) {
          setRules(data);
        } else {
          setRules([
            { id: 1, type: 'Distance', source: 'stator_center', target: 'outer_edge', expected: '15.0mm' },
            { id: 2, type: 'Angle', source: 'winding_start', target: 'winding_end', expected: '45deg' }
          ]);
        }
      } catch (error) {
        console.error("Failed to load measurements:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [projectId]);

  const handleSave = async () => {
    try {
      await api.projects.updateMeasurements(projectId, rules);
      alert("Measurement Profile saved successfully!");
    } catch (error) {
      console.error("Failed to save measurements:", error);
      alert("Failed to save Measurement Profile.");
    }
  };

  const handleRuleChange = (index: number, key: string, value: any) => {
    const newRules = [...rules];
    newRules[index][key] = value;
    setRules(newRules);
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
      {/* Visual Measurement Rule Builder */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-white flex items-center">
            <Network size={18} className="mr-2 text-[#ff6b4a]" />
            Measurement Geometric Rules
          </h3>
          <button 
            onClick={() => setRules([...rules, { id: Date.now(), type: 'Distance', source: '', target: '', expected: '' }])} 
            className="keycap-btn-dark text-xs py-1.5 px-3"
          >
            <Plus size={14} className="mr-1 text-[#ffb347]" /> Add Rule
          </button>
        </div>

        <div className="bg-[#0d0e12]/80 border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] border-b border-white/[0.08] text-[#9c9c9d] font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Source Anchor</th>
                <th className="px-4 py-3">Target Anchor</th>
                <th className="px-4 py-3">Expected Value</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {rules.map((rule, idx) => (
                <tr key={rule.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <select 
                      value={rule.type} 
                      onChange={(e) => handleRuleChange(idx, 'type', e.target.value)} 
                      className="bg-[#12141a] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white outline-none"
                    >
                      <option value="Distance" className="bg-[#12141a]">Distance</option>
                      <option value="Angle" className="bg-[#12141a]">Angle</option>
                      <option value="Area" className="bg-[#12141a]">Area</option>
                      <option value="Concentricity" className="bg-[#12141a]">Concentricity</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="text" 
                      value={rule.source} 
                      onChange={(e) => handleRuleChange(idx, 'source', e.target.value)} 
                      className="w-full px-2.5 py-1.5 bg-[#12141a] border border-white/[0.1] rounded-lg text-xs font-mono text-[#ffcca0] focus:border-[#ff6b4a]/60 outline-none" 
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="text" 
                      value={rule.target} 
                      onChange={(e) => handleRuleChange(idx, 'target', e.target.value)} 
                      className="w-full px-2.5 py-1.5 bg-[#12141a] border border-white/[0.1] rounded-lg text-xs font-mono text-[#ffcca0] focus:border-[#ff6b4a]/60 outline-none" 
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="text" 
                      value={rule.expected} 
                      onChange={(e) => handleRuleChange(idx, 'expected', e.target.value)} 
                      className="w-24 px-2.5 py-1.5 bg-[#12141a] border border-white/[0.1] rounded-lg text-xs font-mono font-semibold text-white focus:border-[#ff6b4a]/60 outline-none" 
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => setRules(rules.filter((_, i) => i !== idx))} 
                      className="text-[#ff4d40] hover:text-[#ff8075] text-xs font-semibold hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {rules.length === 0 && (
                 <tr><td colSpan={5} className="py-4 text-center text-[#9c9c9d] text-sm">No rules defined</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alignment Constraints & Blocker Family Configurator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-5 rounded-2xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
          <h4 className="font-bold text-white mb-1.5 text-xs uppercase tracking-wider">Alignment Constraints</h4>
          <p className="text-[11px] text-[#9c9c9d] mb-3">Enforce layout geometry for the chosen measurement anchor vector.</p>
          <select className="w-full px-3 py-2 bg-[#12141a] border border-white/[0.1] rounded-xl text-xs text-white focus:border-[#ff6b4a]/60 outline-none">
            <option className="bg-[#12141a]">Any Orientation (Default)</option>
            <option className="bg-[#12141a]">Strictly Horizontal</option>
            <option className="bg-[#12141a]">Strictly Vertical</option>
            <option className="bg-[#12141a]">Parallel to Reference Line</option>
          </select>
        </div>
        
        <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-5 rounded-2xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
          <h4 className="font-bold text-white mb-1.5 text-xs uppercase tracking-wider">Blocker Family Configurator</h4>
          <p className="text-[11px] text-[#9c9c9d] mb-3">Automatically invalidate QA measurements if obstructing items intersect the line of sight.</p>
          <div className="space-y-2 text-xs">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-[#ff4d40] focus:ring-[#ff6b4a]/30 w-4 h-4 bg-[#12141a] border-white/20" />
              <span className="font-medium text-white">Operator Hand</span>
            </label>
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-[#ff4d40] focus:ring-[#ff6b4a]/30 w-4 h-4 bg-[#12141a] border-white/20" />
              <span className="font-medium text-white">Debris / Foreign Material</span>
            </label>
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input type="checkbox" className="rounded text-[#ff4d40] focus:ring-[#ff6b4a]/30 w-4 h-4 bg-[#12141a] border-white/20" />
              <span className="font-medium text-[#9c9c9d]">High Contrast Shadows</span>
            </label>
          </div>
        </div>
      </div>

      {/* Calibration Method Switcher */}
      <div className="border-t border-white/[0.08] pt-6">
        <h3 className="text-base font-bold text-white mb-4 flex items-center">
          <Ruler size={18} className="mr-2 text-[#ffb347]" />
          Camera Calibration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#9c9c9d] mb-1.5 uppercase tracking-wider">Calibration Method</label>
              <select defaultValue="reference" className="w-full px-3.5 py-2.5 border border-white/[0.1] rounded-xl text-xs focus:border-[#ff6b4a]/60 outline-none bg-[#12141a] text-white font-medium">
                <option value="reference" className="bg-[#12141a]">Reference Object (Pixels-to-Metric)</option>
                <option value="intrinsics" className="bg-[#12141a]">Camera Intrinsics Matrix</option>
                <option value="manual" className="bg-[#12141a]">Manual Conversion Factor</option>
              </select>
            </div>
            
            <div className="p-4 bg-[#ff6b4a]/10 border border-[#ff6b4a]/25 rounded-2xl flex items-start space-x-3">
              <AlertCircle size={16} className="text-[#ffb347] mt-0.5 shrink-0" />
              <div className="text-xs text-[#ffcca0] leading-relaxed">
                Active calibration: <strong className="font-mono text-white">42.5 pixels / mm</strong>. Re-calibrate if camera working distance changes.
              </div>
            </div>
          </div>
          
          <div className="bg-[#050608] rounded-2xl border border-white/[0.1] p-5 flex flex-col items-center justify-center text-center shadow-[0_16px_40px_rgba(0,0,0,0.8)]">
            <Maximize size={28} className="text-white/25 mb-2" />
            <h4 className="text-white font-bold text-xs mb-1">Interactive Calibrator</h4>
            <p className="text-[#9c9c9d] text-[11px] mb-4">Click and drag over a known object on the live feed to auto-compute pixel scaling.</p>
            <button className="keycap-btn-primary text-xs py-2 px-4">
              Launch Calibrator
            </button>
          </div>
        </div>
      </div>

      <div className="pt-5 border-t border-white/[0.08] flex justify-end">
        <button type="button" onClick={handleSave} className="keycap-btn-primary">
          <Save size={16} />
          <span>Save Measurement Profile</span>
        </button>
      </div>
    </div>
  );
}
