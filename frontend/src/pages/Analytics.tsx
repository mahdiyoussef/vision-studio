import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { BarChart3, TrendingUp, PieChart, AlertCircle, Calendar, ArrowUpRight } from 'lucide-react';
import { api } from '../services/api';
import { useProject } from '../context/ProjectContext';

export default function Analytics() {
  const { activeProjectId } = useProject();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const pid = activeProjectId || 'default_project';
    api.analytics.get(pid).then(setData).catch(console.error);
  }, [activeProjectId]);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Yield & Defect Analytics</h2>
          <p className="text-sm text-slate-500 mt-1">Track historical manufacturing performance and automated QA inspection yield</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl flex items-center space-x-2 text-sm transition font-medium shadow-xs">
            <Calendar size={16} />
            <span>Last 7 Days</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm transition font-semibold shadow-xs">
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Inspected</p>
            <h4 className="text-2xl font-bold text-slate-900 mt-0.5">{data.kpi.total_inspected.toLocaleString()}</h4>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overall Yield</p>
            <h4 className="text-2xl font-bold text-emerald-700 mt-0.5">{data.kpi.overall_yield}%</h4>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex items-center space-x-4">
          <div className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Defects</p>
            <h4 className="text-2xl font-bold text-rose-700 mt-0.5">{data.kpi.total_defects.toLocaleString()}</h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl">
            <PieChart size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">False Rejects</p>
            <h4 className="text-2xl font-bold text-indigo-700 mt-0.5">{data.kpi.false_rejects}%</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="col-span-2 bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Yield Rate Over Time</h3>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 flex items-center">
              Target: &gt;95% <ArrowUpRight size={14} className="ml-1" />
            </span>
          </div>
          <div className="h-64 flex items-end space-x-3 w-full pt-4">
            {data.daily_yields.map((val: number, idx: number) => (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
                <span className="text-xs font-mono font-semibold text-slate-600 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-100 px-1.5 py-0.5 rounded shadow-xs">{val}%</span>
                <div 
                  className={`w-full rounded-t-lg transition-all ${val > 96 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-rose-400 hover:bg-rose-500'}`} 
                  style={{ height: `${val}%` }}
                ></div>
                <span className="text-[11px] font-medium text-slate-500 mt-3">Day {idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pareto Chart / Defect Breakdown */}
        <div className="col-span-1 bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-6">Defect Pareto Breakdown</h3>
          <div className="space-y-5">
            {data.pareto.map((item: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-800">{item.name}</span>
                  <span className="text-slate-500 font-mono">{item.count} ({item.percent}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className={`${item.color} h-2 rounded-full transition-all`} style={{ width: `${item.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
