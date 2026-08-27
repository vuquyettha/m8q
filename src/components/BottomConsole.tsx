import React, { useState } from 'react';
import {
  Terminal,
  Webhook,
  FileJson,
  ChevronUp,
  ChevronDown,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  RefreshCw,
} from 'lucide-react';
import { ExecutionLog, WebhookEvent } from '../types';

interface BottomConsoleProps {
  logs: string[];
  executionHistory: ExecutionLog[];
  webhookEvents: WebhookEvent[];
  onClearLogs: () => void;
  onRefreshWebhooks: () => void;
  onSendSampleWebhook: () => void;
}

export const BottomConsole: React.FC<BottomConsoleProps> = ({
  logs,
  executionHistory,
  webhookEvents,
  onClearLogs,
  onRefreshWebhooks,
  onSendSampleWebhook,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'terminal' | 'history' | 'webhook'>('terminal');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const latestExecution = executionHistory[0];

  return (
    <div
      id="bottom-console-dock"
      className={`fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 text-slate-200 z-20 transition-all duration-300 flex flex-col ${
        isOpen ? 'h-72' : 'h-10'
      }`}
    >
      {/* Dock Bar Header */}
      <div className="h-10 bg-slate-950 px-4 flex items-center justify-between border-b border-slate-800 select-none">
        <div className="flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white"
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            <span className="font-mono text-[11px] uppercase tracking-wider">Bảng điều khiển & Nhật ký</span>
          </button>

          {isOpen && (
            <div className="flex items-center gap-2">
              <button
                id="console-tab-terminal"
                onClick={() => setActiveTab('terminal')}
                className={`px-2.5 py-1 rounded text-xs transition flex items-center gap-1.5 ${
                  activeTab === 'terminal'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Nhật ký thực thi trực tiếp ({logs.length})</span>
              </button>

              <button
                id="console-tab-history"
                onClick={() => setActiveTab('history')}
                className={`px-2.5 py-1 rounded text-xs transition flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Lịch sử chạy ({executionHistory.length})</span>
              </button>

              <button
                id="console-tab-webhook"
                onClick={() => setActiveTab('webhook')}
                className={`px-2.5 py-1 rounded text-xs transition flex items-center gap-1.5 ${
                  activeTab === 'webhook'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Webhook className="w-3.5 h-3.5 text-emerald-400" />
                <span>Bộ nhận Webhook ({webhookEvents.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick summary status when collapsed */}
        {!isOpen && latestExecution && (
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              {latestExecution.status === 'success' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span>Lần chạy gần nhất: {latestExecution.status === 'success' ? 'THÀNH CÔNG' : 'LỖI'} trong {latestExecution.durationMs}ms</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Nhấn để mở rộng</span>
          </div>
        )}

        {isOpen && (
          <div className="flex items-center gap-2">
            {activeTab === 'webhook' && (
              <>
                <button
                  id="btn-test-webhook-console"
                  onClick={onSendSampleWebhook}
                  className="px-2 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[11px] font-medium flex items-center gap-1 transition"
                >
                  <Send className="w-3 h-3" />
                  <span>Gửi Webhook thử nghiệm</span>
                </button>
                <button
                  onClick={onRefreshWebhooks}
                  className="p-1 hover:text-white text-slate-400 rounded"
                  title="Làm mới sự kiện webhook"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            <button
              id="btn-clear-console-logs"
              onClick={onClearLogs}
              className="p-1 hover:text-rose-400 text-slate-400 rounded transition"
              title="Xóa nhật ký"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Expanded Content Area */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto p-3 font-mono text-xs text-slate-300 bg-slate-900">
          {activeTab === 'terminal' && (
            <div className="space-y-1">
              {logs.length === 0 ? (
                <div className="text-slate-500 italic text-center py-6">
                  Động cơ đang rảnh. Nhấn "Chạy Quy Trình" hoặc "Chạy thử bước" để thực thi các node và xem luồng nhật ký.
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-slate-600 text-[10px] select-none">
                      {idx + 1}.
                    </span>
                    <span
                      className={
                        log.includes('❌')
                          ? 'text-rose-400 font-semibold'
                          : log.includes('✅')
                          ? 'text-emerald-400'
                          : log.includes('🚀') || log.includes('🏁')
                          ? 'text-indigo-300 font-bold'
                          : log.includes('🔀')
                          ? 'text-amber-300'
                          : 'text-slate-300'
                      }
                    >
                      {log}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-2">
              {executionHistory.length === 0 ? (
                <div className="text-slate-500 italic text-center py-6">
                  Chưa có lịch sử thực thi nào được ghi lại.
                </div>
              ) : (
                executionHistory.map((exec) => (
                  <div
                    key={exec.id}
                    className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      {exec.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                      )}
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{exec.workflowName}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({exec.triggerType})
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(exec.startedAt).toLocaleTimeString()} · Đã chạy {Object.keys(exec.nodeExecutions).length} nodes
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-emerald-400">
                        {exec.durationMs}ms
                      </span>
                      <button
                        onClick={() => handleCopy(JSON.stringify(exec, null, 2), exec.id)}
                        className="p-1 hover:text-white text-slate-400"
                        title="Sao chép toàn bộ bản ghi thực thi"
                      >
                        {copiedKey === exec.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'webhook' && (
            <div className="space-y-2">
              {webhookEvents.length === 0 ? (
                <div className="text-slate-500 italic text-center py-6">
                  Chưa nhận được yêu cầu Webhook nào. Nhấn "Gửi Webhook thử nghiệm" hoặc gửi HTTP request đến /api/webhook/:id.
                </div>
              ) : (
                webhookEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2.5 bg-slate-800 rounded-lg border border-slate-700 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-emerald-900/60 text-emerald-300 rounded font-mono text-[10px] font-bold">
                          {evt.method}
                        </span>
                        <span className="font-mono text-white">/api/webhook/{evt.webhookId}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <pre className="text-[10px] text-emerald-300 bg-slate-950 p-2 rounded max-h-24 overflow-y-auto">
                      {JSON.stringify(evt.body, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
