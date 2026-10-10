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
  }, []);

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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      {/* Tolerance Band Editor */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center">
            <Sliders size={18} className="mr-2 text-blue-600" />
            Tolerance Band Editor
          </h3>
          <button onClick={() => setClasses([...classes, { id: Date.now().toString(), name: 'New Class', nominal: '0', upper: '+0', lower: '-0', unit: 'mm', colorCheck: false }])} className="text-xs text-blue-600 hover:text-blue-700 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition shadow-xs">
            + Add Class / Feature
          </button>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Target Feature</th>
                <th className="px-4 py-3">Nominal Value</th>
                <th className="px-4 py-3 text-emerald-700">Upper Tol (+)</th>
                <th className="px-4 py-3 text-rose-700">Lower Tol (-)</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3 text-center">Color Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classes.map((cls, idx) => (
                <tr key={cls.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <input type="text" value={cls.name} onChange={(e) => handleClassChange(idx, 'name', e.target.value)} className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="text" value={cls.nominal} onChange={(e) => handleClassChange(idx, 'nominal', e.target.value)} className="w-20 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="text" value={cls.upper} onChange={(e) => handleClassChange(idx, 'upper', e.target.value)} className="w-20 px-2.5 py-1 border border-emerald-200 rounded-lg text-xs text-emerald-800 bg-emerald-50/60 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-mono font-semibold" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="text" value={cls.lower} onChange={(e) => handleClassChange(idx, 'lower', e.target.value)} className="w-20 px-2.5 py-1 border border-rose-200 rounded-lg text-xs text-rose-800 bg-rose-50/60 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none font-mono font-semibold" />
                  </td>
                  <td className="px-4 py-3">
                    <select value={cls.unit} onChange={(e) => handleClassChange(idx, 'unit', e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium outline-none">
                      <option value="mm">mm</option>
                      <option value="deg">deg</option>
                      <option value="count">count</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input type="checkbox" checked={cls.colorCheck} onChange={(e) => handleClassChange(idx, 'colorCheck', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4 border-slate-300" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Color Validation Configurator */}
      <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80">
        <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center">
          <Palette size={18} className="mr-2 text-indigo-600" />
          Color Validation Configurator
        </h3>
        <p className="text-xs text-slate-500 mb-6">Define valid color spaces (HSV) for inspection components where pigment or material color is checked.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Target Feature</label>
              <select defaultValue="winding" className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white font-medium">
                <option value="winding">Winding (Copper)</option>
                <option value="stator">Stator (Steel)</option>
              </select>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium text-slate-600">
                  <span>Hue Range</span>
                  <span className="font-mono font-bold">10 - 25</span>
                </div>
                <div className="h-2 w-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 rounded-full relative">
                  <div className="absolute left-[10%] right-[75%] h-full bg-white/40 border-y-2 border-white"></div>
                  <div className="absolute left-[10%] w-3 h-3 bg-white border-2 border-slate-500 rounded-full -top-0.5 shadow-xs cursor-ew-resize -ml-1.5"></div>
                  <div className="absolute right-[75%] w-3 h-3 bg-white border-2 border-slate-500 rounded-full -top-0.5 shadow-xs cursor-ew-resize -mr-1.5"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-medium text-slate-600">
                  <span>Saturation Range</span>
                  <span className="font-mono font-bold">50 - 100%</span>
                </div>
                <div className="h-2 w-full bg-gradient-to-r from-slate-300 to-orange-500 rounded-full relative">
                  <div className="absolute left-[50%] right-[0%] h-full bg-white/40 border-y-2 border-white"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-medium text-slate-600">
                  <span>Value (Brightness) Range</span>
                  <span className="font-mono font-bold">40 - 100%</span>
                </div>
                <div className="h-2 w-full bg-gradient-to-r from-slate-900 to-slate-200 rounded-full relative">
                   <div className="absolute left-[40%] right-[0%] h-full bg-blue-500/40 border-y-2 border-blue-500"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center space-y-3 bg-white p-6 rounded-xl border border-slate-200/60 shadow-xs">
             <div className="w-24 h-24 rounded-full bg-[#B87333] shadow-inner border-4 border-slate-100 flex items-center justify-center text-white font-bold text-xs">
                Preview
             </div>
             <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                <CheckCircle size={14} className="text-emerald-600" />
                <span>Valid Copper Spec</span>
             </div>
          </div>
        </div>
      </div>

      <div className="pt-5 border-t border-slate-100 flex justify-end">
        <button type="button" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center space-x-2 shadow-xs transition font-semibold text-xs">
          <Save size={16} />
          <span>Save QA Tolerances</span>
        </button>
      </div>
    </div>
  );
}
