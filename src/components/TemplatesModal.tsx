import React from 'react';
import { X, BookTemplate, ArrowRight, Zap, Check, Workflow } from 'lucide-react';
import { WORKFLOW_TEMPLATES } from '../data/templates';
import { Workflow as WorkflowType } from '../types';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: WorkflowType) => void;
  activeTemplateId?: string;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  activeTemplateId,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="templates-modal"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-gray-800">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <BookTemplate className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Thư viện Quy trình Mẫu</h3>
              <p className="text-xs text-gray-500">
                Các luồng tự động hóa được cấu hình sẵn theo chuẩn thực tế, sẵn sàng chạy và xuất mã nguồn
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

        {/* Templates List */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
          {WORKFLOW_TEMPLATES.map((tpl) => {
            const isCurrent = activeTemplateId === tpl.id;
            return (
              <div
                key={tpl.id}
                id={`template-card-${tpl.id}`}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                  isCurrent
                    ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-300'
                    : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-indigo-600" />
                      <span>{tpl.name}</span>
                    </h4>
                    <span className="text-[11px] font-mono text-gray-400">
                      {tpl.nodes.length} Nodes · {tpl.edges.length} Liên kết
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  <div className="flex items-center gap-2">
                    {tpl.nodes.map((n, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700"
                      >
                        {n.data.nodeType}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      onSelectTemplate(tpl);
                      onClose();
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                      isCurrent
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Đang tải</span>
                      </>
                    ) : (
                      <>
                        <span>Tải mẫu này</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>Nhấn "Tải mẫu này" sẽ nạp các node tương ứng lên vùng vẽ</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-100"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
