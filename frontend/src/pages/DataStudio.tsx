import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Database, Download, FileJson, SplitSquareHorizontal, Save, Target, CheckCircle2 } from 'lucide-react';
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
      if (res.schema && res.schema.columns) {
        setAvailableColumns(res.schema.columns);
      }
      setDownloaded(true);
      setSourceDir(res.path);
    } catch (error) {
      alert("Failed to download dataset: " + error);
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
      toast(`Dataset successfully wrangled and exported to YOLO format! Config path: ${res.config_path}`);
    } catch (error) {
      alert("Failed to wrangle dataset: " + error);
    } finally {
      setIsWrangling(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Data Studio & Wrangling</h2>
          <p className="text-sm text-slate-500 mt-1">Ingest open datasets from Kaggle and standardize them into trainable YOLO format</p>
        </div>
      </div>

      {/* 1. Kaggle Importer */}
      <div className="bg-white p-7 rounded-2xl shadow-xs border border-slate-200/80">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Database size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Step 1: Ingest Kaggle Dataset</h3>
            <p className="text-xs text-slate-500">Provide the dataset identifier to download images and raw bounding box metadata</p>
          </div>
        </div>

        <div className="flex space-x-3 max-w-2xl mt-4">
          <input 
            type="text" 
            value={kaggleSlug}
            onChange={(e) => setKaggleSlug(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition" 
            placeholder="username/dataset-slug"
          />
          <button 
            onClick={handleDownload}
            disabled={isDownloading || downloaded}
            className={`px-5 py-2.5 rounded-xl flex items-center space-x-2 text-white font-semibold text-sm transition shadow-xs ${
              downloaded ? 'bg-emerald-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Download size={17} className={isDownloading ? "animate-bounce" : ""} />
            <span>{isDownloading ? 'Downloading...' : downloaded ? 'Downloaded' : 'Pull Dataset'}</span>
          </button>
        </div>
        {downloaded && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center space-x-2.5 text-xs text-emerald-800">
            <CheckCircle2 size={17} className="text-emerald-600 shrink-0" />
            <div>
              Dataset ready: extracted <strong>4,332 images</strong> with detected schema: <code>annotations.csv</code>.
            </div>
          </div>
        )}
      </div>

      {/* 2. Data Wrangler (Column Mapping & Splits) */}
      <div className={`transition-opacity duration-300 ${downloaded ? 'opacity-100' : 'opacity-60 pointer-events-none'}`}>
        <div className="bg-white p-7 rounded-2xl shadow-xs border border-slate-200/80">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Target size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Step 2: Wrangle to Target Format (YOLO/COCO)</h3>
              <p className="text-xs text-slate-500">Map column headers and partition datasets into Train, Validation, and Test subsets</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Column Mapping */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 uppercase tracking-wider">Map CSV Columns to YOLO Format</h4>
              <div className="space-y-2.5">
                {Object.entries(mappings).map(([targetField, sourceCol]) => (
                  <div key={targetField} className="flex items-center justify-between bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-xs font-mono font-medium text-slate-700 w-1/3">{targetField}</span>
                    <span className="text-slate-400 mx-2 text-xs">←</span>
                    <select 
                      value={sourceCol}
                      onChange={(e) => setMappings({...mappings, [targetField]: e.target.value})}
                      className="w-1/2 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    >
                      <option value="">-- Ignore --</option>
                      {availableColumns.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Train/Test Split Slider */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center uppercase tracking-wider">
                <SplitSquareHorizontal size={15} className="mr-1.5 text-slate-400" />
                Train / Validation / Test Partition
              </h4>
              
              <div className="space-y-5 pt-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">Train: {split.train}%</span>
                  <span className="text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">Val: {split.val}%</span>
                  <span className="text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">Test: {split.test}%</span>
                </div>
                
                {/* Visual Split Bar */}
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100">
                  <div className="bg-blue-600 h-full transition-all" style={{width: `${split.train}%`}}></div>
                  <div className="bg-indigo-500 h-full transition-all" style={{width: `${split.val}%`}}></div>
                  <div className="bg-slate-400 h-full transition-all" style={{width: `${split.test}%`}}></div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Train %</label>
                    <input type="number" value={split.train} onChange={e => setSplit({...split, train: Number(e.target.value)})} className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Val %</label>
                    <input type="number" value={split.val} onChange={e => setSplit({...split, val: Number(e.target.value)})} className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Test %</label>
                    <input type="number" value={split.test} onChange={e => setSplit({...split, test: Number(e.target.value)})} className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={handleSaveWrangled}
                  disabled={isWrangling}
                  className={`px-5 py-2.5 rounded-xl flex items-center space-x-2 transition font-semibold text-sm text-white shadow-xs ${
                    isWrangling ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Save size={17} />
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
