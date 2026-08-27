import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, Play, Terminal } from 'lucide-react';

interface PythonExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pythonScript: string;
  workflowName: string;
}

export const PythonExportModal: React.FC<PythonExportModalProps> = ({
  isOpen,
  onClose,
  pythonScript,
  workflowName,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `${workflowName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'pyflow_workflow'}.py`;
    const blob = new Blob([pythonScript], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="python-export-modal"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Mã nguồn Python 3 thực thi độc lập</span>
                <span className="px-2 py-0.5 rounded-full bg-sky-900/60 text-sky-300 text-[10px] font-mono">
                  Động cơ Asyncio DAG
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Tự động sinh mã nguồn độc lập tương ứng với đồ thị node trực quan của bạn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Instructions banner */}
        <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cài đặt thư viện: <code className="text-emerald-400 font-bold">pip install aiohttp pydantic</code></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-copy-py-script"
              onClick={handleCopy}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã sao chép mã!' : 'Sao chép mã'}</span>
            </button>
            <button
              id="btn-download-py-file"
              onClick={handleDownload}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải tệp .py</span>
            </button>
          </div>
        </div>

        {/* Code Viewer */}
        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-emerald-300 bg-slate-900 select-text">
          <pre className="whitespace-pre">{pythonScript}</pre>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Tương thích Python 3.10+ · Asyncio · Data Proxy · Bất đồng bộ Non-blocking</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium text-xs transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
