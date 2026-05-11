"use client";

import React, { useState } from "react";
import { Clock, Calendar, CheckCircle, AlertCircle, ChevronRight, Folder, FolderOpen, Search, Plus, Filter, MessageSquare, Timer, Trash2, Pencil, X } from "lucide-react";
import { motion } from "framer-motion";
import { Case } from "@/app/page";

interface HistoryLogProps {
  cases: Case[];
  onSelectCase: (caseId: string) => void;
  onNewCase: () => void;
  onDeleteCase: (caseId: string) => void;
  onRenameCase: (caseId: string, newName: string) => void;
}

export function HistoryLog({ cases, onSelectCase, onNewCase, onDeleteCase, onRenameCase }: HistoryLogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const filteredCases = cases.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.crop?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startRename = (e: React.MouseEvent, id: string, currentName: string) => {
    e.stopPropagation();
    setRenamingId(id);
    setNewName(currentName);
  };

  const handleRenameSubmit = (id: string) => {
    if (newName.trim()) {
      onRenameCase(id, newName.trim());
    }
    setRenamingId(null);
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      {/* Header Section */}
      <div className="p-6 bg-white/50 backdrop-blur-md border-b border-slate-200/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <FolderOpen className="text-emerald-600" size={28} />
              Consultations
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Manage and track your crop issues by folder.</p>
          </div>
          <button 
            onClick={onNewCase}
            className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-emerald-600 transition-all tactile-press"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search crop or disease folders..." 
            className="w-full bg-slate-100/80 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Folders List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredCases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <Folder size={32} />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No Folders Found</p>
            <button 
              onClick={onNewCase}
              className="mt-4 text-emerald-600 text-sm font-black underline"
            >
              Start Your First Consultation
            </button>
          </div>
        ) : (
          filteredCases.map((item) => (
            <motion.div 
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="folder-card bg-white rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group"
            >
              {/* Action Bar (Isolated Zone) */}
              <div className="absolute top-4 right-4 z-30 flex items-center gap-1">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    startRename(e, item.id, item.name);
                  }}
                  className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 bg-white/80 backdrop-blur-sm shadow-sm"
                  title="Rename"
                >
                  <Pencil size={16} />
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if(confirm('Are you sure you want to permanently delete this consultation?')) {
                      onDeleteCase(item.id); 
                    }
                  }}
                  className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 bg-white/80 backdrop-blur-sm shadow-sm"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Main Clickable Area */}
              <div 
                onClick={() => onSelectCase(item.id)}
                className="p-6 cursor-pointer active:bg-slate-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500",
                      item.status === 'active' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                    )}>
                      <Folder size={24} />
                    </div>
                    <div>
                      {renamingId === item.id ? (
                        <input 
                          autoFocus
                          className="text-lg font-black bg-slate-50 border-none rounded-lg px-2 py-1 outline-emerald-500"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          onBlur={() => saveRename(item.id)}
                          onKeyDown={(e) => e.key === 'Enter' && saveRename(item.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <h3 className="text-lg font-black text-slate-800 tracking-tight group-hover:text-emerald-600 transition-colors">
                          {item.name}
                        </h3>
                      )}
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {item.messages.length} Messages • {new Date(item.lastUpdatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase">
                      {item.status}
                    </span>
                    {item.crop && (
                      <>
                        <span className="text-slate-300">•</span>
                        <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">{item.crop}</div>
                      </>
                    )}
                  </div>
                </div>
                <div className="self-center">
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </div>
              </div>

              {/* Progress Bar (Visual Polish) */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-50">
                <div 
                  className={`h-full transition-all duration-500 ${
                    item.status === 'resolved' ? 'bg-emerald-500 w-full' : 
                    item.status === 'active' ? 'bg-amber-500 w-1/2' : 
                    'bg-slate-300 w-1/4'
                  }`}
                />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
