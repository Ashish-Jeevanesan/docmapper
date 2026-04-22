/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileUp, 
  MapPin, 
  Download, 
  Trash2, 
  Plus, 
  FileText, 
  ChevronRight, 
  X,
  Info,
  Settings2,
  Scan,
  ZoomIn,
  ZoomOut,
  Maximize,
  Hand,
  MousePointer2,
  Lock,
  Unlock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { FieldMapping } from './types';

// Mock Initial Fields to show the user upon clicking 'Load Sample'
const INITIAL_FIELDS: FieldMapping[] = [
  { id: '1', label: 'Emitter Name', columnName: 'emitter_name', comment: 'Top left industrial name', x: 20, y: 11, width: 20, height: 4 },
  { id: '2', label: 'CNPJ', columnName: 'emitter_cnpj', comment: 'Verify against master data', x: 75, y: 26, width: 15, height: 3 },
  { id: '3', label: 'Total Value', columnName: 'total_amount', comment: 'Sum of all items', x: 92, y: 49, width: 7, height: 2 },
];

export default function App() {
  // --- Core Document & Canvas State ---
  const [image, setImage] = useState<string | null>(null);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // --- UI & Viewport State ---
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  // --- Interaction Tools State (Cursor Modes) ---
  const [interactionMode, setInteractionMode] = useState<'map' | 'pan'>('map');
  const [isResizing, setIsResizing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // --- DOM References for interactions ---
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  
  // References to preserve coordinates during continuous drag events
  const resizeRef = useRef<{ id: string, startX: number, startY: number, startWidth: number, startHeight: number } | null>(null);
  const dragRef = useRef<{ id: string, startX: number, startY: number, startBoxX: number, startBoxY: number } | null>(null);
  const panRef = useRef<{ startX: number, startY: number, startPanX: number, startPanY: number } | null>(null);

  // --- FILE HANDLING ---
  
  // Parse uploaded image into base64 for canvas rendering
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (prev) => {
        setImage(prev.target?.result as string);
        setZoom(1); // Reset zoom on new image
      };
      reader.readAsDataURL(file);
    }
  };

  // Parse uploaded JSON Schema map and inject straight into state
  const handleJSONUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (prev) => {
        try {
          const importedMappings = JSON.parse(prev.target?.result as string);
          if (Array.isArray(importedMappings)) {
            setMappings(importedMappings);
          } else {
            alert("Invalid mapping file format.");
          }
        } catch (error) {
          console.error("Error parsing JSON file", error);
          alert("Error parsing JSON file.");
        }
      };
      reader.readAsText(file);
    }
    // clear input
    e.target.value = '';
  };

  const loadSample = () => {
    setImage('https://picsum.photos/seed/document/1200/1800');
    setMappings(INITIAL_FIELDS);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // --- INTERACTION HANDLERS ---
  
  // Creates a new mapping box directly on the clicked coordinates (translated to percentages)
  const addMapping = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current || isResizing || isDragging || interactionMode === 'pan') return;
    const rect = imgRef.current.getBoundingClientRect();
    
    // Position box so click is roughly top-left
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newMapping: FieldMapping = {
      id: crypto.randomUUID(),
      label: `New Field ${mappings.length + 1}`,
      columnName: '',
      comment: '',
      x,
      y,
      width: 10,
      height: 4,
    };

    setMappings([...mappings, newMapping]);
    setSelectedId(newMapping.id);
  };

  const startResize = (e: React.MouseEvent, m: FieldMapping) => {
    if (m.isLocked) return;
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    resizeRef.current = {
      id: m.id,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: m.width,
      startHeight: m.height
    };
  };

  const startDrag = (e: React.MouseEvent, m: FieldMapping) => {
    if (interactionMode === 'pan' || m.isLocked) return;
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      id: m.id,
      startX: e.clientX,
      startY: e.clientY,
      startBoxX: m.x,
      startBoxY: m.y
    };
    setSelectedId(m.id);
  };

  const startPan = (e: React.MouseEvent) => {
    if (interactionMode !== 'pan') return;
    e.preventDefault();
    setIsPanning(true);
    panRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPanX: pan.x,
      startPanY: pan.y
    };
  };

  // Core Event Loop for Mouse movement (Resizing mappings, dragging mappings, or panning the entire canvas)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && resizeRef.current && imgRef.current) {
        const { id, startX, startY, startWidth, startHeight } = resizeRef.current;
        const rect = imgRef.current.getBoundingClientRect();
        
        // Calculate change in percentage units
        const deltaXPercent = ((e.clientX - startX) / rect.width) * 100;
        const deltaYPercent = ((e.clientY - startY) / rect.height) * 100;

        setMappings(prev => prev.map(m => 
          m.id === id ? { 
            ...m, 
            width: Math.max(1, startWidth + deltaXPercent),
            height: Math.max(1, startHeight + deltaYPercent)
          } : m
        ));
      } else if (isDragging && dragRef.current && imgRef.current) {
        const { id, startX, startY, startBoxX, startBoxY } = dragRef.current;
        const rect = imgRef.current.getBoundingClientRect();
        
        const deltaXPercent = ((e.clientX - startX) / rect.width) * 100;
        const deltaYPercent = ((e.clientY - startY) / rect.height) * 100;

        setMappings(prev => prev.map(m => 
          m.id === id ? { 
            ...m, 
            x: Math.max(0, Math.min(100 - m.width, startBoxX + deltaXPercent)),
            y: Math.max(0, Math.min(100 - m.height, startBoxY + deltaYPercent))
          } : m
        ));
      } else if (isPanning && panRef.current) {
        const { startX, startY, startPanX, startPanY } = panRef.current;
        setPan({
          x: startPanX + (e.clientX - startX),
          y: startPanY + (e.clientY - startY)
        });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setIsDragging(false);
      setIsPanning(false);
      resizeRef.current = null;
      dragRef.current = null;
      panRef.current = null;
    };

    if (isResizing || isDragging || isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, isDragging, isPanning]);

  const handleZoom = (delta: number) => {
    setZoom(prev => {
      const newZoom = Math.min(Math.max(0.5, prev + delta), 3);
      if (newZoom === 1) setPan({ x: 0, y: 0 }); // Reset pan when zooming back to 100%
      return newZoom;
    });
  };

  // Updates specific values inside a targeted FieldMapping
  const updateMapping = (id: string, updates: Partial<FieldMapping>) => {
    setMappings(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const removeMapping = (id: string) => {
    setMappings(prev => prev.filter(m => m.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const selectedMapping = mappings.find(m => m.id === selectedId);

  // Generate and force-download a pure `.json` file representing the current state of mappings
  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mappings, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "document_mapping.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="h-screen bg-slate-100 flex flex-col font-sans text-slate-900 overflow-hidden">
      {/* Header - High Density Pattern */}
      <header className="h-14 bg-white border-b border-slate-300 flex items-center justify-between px-6 shrink-0 z-40">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 text-white p-1.5 rounded shadow-sm">
            <Scan size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-tight leading-none">DocuMapper</h1>
            <p className="text-[10px] text-slate-500 uppercase font-medium tracking-widest mt-1">
              {image ? "Live Mapping Session" : "Awaiting Document Upload"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono bg-slate-50 px-3 py-1.5 border rounded border-slate-200 text-slate-600">
            <span className={cn("w-2 h-2 rounded-full", image ? "bg-emerald-500 animate-pulse" : "bg-slate-300")}></span>
            {image ? "READY FOR MAPPING" : "STATE: IDLE"}
          </div>
          {!image && (
            <button 
              onClick={loadSample}
              className="text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-indigo-600 transition-colors"
            >
              Load Sample
            </button>
          )}
          <button 
            onClick={() => importInputRef.current?.click()}
            className="bg-white text-indigo-600 border border-indigo-200 px-4 py-1.5 rounded text-xs font-semibold hover:bg-indigo-50 transition-colors shadow-sm active:scale-95"
          >
            Import JSON
          </button>
          <input 
            type="file" 
            ref={importInputRef} 
            className="hidden" 
            accept=".json" 
            onChange={handleJSONUpload} 
          />
          <button 
            onClick={() => setIsExportOpen(true)}
            className="bg-indigo-600 text-white px-4 py-1.5 rounded text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm active:scale-95"
          >
            Export Jasper JSON
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Document Canvas Area */}
        <div className="flex-1 overflow-auto bg-slate-200 p-8 flex justify-center items-start scrollbar-hide relative group/canvas">
          {image && (
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white border border-slate-300 rounded-full shadow-lg px-2 py-1.5 z-40">
              <button
                onClick={() => setInteractionMode('map')}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  interactionMode === 'map' ? "bg-indigo-100 text-indigo-600" : "text-slate-500 hover:bg-slate-100"
                )}
                title="Mapping Mode"
              >
                <MousePointer2 size={16} />
              </button>
              <button
                onClick={() => setInteractionMode('pan')}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  interactionMode === 'pan' ? "bg-indigo-100 text-indigo-600" : "text-slate-500 hover:bg-slate-100"
                )}
                title="Pan Mode"
              >
                <Hand size={16} />
              </button>
              <div className="w-px h-5 bg-slate-200 mx-1" />
              <button 
                onClick={(e) => { e.stopPropagation(); handleZoom(-0.25); }}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <div className="px-2 text-[10px] font-mono font-bold text-slate-400 min-w-[50px] text-center border-x border-slate-100">
                {Math.round(zoom * 100)}%
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleZoom(0.25); }}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setZoom(1); }}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors border-l border-slate-100 ml-1"
                title="Reset View"
              >
                <Maximize size={16} />
              </button>
            </div>
          )}

          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-2xl aspect-[3/4] border-2 border-dashed border-slate-300 bg-white rounded flex flex-col items-center justify-center gap-4 hover:border-indigo-400 hover:bg-indigo-50/10 transition-all cursor-pointer group shadow-sm"
            >
              <div className="w-12 h-12 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                <FileUp size={24} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold uppercase tracking-wider text-slate-700">Upload Business Document</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">PNG, JPG, or PDF Images</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
            </div>
          ) : (
            <div 
              className={cn("relative shadow-2xl bg-white border border-slate-300 transition-transform origin-center cursor-default", interactionMode === 'pan' && (isPanning ? 'cursor-grabbing' : 'cursor-grab'))}
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
              onMouseDown={startPan}
            >
              <img 
                ref={imgRef}
                src={image} 
                alt="Document Preview" 
                className="max-w-[700px] md:max-w-[900px] block select-none pointer-events-none"
                referrerPolicy="no-referrer"
              />
              <div 
                className={cn("absolute inset-0", interactionMode === 'map' ? "cursor-crosshair" : "pointer-events-none")}
                onClick={addMapping}
              >
                {mappings.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      "absolute border-2 transition-colors group",
                      m.isLocked ? "border-solid border-slate-400 bg-slate-100/10 hover:border-slate-500" : "border-dashed",
                      selectedId === m.id && !m.isLocked
                        ? "border-indigo-500 bg-indigo-50/50 z-30 ring-2 ring-indigo-500/10 cursor-move" 
                        : selectedId === m.id && m.isLocked
                          ? "border-slate-500 bg-slate-100/30 z-30 ring-2 ring-slate-500/10"
                          : !m.isLocked && "border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/20 z-20 cursor-move"
                    )}
                    style={{
                      left: `${m.x}%`,
                      top: `${m.y}%`,
                      width: `${m.width}%`,
                      height: `${m.height}%`,
                      pointerEvents: interactionMode === 'map' ? 'auto' : 'none',
                    }}
                    onMouseDown={(e) => startDrag(e, m)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(m.id);
                    }}
                  >
                    <span className={cn(
                      "absolute -top-2 -left-2 text-[8px] px-1 font-bold rounded shadow-sm transition-colors cursor-default",
                      selectedId === m.id ? (m.isLocked ? "bg-slate-500 text-white" : "bg-indigo-600 text-white") : "bg-slate-400 text-white"
                    )}
                    style={{ transform: `scale(${1/zoom})`, transformOrigin: 'top left' }} // Keep label readable at any zoom
                    >
                      {m.columnName || m.label || "UNNAMED"}
                    </span>

                    {/* Resize Handle */}
                    {selectedId === m.id && !m.isLocked && (
                      <div 
                        onMouseDown={(e) => startResize(e, m)}
                        className="absolute -bottom-1 -right-1 w-3 h-3 bg-indigo-600 rounded-sm cursor-nwse-resize shadow-md flex items-center justify-center group-hover:scale-110 transition-transform"
                        style={{ transform: `scale(${1/zoom})` }}
                      >
                         <div className="w-1 h-1 bg-white/40 rounded-full" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mapping Interface Sidebar - High Density */}
        <aside className="w-[380px] bg-white border-l border-slate-200 flex flex-col shrink-0 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Field Configuration</h3>
            {selectedId && (
               <button onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={14} />
               </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6">
            {!selectedMapping ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-10 h-10 bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center text-slate-300">
                  <MapPin size={20} />
                </div>
                <p className="text-[11px] text-slate-400 uppercase tracking-widest font-medium">Click on document to begin mapping</p>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
                {/* Active Selection Info */}
                <div className={cn("p-3 text-white rounded shadow-sm transition-colors", selectedMapping.isLocked ? "bg-slate-500" : "bg-indigo-600")}>
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] uppercase font-bold opacity-70 tracking-widest">Active Selection</label>
                    <button 
                      onClick={() => updateMapping(selectedMapping.id, { isLocked: !selectedMapping.isLocked })}
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                      title={selectedMapping.isLocked ? "Unlock mapping" : "Lock mapping"}
                    >
                      {selectedMapping.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm font-semibold truncate pr-2">{selectedMapping.label}</p>
                    <span className="text-[9px] px-2 py-0.5 bg-white/20 rounded font-mono shrink-0">ID: {selectedMapping.id.split('-')[0]}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-tight">Display Label</label>
                    <input 
                      type="text"
                      disabled={selectedMapping.isLocked}
                      value={selectedMapping.label}
                      onChange={(e) => updateMapping(selectedMapping.id, { label: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded p-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-tight">Target Data Column</label>
                    <div className="relative">
                      <Database size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                      <input 
                        type="text"
                        disabled={selectedMapping.isLocked}
                        placeholder="e.g. invoice_total"
                        value={selectedMapping.columnName}
                        onChange={(e) => updateMapping(selectedMapping.id, { columnName: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                        className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-tight">Business Comments</label>
                    <textarea 
                      disabled={selectedMapping.isLocked}
                      placeholder="Logic instructions for template generation..."
                      value={selectedMapping.comment}
                      onChange={(e) => updateMapping(selectedMapping.id, { comment: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded p-2 h-24 resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none placeholder:italic leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-2">
                  <button 
                    disabled={selectedMapping.isLocked}
                    onClick={() => removeMapping(selectedMapping.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                  <button 
                    onClick={() => setSelectedId(null)}
                    className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Micro-List of Mappings */}
            {mappings.length > 0 && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-tight">Active Mappings ({mappings.length})</h4>
                  <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">SYNC ENABLED</span>
                </div>
                <div className="space-y-1">
                  {mappings.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedId(m.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-2 rounded border transition-all text-left",
                        selectedId === m.id 
                          ? "bg-indigo-50 border-indigo-200 shadow-sm" 
                          : "bg-slate-50 border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className={cn("text-[10px] font-mono truncate", selectedId === m.id ? "text-indigo-600 font-bold" : "text-slate-600")}>
                          {m.columnName || 'UNMAPPABLE'}
                        </span>
                        <span className="text-[9px] text-slate-400 italic truncate">{m.label}</span>
                      </div>
                      <div className="shrink-0 ml-2">
                        {m.isLocked ? (
                          <div className="w-4 h-4 rounded flex items-center justify-center text-slate-400">
                             <Lock size={10} /> 
                          </div>
                        ) : m.columnName ? (
                          <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                             <Plus size={8} className="rotate-45" /> 
                          </div>
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-200 bg-white">
            <button 
               onClick={downloadJSON}
               className="w-full border-2 border-indigo-600 text-indigo-600 font-bold text-[10px] tracking-widest py-2.5 rounded hover:bg-indigo-50 transition-all uppercase"
            >
              Apply Mapping Schema
            </button>
          </div>
        </aside>
      </main>

      {/* Footer Status Bar - High Density Pattern */}
      <footer className="h-8 bg-slate-800 text-slate-400 flex items-center justify-between px-4 text-[9px] shrink-0 font-mono tracking-tighter">
        <div className="flex gap-6 uppercase">
          <span className="flex items-center gap-1.5">
            <Settings2 size={10} />
            NODE: DOCUMAPPER_V1
          </span>
          <span className="hidden sm:inline">STATE: {image ? "PROCESSING" : "STANDBY"}</span>
          <span className="text-emerald-400 hidden sm:inline">AUTO-SAVE: ENABLED</span>
        </div>
        <div className="flex gap-4 items-center">
          <span className="hidden lg:inline">COORDINATES: {selectedMapping ? `X:${selectedMapping.x.toFixed(1)} Y:${selectedMapping.y.toFixed(1)}` : "NA"}</span>
          <span className="bg-slate-700 px-2 py-0.5 rounded text-white font-bold">JSON-SCHEMA V2.1</span>
        </div>
      </footer>

      {/* Export Modal - Themed */}
      <AnimatePresence>
        {isExportOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExportOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="w-full max-w-xl bg-white border border-slate-300 rounded shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Export Mapping Schema</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium mt-1">Status: Validated for Jasper</p>
                </div>
                <button 
                  onClick={() => setIsExportOpen(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 bg-slate-900 p-6 overflow-auto scrollbar-hide">
                <pre className="text-emerald-400 text-[10px] font-mono leading-relaxed p-4 bg-black/40 border border-slate-800 rounded">
                  {JSON.stringify(mappings, null, 2)}
                </pre>
              </div>
              <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                  <Database size={12} />
                  {mappings.length} DEFINED OBJECTS
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsExportOpen(false)}
                    className="px-4 py-2 text-[10px] font-bold uppercase border border-slate-300 rounded hover:bg-slate-50 transition-all"
                  >
                    Close
                  </button>
                  <button 
                    onClick={downloadJSON}
                    className="bg-indigo-600 text-white px-6 py-2 rounded text-[10px] font-bold uppercase hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-2"
                  >
                    <Download size={14} />
                    Download JSON
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
