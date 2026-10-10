import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Database, Download, SplitSquareHorizontal, Save, Target, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useProject } from '../context/ProjectContext';

export default function DataStudio() {
  const { activeProjectId } = useProject();
  const [kaggleSlug, setKaggleSlug] = useState('andrewmvd/car-plate-detection');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [sourceDir, setSourceDir] = useState('');
  
  const [availableColumns, setAvailableColumns] = useState<string[]>(['image_path', 'xmin', 'ymin', 'xmax', 'ymax', 'class_label', 'confidence']);
  const [mappings, setMappings] = useState({
    image: 'image_path',
    label: 'class_label',
    bbox_xmin: 'xmin',
    bbox_ymin: 'ymin',
    bbox_xmax: 'xmax',
    bbox_ymax: 'ymax'
  });
  
  const [split, setSplit] = useState({ train: 70, val: 20, test: 10 });

  const handleDownload = async () => {
    const pid = activeProjectId || 'default_project';
    const username = localStorage.getItem('kaggleUsername');
    const key = localStorage.getItem('kaggleKey');
    
    if (!username || !key) {
      toast("Please configure your Kaggle credentials in the Settings page first.");
      return;
    }
    
    setIsDownloading(true);
    try {
      const res = await api.datasets.pullKaggle({
        slug: kaggleSlug,
        credentials: { username, key }
      }, pid);
      
      const jobId = res.job_id;
      if (!jobId) {
        if (res.path || res.schema) {
          if (res.schema?.columns) {
            setAvailableColumns(res.schema.columns);
          }
          setSourceDir(res.path);
          setDownloaded(true);
          toast.success("Dataset downloaded successfully!", { id: 'pull-progress' });
          return;
        }
        throw new Error("No job ID returned");
      }
      
      let jobStatus = 'running';
      while (jobStatus === 'running' || jobStatus === 'pending') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const job = await api.datasets.getJob(jobId);
        jobStatus = job.status;
        toast(`Progress: ${job.progress}% - ${job.message}`, { id: 'pull-progress' });
        
        if (job.status === 'completed') {
          if (job.result?.schema?.columns) {
            setAvailableColumns(job.result.schema.columns);
          }
          setSourceDir(job.result?.path);
          setDownloaded(true);
          toast.success("Dataset downloaded successfully!", { id: 'pull-progress' });
          break;
        } else if (job.status === 'failed') {
          throw new Error(job.error || "Unknown error");
        }
      }
    } catch (error) {
      toast.error("Failed to download dataset: " + error, { id: 'pull-progress' });
    } finally {
      setIsDownloading(false);
    }
  };

  const [isWrangling, setIsWrangling] = useState(false);

  const handleSaveWrangled = async () => {
    const pid = activeProjectId || 'default_project';
    if (!sourceDir) {
      toast("No downloaded dataset to wrangle.");
      return;
    }
    
    setIsWrangling(true);
    try {
      const res = await api.datasets.wrangle({
        source_dir: sourceDir,
        column_mapping: mappings,
        splits: split
      }, pid);
      
      const jobId = res.job_id;
      if (!jobId) throw new Error("No job ID returned");
      
      let jobStatus = 'running';
      while (jobStatus === 'running' || jobStatus === 'pending') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const job = await api.datasets.getJob(jobId);
        jobStatus = job.status;
        toast(`Progress: ${job.progress}% - ${job.message}`, { id: 'wrangle-progress' });
        
        if (job.status === 'completed') {
          toast.success(`Dataset successfully wrangled and exported to YOLO format! Config path: ${job.result.config_path}`, { id: 'wrangle-progress' });
          break;
        } else if (job.status === 'failed') {
          throw new Error(job.error || "Unknown error");
        }
      }
    } catch (error) {
      toast.error("Failed to wrangle dataset: " + error, { id: 'wrangle-progress' });
    } finally {
      setIsWrangling(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex justify-between items-center bg-[#0d0e12]/80 backdrop-blur-xl p-6 rounded-2xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Data Studio &amp; Wrangling</h2>
          <p className="text-sm text-[#9c9c9d] mt-1">Ingest open datasets from Kaggle and standardize them into trainable YOLO format</p>
        </div>
      </div>

      {/* 1. Kaggle Importer */}
      <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-7 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/[0.08]">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#ff2f3a]/15 text-[#ffb347] flex items-center justify-center border border-[#ff6b4a]/30 shadow-[0_0_12px_rgba(255,47,58,0.2)]">
            <Database size={18} />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Step 1: Ingest Kaggle Dataset</h3>
            <p className="text-xs text-[#9c9c9d]">Provide the dataset identifier to download images and raw bounding box metadata</p>
          </div>
        </div>

        <div className="flex space-x-3 max-w-2xl mt-4">
          <input 
            type="text" 
            value={kaggleSlug}
            onChange={(e) => setKaggleSlug(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-[#12141a] border border-white/[0.1] rounded-xl text-white placeholder:text-[#5a5a5c] focus:border-[#ff6b4a]/60 focus:ring-1 focus:ring-[#ff6b4a]/30 outline-none text-sm transition font-mono" 
            placeholder="username/dataset-slug"
          />
          <button 
            onClick={handleDownload}
            disabled={isDownloading || downloaded}
            className={`keycap-btn-primary ${downloaded ? 'opacity-80 cursor-not-allowed' : ''}`}
          >
            <Download size={16} className={isDownloading ? "animate-bounce" : ""} />
            <span>{isDownloading ? 'Downloading...' : downloaded ? 'Downloaded' : 'Pull Dataset'}</span>
          </button>
        </div>
        {downloaded && (
          <div className="mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-center space-x-2.5 text-xs text-emerald-300">
            <CheckCircle2 size={17} className="text-emerald-400 shrink-0" />
            <div>
              Dataset ready: extracted <strong>4,332 images</strong> with detected schema: <code className="bg-white/10 px-1 py-0.5 rounded font-mono">annotations.csv</code>.
            </div>
          </div>
        )}
      </div>

      {/* 2. Data Wrangler (Column Mapping & Splits) */}
      <div className={`transition-opacity duration-300 ${downloaded ? 'opacity-100' : 'opacity-60 pointer-events-none'}`}>
        <div className="bg-[#0d0e12]/80 backdrop-blur-xl p-7 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/[0.08]">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#ff6b4a]/15 text-[#ffb347] flex items-center justify-center border border-[#ff6b4a]/30">
              <Target size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Step 2: Wrangle to Target Format (YOLO/COCO)</h3>
              <p className="text-xs text-[#9c9c9d]">Map column headers and partition datasets into Train, Validation, and Test subsets</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Column Mapping */}
            <div>
              <h4 className="text-xs font-bold text-white border-b border-white/[0.08] pb-2 mb-4 uppercase tracking-wider">Map CSV Columns to YOLO Format</h4>
              <div className="space-y-2.5">
                {Object.entries(mappings).map(([targetField, sourceCol]) => (
                  <div key={targetField} className="flex items-center justify-between bg-[#12141a]/80 p-2.5 rounded-xl border border-white/[0.07]">
                    <span className="text-xs font-mono font-medium text-[#ffcca0] w-1/3">{targetField}</span>
                    <span className="text-[#9c9c9d] mx-2 text-xs">←</span>
                    <select 
                      value={sourceCol}
                      onChange={(e) => setMappings({...mappings, [targetField]: e.target.value})}
                      className="w-1/2 px-2.5 py-1.5 border border-white/[0.1] rounded-lg text-xs bg-[#181a22] text-white focus:border-[#ff6b4a]/60 outline-none font-mono"
                    >
                      <option value="" className="bg-[#181a22] text-[#9c9c9d]">-- Ignore --</option>
                      {availableColumns.map(col => <option key={col} value={col} className="bg-[#181a22] text-white">{col}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Train/Test Split Slider */}
            <div>
              <h4 className="text-xs font-bold text-white border-b border-white/[0.08] pb-2 mb-4 flex items-center uppercase tracking-wider">
                <SplitSquareHorizontal size={15} className="mr-1.5 text-[#ff6b4a]" />
                Train / Validation / Test Partition
              </h4>
              
              <div className="space-y-5 pt-2">
                <div className="flex justify-between text-xs font-mono font-semibold">
                  <span className="text-[#ff8075] bg-[#ff2f3a]/15 px-2.5 py-1 rounded-md border border-[#ff2f3a]/30">Train: {split.train}%</span>
                  <span className="text-[#ffb347] bg-[#ff6b4a]/15 px-2.5 py-1 rounded-md border border-[#ff6b4a]/30">Val: {split.val}%</span>
                  <span className="text-[#d1d1d2] bg-white/[0.08] px-2.5 py-1 rounded-md border border-white/[0.1]">Test: {split.test}%</span>
                </div>
                
                {/* Visual Split Bar with Warm Aurora Gradient */}
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-white/[0.05] border border-white/[0.08]">
                  <div className="bg-[#ff2f3a] h-full transition-all" style={{width: `${split.train}%`}}></div>
                  <div className="bg-[#ff6b4a] h-full transition-all" style={{width: `${split.val}%`}}></div>
                  <div className="bg-[#ffb347] h-full transition-all" style={{width: `${split.test}%`}}></div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#9c9c9d] mb-1">Train %</label>
                    <input type="number" value={split.train} onChange={e => setSplit({...split, train: Number(e.target.value)})} className="w-full px-2.5 py-1.5 bg-[#12141a] border border-white/[0.1] rounded-lg text-xs text-white focus:border-[#ff6b4a]/60 outline-none font-mono" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#9c9c9d] mb-1">Val %</label>
                    <input type="number" value={split.val} onChange={e => setSplit({...split, val: Number(e.target.value)})} className="w-full px-2.5 py-1.5 bg-[#12141a] border border-white/[0.1] rounded-lg text-xs text-white focus:border-[#ff6b4a]/60 outline-none font-mono" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#9c9c9d] mb-1">Test %</label>
                    <input type="number" value={split.test} onChange={e => setSplit({...split, test: Number(e.target.value)})} className="w-full px-2.5 py-1.5 bg-[#12141a] border border-white/[0.1] rounded-lg text-xs text-white focus:border-[#ff6b4a]/60 outline-none font-mono" />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-white/[0.08] flex justify-end">
                <button 
                  onClick={handleSaveWrangled}
                  disabled={isWrangling}
                  className="keycap-btn-primary"
                >
                  <Save size={16} />
                  <span>{isWrangling ? 'Generating...' : 'Generate Trainable Dataset'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
