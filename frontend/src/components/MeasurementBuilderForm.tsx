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
        // If data is empty, set some defaults so it looks nice
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
  }, []);

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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      {/* Visual Measurement Rule Builder */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center">
            <Network size={18} className="mr-2 text-blue-600" />
            Measurement Geometric Rules
          </h3>
          <button onClick={() => setRules([...rules, { id: Date.now(), type: 'Distance', source: '', target: '', expected: '' }])} className="text-xs bg-blue-50 text-blue-600 border border-blue-200 font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-100 transition flex items-center shadow-xs">
            <Plus size={15} className="mr-1" /> Add Rule
          </button>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Source Anchor</th>
                <th className="px-4 py-3">Target Anchor</th>
                <th className="px-4 py-3">Expected Value</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.map((rule, idx) => (
                <tr key={rule.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <select value={rule.type} onChange={(e) => handleRuleChange(idx, 'type', e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 outline-none">
                      <option value="Distance">Distance</option>
                      <option value="Angle">Angle</option>
                      <option value="Area">Area</option>
                      <option value="Concentricity">Concentricity</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input type="text" value={rule.source} onChange={(e) => handleRuleChange(idx, 'source', e.target.value)} className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="text" value={rule.target} onChange={(e) => handleRuleChange(idx, 'target', e.target.value)} className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="text" value={rule.expected} onChange={(e) => handleRuleChange(idx, 'expected', e.target.value)} className="w-24 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setRules(rules.filter((_, i) => i !== idx))} className="text-rose-600 hover:text-rose-700 text-xs font-semibold hover:underline">Remove</button>
                  </td>
                </tr>
              ))}
              {rules.length === 0 && (
                 <tr><td colSpan={5} className="py-4 text-center text-slate-500 text-sm">No rules defined</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alignment Constraints & Blocker Family Configurator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80">
          <h4 className="font-bold text-slate-900 mb-1.5 text-xs uppercase tracking-wider">Alignment Constraints</h4>
          <p className="text-[11px] text-slate-500 mb-3">Enforce layout geometry for the chosen measurement anchor vector.</p>
          <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
            <option>Any Orientation (Default)</option>
            <option>Strictly Horizontal</option>
            <option>Strictly Vertical</option>
            <option>Parallel to Reference Line</option>
          </select>
        </div>
        
        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80">
          <h4 className="font-bold text-slate-900 mb-1.5 text-xs uppercase tracking-wider">Blocker Family Configurator</h4>
          <p className="text-[11px] text-slate-500 mb-3">Automatically invalidate QA measurements if obstructing items intersect the line of sight.</p>
          <div className="space-y-2 text-xs">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-300" />
              <span className="font-medium text-slate-700">Operator Hand</span>
            </label>
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-300" />
              <span className="font-medium text-slate-700">Debris / Foreign Material</span>
            </label>
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-300" />
              <span className="font-medium text-slate-700">High Contrast Shadows</span>
            </label>
          </div>
        </div>
      </div>

      {/* Calibration Method Switcher */}
      <div className="border-t border-slate-100 pt-6">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center">
          <Ruler size={18} className="mr-2 text-emerald-600" />
          Camera Calibration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Calibration Method</label>
              <select defaultValue="reference" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white font-medium">
                <option value="reference">Reference Object (Pixels-to-Metric)</option>
                <option value="intrinsics">Camera Intrinsics Matrix</option>
                <option value="manual">Manual Conversion Factor</option>
              </select>
            </div>
            
            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start space-x-3">
              <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <div className="text-xs text-amber-900 leading-relaxed">
                Active calibration: <strong className="font-mono">42.5 pixels / mm</strong>. Re-calibrate if camera working distance changes.
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col items-center justify-center text-center">
            <Maximize size={28} className="text-slate-400 mb-2" />
            <h4 className="text-white font-bold text-xs mb-1">Interactive Calibrator</h4>
            <p className="text-slate-400 text-[11px] mb-4">Click and drag over a known object on the live feed to auto-compute pixel scaling.</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs transition shadow-xs font-semibold">
              Launch Calibrator
            </button>
          </div>
        </div>
      </div>

      <div className="pt-5 border-t border-slate-100 flex justify-end">
        <button type="button" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center space-x-2 shadow-xs transition font-semibold text-xs">
          <Save size={16} />
          <span>Save Measurement Profile</span>
        </button>
      </div>
    </div>
  );
}
