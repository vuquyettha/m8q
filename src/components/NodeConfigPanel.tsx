import React, { useState } from 'react';
import {
  X,
  Play,
  Copy,
  Check,
  Code2,
  Settings2,
  Database,
  Terminal,
  Sparkles,
  Layers,
  Trash2,
  HelpCircle,
  FileJson,
  Zap,
} from 'lucide-react';
import { Node } from '@xyflow/react';
import { NODE_DEFINITIONS } from '../data/nodeDefinitions';
import { CustomNodeData } from '../types';

interface NodeConfigPanelProps {
  node: Node | null;
  onClose: () => void;
  onUpdateNodeData: (nodeId: string, data: Partial<CustomNodeData>) => void;
  onDeleteNode: (nodeId: string) => void;
  onTestSingleNode: (node: Node, customInput?: any) => Promise<void>;
  isTesting: boolean;
}

export const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
  node,
  onClose,
  onUpdateNodeData,
  onDeleteNode,
  onTestSingleNode,
  isTesting,
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'data' | 'test'>('config');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [customTestInput, setCustomTestInput] = useState<string>('');

  if (!node) return null;

  const nodeData = node.data as CustomNodeData;
  const nodeDef = NODE_DEFINITIONS[nodeData.nodeType || 'manual'] || NODE_DEFINITIONS.manual;
  const parameters = nodeData.parameters || {};

  const handleParamChange = (paramName: string, value: any) => {
    const updatedParams = {
      ...parameters,
      [paramName]: value,
    };
    onUpdateNodeData(node.id, { parameters: updatedParams });
  };

  const handleLabelChange = (newLabel: string) => {
    onUpdateNodeData(node.id, { label: newLabel });
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleInsertExpression = (paramName: string, expr: string) => {
    const currVal = parameters[paramName] || '';
    handleParamChange(paramName, `${currVal} ${expr}`.trim());
  };

  return (
    <div
      id="node-config-drawer"
      className="w-96 bg-white border-l border-gray-200 flex flex-col h-full z-20 shadow-xl"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Settings2 className="w-4 h-4" />
          </div>
          <div>
            <input
              id="input-node-label"
              type="text"
              value={nodeData.label || nodeDef.label}
              onChange={(e) => handleLabelChange(e.target.value)}
              className="text-sm font-bold text-gray-900 bg-transparent hover:bg-white focus:bg-white px-1.5 py-0.5 rounded border border-transparent focus:border-indigo-400 focus:outline-none transition w-44"
            />
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold px-1.5">
              Loại: {nodeData.nodeType}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            id="btn-delete-node"
            onClick={() => onDeleteNode(node.id)}
            title="Xóa node"
            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            id="btn-close-drawer"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-white px-3 pt-2 gap-2 text-xs font-semibold">
        <button
          id="tab-btn-config"
          onClick={() => setActiveTab('config')}
          className={`pb-2 px-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'config'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Tham số cấu hình</span>
        </button>
        <button
          id="tab-btn-data"
          onClick={() => setActiveTab('data')}
          className={`pb-2 px-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'data'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <FileJson className="w-3.5 h-3.5" />
          <span>Dữ liệu Vào / Ra</span>
        </button>
        <button
          id="tab-btn-test"
          onClick={() => setActiveTab('test')}
          className={`pb-2 px-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'test'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Chạy thử bước</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'config' && (
          <div className="space-y-4">
            {/* Description Banner */}
            <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900">
              <p className="leading-relaxed">{nodeDef.description}</p>
            </div>

            {/* Dynamic Parameter Fields */}
            {nodeDef.parameters.map((param) => {
              const val = parameters[param.name] ?? param.default ?? '';

              return (
                <div key={param.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-700">
                      {param.label}
                    </label>
                    {param.type === 'string' || param.type === 'textarea' ? (
                      <span className="text-[10px] text-indigo-600 font-mono">
                        Hỗ trợ {`{{$json}}`}
                      </span>
                    ) : null}
                  </div>

                  {/* Field Types */}
                  {param.type === 'string' && (
                    <input
                      type="text"
                      value={val}
                      placeholder={param.placeholder}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  )}

                  {param.type === 'number' && (
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => handleParamChange(param.name, Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  )}

                  {param.type === 'boolean' && (
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={Boolean(val)}
                        onChange={(e) => handleParamChange(param.name, e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-gray-600">Bật tùy chọn này</span>
                    </label>
                  )}

                  {param.type === 'select' && (
                    <select
                      value={val}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {param.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {param.type === 'textarea' && (
                    <textarea
                      rows={4}
                      value={val}
                      placeholder={param.placeholder}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  )}

                  {param.type === 'code' && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-gray-500 bg-slate-800 text-slate-300 px-3 py-1 rounded-t-lg font-mono">
                        <span>Hàm xử lý Python 3.12</span>
                        <button
                          onClick={() => handleCopy(val, `code_${param.name}`)}
                          className="hover:text-white flex items-center gap-1"
                        >
                          {copiedKey === `code_${param.name}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <textarea
                        rows={10}
                        value={val}
                        onChange={(e) => handleParamChange(param.name, e.target.value)}
                        className="w-full p-3 text-xs bg-slate-900 text-emerald-400 font-mono rounded-b-lg focus:outline-none border border-slate-700"
                        spellCheck={false}
                      />
                    </div>
                  )}

                  {param.type === 'json' && (
                    <div className="space-y-1">
                      <textarea
                        rows={6}
                        value={typeof val === 'string' ? val : JSON.stringify(val, null, 2)}
                        onChange={(e) => {
                          handleParamChange(param.name, e.target.value);
                        }}
                        className="w-full p-2.5 text-xs bg-slate-900 text-sky-300 font-mono rounded-lg focus:outline-none border border-slate-700"
                        spellCheck={false}
                      />
                    </div>
                  )}

                  {param.description && (
                    <p className="text-[10px] text-gray-500 italic">{param.description}</p>
                  )}
                </div>
              );
            })}

            {/* Expression Quick-Insert Helper */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tra cứu nhanh biểu thức (Proxy N8N)</span>
              </h4>
              <p className="text-[11px] text-gray-500 mb-2">
                Nhấn vào để sao chép biểu thức:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '{{$json.order_id}}',
                  '{{$json.customer_name}}',
                  '{{$json.customer_email}}',
                  '{{$json.final_payable}}',
                  '{{$json.customer.vip}}',
                  '{{$json.items[0].sku}}',
                  '{{$env.API_KEY}}',
                ].map((expr) => (
                  <button
                    key={expr}
                    onClick={() => handleCopy(expr, expr)}
                    className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded text-[10px] font-mono border border-slate-200 transition"
                  >
                    {copiedKey === expr ? 'Đã sao chép!' : expr}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-4">
            {/* Output Data View */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Dữ liệu đầu ra sinh ra ($json)
                </h4>
                {nodeData.outputData && (
                  <button
                    onClick={() => handleCopy(JSON.stringify(nodeData.outputData, null, 2), 'out')}
                    className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    {copiedKey === 'out' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    Sao chép JSON
                  </button>
                )}
              </div>
              <div className="bg-slate-900 rounded-lg p-3 max-h-60 overflow-y-auto text-[11px] font-mono text-emerald-300">
                {nodeData.outputData ? (
                  <pre>{JSON.stringify(nodeData.outputData, null, 2)}</pre>
                ) : (
                  <span className="text-gray-500 italic">Chưa có dữ liệu đầu ra. Hãy chạy quy trình hoặc chạy thử node này để kiểm tra.</span>
                )}
              </div>
            </div>

            {/* Input Data View */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  Dữ liệu đầu vào nhận từ node trước
                </h4>
                {nodeData.inputData && (
                  <button
                    onClick={() => handleCopy(JSON.stringify(nodeData.inputData, null, 2), 'inp')}
                    className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    {copiedKey === 'inp' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    Sao chép JSON
                  </button>
                )}
              </div>
              <div className="bg-slate-900 rounded-lg p-3 max-h-48 overflow-y-auto text-[11px] font-mono text-sky-300">
                {nodeData.inputData ? (
                  <pre>{JSON.stringify(nodeData.inputData, null, 2)}</pre>
                ) : (
                  <span className="text-gray-500 italic">Dữ liệu đầu vào sẽ xuất hiện sau khi thực thi.</span>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'test' && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
              <p className="font-semibold">Thực thi Node từng bước độc lập</p>
              <p className="mt-1">
                Chạy thử riêng node này với dữ liệu mẫu tùy chỉnh mà không ảnh hưởng toàn bộ luồng.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">
                Dữ liệu JSON mẫu đầu vào để kiểm tra:
              </label>
              <textarea
                rows={6}
                value={customTestInput || JSON.stringify(nodeData.inputData || {
                  order_id: 'TEST-101',
                  customer: { name: 'Nguyễn Văn A', email: 'test@example.com', vip: true, total_spent: 1500000 },
                  currency: 'VND'
                }, null, 2)}
                onChange={(e) => setCustomTestInput(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-900 text-emerald-300 font-mono rounded-lg focus:outline-none border border-slate-700"
              />
            </div>

            <button
              id="btn-run-single-node"
              onClick={() => {
                let parsedInput;
                try {
                  parsedInput = customTestInput ? JSON.parse(customTestInput) : undefined;
                } catch {
                  parsedInput = undefined;
                }
                onTestSingleNode(node, parsedInput);
              }}
              disabled={isTesting}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isTesting ? 'Đang chạy thử...' : 'Chạy thử Node này (Đơn bước)'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
