import React, { useState, useEffect } from 'react';
import { Activity, Target, Zap, Server, Calendar, ArrowUpRight, BarChart3, AlertCircle } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center py-24 text-[#9c9c9d]">
        <div className="w-8 h-8 border-2 border-[#ff4d40] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium">Loading analytics...</p>
      </div>
    );
  }

  if (data.error || !data.kpi) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-red-400">
        <AlertCircle className="w-8 h-8 mb-3" />
        <p className="text-sm font-medium">Failed to load analytics data.</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-xs underline">Refresh Page</button>
      </div>
    );
  }

  const kpi = data.kpi || {};
  const totalInferences = kpi.total_inferences ?? kpi.total_inspected ?? 0;
  const avgConfidence = kpi.avg_confidence ?? kpi.overall_yield ?? 0;
  const lowConfidenceCount = kpi.low_confidence_count ?? kpi.total_defects ?? 0;
  const activeLearningSynced = kpi.active_learning_synced ?? kpi.false_rejects ?? 0;

  const dailyInferences: number[] = data.daily_inferences ?? data.daily_yields ?? [];
  const classDistribution: any[] = data.class_distribution ?? data.pareto ?? [];
  const maxVal = dailyInferences.length > 0 ? Math.max(...dailyInferences, 1) : 1;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex justify-between items-center bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Vision Analytics</h2>
          <p className="text-sm text-[#9c9c9d] mt-1">Track historical inference volume, model performance, and class distribution.</p>
        </div>
        <div className="flex space-x-3">
          <button className="keycap-btn-dark">
            <Calendar size={16} />
            <span>Last 7 Days</span>
          </button>
          <button className="keycap-btn-primary">
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/[0.08] flex items-center space-x-4">
          <div className="p-3 bg-white/[0.06] text-white border border-white/10 rounded-xl">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9c9c9d]">Total Inferences</p>
            <h4 className="text-2xl font-bold font-mono text-white mt-0.5">{totalInferences.toLocaleString()}</h4>
          </div>
        </div>
        
        <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/[0.08] flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded-xl">
            <Target size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9c9c9d]">Avg Confidence</p>
            <h4 className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">{avgConfidence}%</h4>
          </div>
        </div>
        
        <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/[0.08] flex items-center space-x-4">
          <div className="p-3 bg-[#ffb347]/15 text-[#ffb347] border border-[#ffb347]/30 rounded-xl">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9c9c9d]">Low Confidence</p>
            <h4 className="text-2xl font-bold font-mono text-[#ffb347] mt-0.5">{lowConfidenceCount.toLocaleString()}</h4>
          </div>
        </div>

        <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/[0.08] flex items-center space-x-4">
          <div className="p-3 bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded-xl">
            <Server size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9c9c9d]">MLOps Synced</p>
            <h4 className="text-2xl font-bold font-mono text-blue-400 mt-0.5">{activeLearningSynced.toLocaleString()}</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="col-span-2 bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/[0.08]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Inference Volume Over Time</h3>
            <span className="text-xs font-mono font-medium text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/25 flex items-center">
              Load: Normal <ArrowUpRight size={14} className="ml-1" />
            </span>
          </div>
          <div className="h-64 flex items-end space-x-3 w-full pt-4">
            {dailyInferences.map((val: number, idx: number) => {
              const heightPercent = Math.min(100, Math.max(8, (val / maxVal) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
                  <span className="text-xs font-mono font-semibold text-white mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#12141a] border border-white/10 px-1.5 py-0.5 rounded shadow-sm">{val.toLocaleString()}</span>
                  <div 
                    className={`w-full rounded-t-lg transition-all bg-gradient-to-t from-blue-600 to-blue-400 hover:brightness-110 shadow-[0_0_15px_rgba(59,130,246,0.3)]`} 
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                  <span className="text-[11px] font-mono text-[#9c9c9d] mt-3">Day {idx + 1}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Class Distribution Breakdown */}
        <div className="col-span-1 bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/[0.08]">
          <div className="flex items-center space-x-2 mb-6">
            <BarChart3 className="text-[#9c9c9d]" size={20} />
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Class Distribution</h3>
          </div>
          
          <div className="space-y-5">
            {classDistribution.map((item: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-white">{item.name}</span>
                  <span className="text-[#9c9c9d] font-mono">{(item.count ?? 0).toLocaleString()} ({item.percent}%)</span>
                </div>
                <div className="w-full bg-white/[0.06] rounded-full h-2 overflow-hidden border border-white/[0.06]">
                  <div className={`${item.color || 'bg-blue-500'} h-2 rounded-full transition-all`} style={{ width: `${item.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
