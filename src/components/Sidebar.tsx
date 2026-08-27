import React, { useState } from 'react';
import {
  Webhook,
  Clock,
  PlayCircle,
  Globe,
  GitFork,
  Code2,
  Wand2,
  Repeat,
  Sparkles,
  Mail,
  Send,
  Database,
  Search,
  Plus,
  BookTemplate,
  KeyRound,
  Layers,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { NODE_DEFINITIONS } from '../data/nodeDefinitions';
import { NodeCategory, NodeType } from '../types';

const ICON_MAP: Record<string, any> = {
  Webhook,
  Clock,
  PlayCircle,
  Globe,
  GitFork,
  Code2,
  Wand2,
  Repeat,
  Sparkles,
  Mail,
  Send,
  Database,
};

const CATEGORIES: { id: NodeCategory | 'all'; label: string; count?: number }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'trigger', label: 'Bộ kích hoạt' },
  { id: 'action', label: 'Hành động' },
  { id: 'logic', label: 'Logic & Nhánh' },
  { id: 'ai', label: 'AI & Trí tuệ' },
  { id: 'output', label: 'Đầu ra & Thông báo' },
];

interface SidebarProps {
  onOpenTemplates: () => void;
  onOpenCredentials: () => void;
  onOpenArchitecture: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenTemplates,
  onOpenCredentials,
  onOpenArchitecture,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NodeCategory | 'all'>('all');

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/pyflow-node-type', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredNodes = Object.values(NODE_DEFINITIONS).filter((node) => {
    const matchesCategory = selectedCategory === 'all' || node.category === selectedCategory;
    const matchesSearch =
      node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <aside
      id="workflow-sidebar"
      className="w-72 bg-white border-r border-gray-200 flex flex-col h-full z-10 select-none shadow-sm"
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            M8
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 leading-tight">Danh mục Node</h2>
            <p className="text-[11px] text-gray-500">Kéo thả vào khung canvas</p>
          </div>
        </div>
      </div>

      {/* Quick Nav Tools */}
      <div className="p-3 border-b border-gray-100 grid grid-cols-2 gap-2 bg-slate-50">
        <button
          id="btn-open-templates"
          onClick={onOpenTemplates}
          className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-100 transition shadow-xs"
        >
          <BookTemplate className="w-3.5 h-3.5" />
          <span>Mẫu quy trình</span>
        </button>
        <button
          id="btn-open-credentials"
          onClick={onOpenCredentials}
          className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-gray-700 rounded-lg text-xs font-semibold border border-gray-200 transition shadow-xs"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Két khóa AES</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
          <input
            id="input-search-nodes"
            type="text"
            placeholder="Tìm kiếm node (vd: webhook, python)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 mt-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Node Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredNodes.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400">
            Không tìm thấy node phù hợp
          </div>
        ) : (
          filteredNodes.map((node) => {
            const Icon = ICON_MAP[node.icon] || PlayCircle;
            return (
              <div
                key={node.type}
                id={`draggable-node-${node.type}`}
                draggable
                onDragStart={(e) => onDragStart(e, node.type)}
                className="group p-2.5 bg-white border border-gray-200 hover:border-indigo-400 hover:shadow-sm rounded-xl cursor-grab active:cursor-grabbing transition-all flex items-start gap-3 relative"
              >
                <div
                  className={`p-2 rounded-lg text-white ${
                    node.category === 'trigger'
                      ? 'bg-emerald-500'
                      : node.category === 'action'
                      ? 'bg-sky-500'
                      : node.category === 'logic'
                      ? 'bg-amber-500'
                      : node.category === 'ai'
                      ? 'bg-purple-500'
                      : 'bg-rose-500'
                  } shrink-0`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-900 group-hover:text-indigo-600 truncate">
                      {node.label}
                    </h4>
                    <span className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold">
                      {node.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-tight mt-0.5 line-clamp-2">
                    {node.description}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs">
        <button
          id="btn-sidebar-arch"
          onClick={onOpenArchitecture}
          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Kiến trúc N8N Python</span>
        </button>
        <span className="text-[10px] text-gray-400 font-mono">Động cơ DAG v1.0</span>
      </div>
    </aside>
  );
};
