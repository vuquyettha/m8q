import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Code2,
  Cpu,
  Database,
  Layers,
  ShieldCheck,
  Split,
  Workflow,
  Copy,
  Check,
  GitBranch,
  Clock,
  KeyRound,
  FileCode,
  Milestone,
} from 'lucide-react';
import { PYTHON_ARCHITECTURE_FILES } from '../engine/pythonArchitectureDoc';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'blueprint' | 'code' | 'roadmap'>('blueprint');
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentFile = PYTHON_ARCHITECTURE_FILES[selectedFileIdx];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="architecture-specs-modal"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Workflow className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>Thiết Kế Kiến Trúc Động Cơ N8N Bằng Python</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-mono font-semibold">
                  Tài liệu kỹ thuật
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                Đặc tả kỹ thuật hoàn chỉnh, mô hình thực thi và mã nguồn kiến trúc backend Python
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-gray-200 bg-white px-4 pt-2 gap-4 text-xs font-semibold">
          <button
            id="tab-arch-blueprint"
            onClick={() => setActiveSection('blueprint')}
            className={`pb-2.5 px-2 border-b-2 transition flex items-center gap-2 ${
              activeSection === 'blueprint'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Phân tích kiến trúc</span>
          </button>

          <button
            id="tab-arch-code"
            onClick={() => setActiveSection('code')}
            className={`pb-2.5 px-2 border-b-2 transition flex items-center gap-2 ${
              activeSection === 'code'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Tệp mã nguồn Python ({PYTHON_ARCHITECTURE_FILES.length})</span>
          </button>

          <button
            id="tab-arch-roadmap"
            onClick={() => setActiveSection('roadmap')}
            className={`pb-2.5 px-2 border-b-2 transition flex items-center gap-2 ${
              activeSection === 'roadmap'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Milestone className="w-4 h-4 text-emerald-600" />
            <span>Lộ trình phát triển MVP</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {activeSection === 'blueprint' && (
            <div className="max-w-4xl mx-auto space-y-6 text-xs text-gray-700 leading-relaxed">
              {/* 1. Workflow Model */}
              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                  <Workflow className="w-4 h-4" />
                  <h4>1. Mô hình hóa Workflow (JSON Data Graph)</h4>
                </div>
                <p>
                  Workflow được biểu diễn dưới dạng <strong>Directed Acyclic Graph (DAG)</strong> gồm hai mảng chính:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>
                    <strong>Nodes</strong>: Danh sách các khối chức năng, mỗi node chứa: <code>id</code>, <code>type</code>, <code>label</code>, <code>parameters</code>, <code>position</code> (x, y trên canvas).
                  </li>
                  <li>
                    <strong>Edges (Connections)</strong>: Mô tả đường dẫn dữ liệu giữa các node: <code>source</code>, <code>target</code>, <code>sourceHandle</code> (vd: 'true', 'false', 'item').
                  </li>
                </ul>
              </div>

              {/* 2. Execution Engine & Data Proxy */}
              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-sky-700 font-bold text-sm">
                  <Cpu className="w-4 h-4" />
                  <h4>2. Cơ chế thực thi (Execution Engine) & Data Proxy</h4>
                </div>
                <p>
                  Engine chạy theo thuật toán duyệt đồ thị (Topological Sort / Breadth-First Search với AsyncIO):
                </p>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>
                    <strong>Data Proxy Object</strong>: Khi Node B chạy, nó truy cập dữ liệu của Node A thông qua proxy <code>{'{{$json.fieldname}}'}</code> hoặc <code>{'{{$node["NodeA"].json.key}}'}</code>.
                  </li>
                  <li>
                    <strong>Looping & Array Splitting</strong>: Khi một node trả về mảng <code>items = [...]</code>, engine tự động tách ra thành N luồng xử lý song song/tuần tự cho các node phía sau.
                  </li>
                  <li>
                    <strong>Branching (If/Filter)</strong>: Cho phép rẽ nhánh có điều kiện (True branch vs False branch) dựa trên kết quả biểu thức boolean.
                  </li>
                </ul>
              </div>

              {/* 3. Persistence & Queuing */}
              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                  <Database className="w-4 h-4" />
                  <h4>3. Lưu trữ & Hàng đợi chịu tải (Persistence & Queue)</h4>
                </div>
                <p>
                  Kiến trúc lưu trữ và scale production:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>
                    <strong>PostgreSQL/MySQL</strong>: Bảng <code>workflows</code>, <code>nodes</code>, <code>executions</code>, <code>credentials</code>.
                  </li>
                  <li>
                    <strong>Bảo mật Credentials</strong>: Mã hóa AES-256 GCM trước khi lưu API Key/OAuth tokens vào database.
                  </li>
                  <li>
                    <strong>Message Queue (Celery / Redis / BullMQ)</strong>: Khi có hàng nghìn webhook đổ về, đẩy job vào Redis Queue để Worker Pool xử lý nền, tránh nghẽn HTTP request.
                  </li>
                </ul>
              </div>

              {/* 4. Plugin Architecture */}
              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
                  <Layers className="w-4 h-4" />
                  <h4>4. Kiến trúc Node (Hệ thống Plugin chuẩn)</h4>
                </div>
                <p>
                  Mọi node kế thừa từ <code>BaseNode</code> với 3 thành phần tiêu chuẩn:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>
                    <strong>Description</strong>: Metadata hiển thị (tên, icon, nhóm chức năng).
                  </li>
                  <li>
                    <strong>Properties</strong>: Khai báo schema các ô nhập liệu cho React frontend.
                  </li>
                  <li>
                    <strong>async execute(item, proxy)</strong>: Hàm xử lý logic chính, nhận input, gọi API bên ngoài, trả về output cho node sau.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'code' && (
            <div className="flex h-full gap-4">
              {/* File list sidebar */}
              <div className="w-60 bg-white rounded-xl border border-gray-200 p-2 space-y-1 shrink-0 overflow-y-auto">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">
                  Mô-đun Backend Python
                </p>
                {PYTHON_ARCHITECTURE_FILES.map((file, idx) => (
                  <button
                    key={file.filename}
                    onClick={() => setSelectedFileIdx(idx)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-mono transition flex items-center gap-2 ${
                      selectedFileIdx === idx
                        ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>{file.filename}</span>
                  </button>
                ))}
              </div>

              {/* Code viewer */}
              <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 flex flex-col overflow-hidden text-slate-200">
                <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950 text-xs">
                  <div>
                    <span className="font-bold text-white font-mono">{currentFile.filename}</span>
                    <span className="text-slate-400 ml-2 text-[11px]">— {currentFile.description}</span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium flex items-center gap-1.5 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Đã sao chép mã!' : 'Sao chép mã'}</span>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-emerald-300 select-text">
                  <pre className="whitespace-pre">{currentFile.code}</pre>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'roadmap' && (
            <div className="max-w-3xl mx-auto space-y-4 text-xs text-gray-700">
              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
                <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Milestone className="w-4 h-4 text-indigo-600" />
                  <span>Lộ trình phát triển MVP (Từ cơ bản đến Production)</span>
                </h4>
                <p className="text-gray-500 mb-4">
                  Thực hiện theo 4 giai đoạn tinh gọn để ra mắt sản phẩm trong thời gian ngắn nhất:
                </p>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900">Bước 1: Core Engine & Data Passing (CLI)</h5>
                      <p className="text-gray-600 mt-0.5">
                        Xây dựng class <code>BaseNode</code> và <code>WorkflowEngine</code> trong Python. Đọc 1 file JSON chứa 3 node (Set Data → HTTP Request → Write File) và chạy tuần tự thành công.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900">Bước 2: Giao diện kéo thả Canvas (React Flow)</h5>
                      <p className="text-gray-600 mt-0.5">
                        Sử dụng <strong>React Flow (@xyflow/react)</strong> để vẽ các node, kết nối dây giữa các handles, và hiển thị side panel cấu hình tham số.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900">Bước 3: Kết nối API & Live Execution Feedback</h5>
                      <p className="text-gray-600 mt-0.5">
                        Nút "Execute Workflow" gửi đồ thị JSON lên backend Python/FastAPI. Engine thực thi và bắn logs/output về frontend để hiển thị visual status trên từng node.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">
                      4
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900">Bước 4: Database, Webhooks, Scheduler & Plugin System</h5>
                      <p className="text-gray-600 mt-0.5">
                        Tích hợp PostgreSQL để lưu trữ vĩnh viễn, APScheduler cho Cron jobs, Webhook listener URL, và mã hóa AES-256 cho Credentials Vault.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-white flex items-center justify-between text-xs text-gray-500">
          <span>Kiến trúc PyFlow · Thiết kế chuẩn hóa theo mô hình N8N & Python 3.12</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold text-xs transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
