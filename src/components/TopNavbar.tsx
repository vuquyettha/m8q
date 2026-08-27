import React, { useState } from 'react';
import {
  Play,
  Loader2,
  Code2,
  BookOpen,
  Webhook,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Check,
  ChevronDown,
  Layers,
  FileCode,
  Save,
  BookTemplate,
} from 'lucide-react';

interface TopNavbarProps {
  workflowName: string;
  onUpdateWorkflowName: (name: string) => void;
  isActive: boolean;
  onToggleActive: () => void;
  isRunning: boolean;
  onRunWorkflow: () => void;
  onOpenPythonExport: () => void;
  onOpenArchitecture: () => void;
  onOpenWebhookModal: () => void;
  onOpenTemplates: () => void;
  onExportWorkflowJson: () => void;
  onImportWorkflowJson: () => void;
  onResetWorkflow: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  workflowName,
  onUpdateWorkflowName,
  isActive,
  onToggleActive,
  isRunning,
  onRunWorkflow,
  onOpenPythonExport,
  onOpenArchitecture,
  onOpenWebhookModal,
  onOpenTemplates,
  onExportWorkflowJson,
  onImportWorkflowJson,
  onResetWorkflow,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <header
      id="top-navbar"
      className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between z-30 select-none shadow-xs"
    >
      {/* Left: App Logo & Workflow Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white font-bold text-sm shadow-xs">
            ⚡
          </div>
          <span className="font-extrabold text-sm text-gray-900 tracking-tight hidden sm:inline">
            M8Q Studio
          </span>
        </div>

        <div className="h-5 w-[1px] bg-gray-200" />

        {/* Editable Workflow Title */}
        <div className="flex items-center gap-2">
          <input
            id="input-workflow-name"
            type="text"
            value={workflowName}
            onChange={(e) => onUpdateWorkflowName(e.target.value)}
            className="text-xs font-bold text-gray-800 bg-transparent hover:bg-gray-50 focus:bg-white px-2 py-1 rounded-md border border-transparent focus:border-indigo-400 focus:outline-none transition max-w-[200px] md:max-w-xs truncate"
          />

          {/* Active Switch Pill */}
          <button
            id="btn-toggle-active"
            onClick={onToggleActive}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border transition ${
              isActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-gray-100 text-gray-500 border-gray-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
              }`}
            />
            <span>{isActive ? 'Đang hoạt động' : 'Bản nháp'}</span>
          </button>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Templates Picker */}
        <button
          id="btn-nav-templates"
          onClick={onOpenTemplates}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition shadow-xs"
        >
          <BookTemplate className="w-3.5 h-3.5 text-indigo-600" />
          <span>Mẫu quy trình</span>
        </button>

        {/* Webhook Tester */}
        <button
          id="btn-nav-webhook"
          onClick={onOpenWebhookModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200 rounded-lg transition shadow-xs"
        >
          <Webhook className="w-3.5 h-3.5 text-emerald-600" />
          <span>URL Webhook</span>
        </button>

        {/* Python Script Export */}
        <button
          id="btn-nav-python-export"
          onClick={onOpenPythonExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition shadow-xs"
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Mã nguồn Python (.py)</span>
        </button>

        {/* Architecture Specs */}
        <button
          id="btn-nav-architecture"
          onClick={onOpenArchitecture}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-gray-200 rounded-lg transition shadow-xs"
        >
          <BookOpen className="w-3.5 h-3.5 text-sky-600" />
          <span>Tài liệu Kiến trúc</span>
        </button>

        {/* JSON Export/Import Dropdown */}
        <div className="relative">
          <button
            id="btn-nav-json-menu"
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="p-1.5 text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition"
            title="Nhập/Xuất JSON"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg p-1 z-50 text-xs font-medium text-gray-700">
              <button
                id="btn-export-json"
                onClick={() => {
                  onExportWorkflowJson();
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất quy trình JSON</span>
              </button>
              <button
                id="btn-import-json"
                onClick={() => {
                  onImportWorkflowJson();
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg flex items-center gap-2"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Nhập quy trình JSON</span>
              </button>
              <div className="my-1 border-t border-gray-100" />
              <button
                id="btn-reset-workflow"
                onClick={() => {
                  onResetWorkflow();
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 rounded-lg flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Làm mới / Xóa Canvas</span>
              </button>
            </div>
          )}
        </div>

        {/* Primary Run Workflow Button */}
        <button
          id="btn-run-workflow"
          onClick={onRunWorkflow}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-60"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Đang thực thi...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Chạy Quy Trình</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
