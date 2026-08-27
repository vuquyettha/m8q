import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
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
  CheckCircle2,
  AlertCircle,
  Loader2,
  Play,
  Settings,
  Copy,
  Trash2,
} from 'lucide-react';
import { CustomNodeData, NodeType } from '../types';
import { NODE_DEFINITIONS } from '../data/nodeDefinitions';

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

const CATEGORY_STYLES: Record<string, { bg: string; border: string; text: string; lightBg: string }> = {
  trigger: { bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-700', lightBg: 'bg-emerald-50' },
  action: { bg: 'bg-sky-500', border: 'border-sky-500', text: 'text-sky-700', lightBg: 'bg-sky-50' },
  logic: { bg: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-700', lightBg: 'bg-amber-50' },
  ai: { bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-700', lightBg: 'bg-purple-50' },
  output: { bg: 'bg-rose-500', border: 'border-rose-500', text: 'text-rose-700', lightBg: 'bg-rose-50' },
};

export const CustomNode = memo(({ id, data, selected }: NodeProps<any>) => {
  const nodeData = data as CustomNodeData;
  const nodeDef = NODE_DEFINITIONS[nodeData.nodeType || 'manual'] || NODE_DEFINITIONS.manual;
  const IconComponent = ICON_MAP[nodeDef.icon] || PlayCircle;
  const catStyle = CATEGORY_STYLES[nodeData.category || nodeDef.category] || CATEGORY_STYLES.action;

  const isRunning = nodeData.status === 'running';
  const isSuccess = nodeData.status === 'success';
  const isError = nodeData.status === 'error';

  // Summary parameter preview line
  const getParamSummary = () => {
    const p = nodeData.parameters || {};
    switch (nodeData.nodeType) {
      case 'webhook':
        return `${p.httpMethod || 'POST'} /api/webhook/${p.webhookPath || 'order'}`;
      case 'schedule':
        return `Cron: ${p.cronExpression || '*/15 * * * *'}`;
      case 'filter':
        return `${p.fieldPath || 'VIP'} ${p.operator || '=='} ${p.compareValue ?? 'true'}`;
      case 'pythonCode':
        return 'Script Python 3.12 tùy chỉnh';
      case 'httpRequest':
        return `${p.method || 'GET'} ${p.url ? (p.url.length > 25 ? p.url.slice(0, 25) + '...' : p.url) : 'API'}`;
      case 'geminiAI':
        return `Gemini AI: ${p.taskType || 'summarize'}`;
      case 'email':
        return `Tới: ${p.to || 'customer@example.com'}`;
      case 'telegram':
        return `Chat ID: ${p.chatId || '-100...'}`;
      case 'database':
        return `${p.operation || 'INSERT'} -> ${p.tableName || 'records'}`;
      case 'arrayIterator':
        return `Lặp qua: $json.${p.arrayField || 'items'}`;
      case 'transform':
        return 'Thiết lập & Ánh xạ thuộc tính';
      default:
        return 'Nhấn để cấu hình';
    }
  };

  return (
    <div
      id={`workflow-node-${id}`}
      className={`relative min-w-[240px] max-w-[280px] rounded-xl bg-white border-2 transition-all duration-200 shadow-sm ${
        selected ? 'border-indigo-600 shadow-md ring-2 ring-indigo-200' : 'border-gray-200 hover:border-gray-300'
      } ${isRunning ? 'running-glow border-blue-500' : ''}`}
    >
      {/* Input Handles */}
      {nodeDef.inputs.map((inp, idx) => (
        <Handle
          key={inp.id}
          id={inp.id}
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-indigo-600 !border-2 !border-white"
          style={{ top: nodeDef.inputs.length === 1 ? '50%' : `${((idx + 1) / (nodeDef.inputs.length + 1)) * 100}%` }}
        />
      ))}

      {/* Node Header */}
      <div className="flex items-center justify-between p-3 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg text-white ${catStyle.bg} shadow-sm`}>
            <IconComponent className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[150px]">
              {nodeData.label || nodeDef.label}
            </h4>
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${catStyle.text}`}>
              {nodeData.category || nodeDef.category}
            </span>
          </div>
        </div>

        {/* Execution Status Badge */}
        <div>
          {isRunning && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Chạy</span>
            </div>
          )}
          {isSuccess && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              <span>{nodeData.executionTimeMs ? `${nodeData.executionTimeMs}ms` : 'Xong'}</span>
            </div>
          )}
          {isError && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              <AlertCircle className="w-3 h-3" />
              <span>Lỗi</span>
            </div>
          )}
          {!isRunning && !isSuccess && !isError && (
            <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" title="Sẵn sàng thực thi" />
          )}
        </div>
      </div>

      {/* Node Body / Summary */}
      <div className="p-3 pt-2 text-left">
        <p className="text-[11px] text-gray-600 font-mono bg-gray-50 p-1.5 rounded border border-gray-100 truncate">
          {getParamSummary()}
        </p>

        {/* Dynamic Branch or Loop Badges */}
        {nodeData.nodeType === 'filter' && (
          <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-gray-500 pt-1">
            <span className="flex items-center gap-1 text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Nhánh Đúng
            </span>
            <span className="flex items-center gap-1 text-rose-500">
              Nhánh Sai <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            </span>
          </div>
        )}

        {nodeData.nodeType === 'arrayIterator' && (
          <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-gray-500 pt-1">
            <span className="text-orange-600">Vòng lặp (Từng phần tử)</span>
            <span className="text-gray-500">Hoàn tất (Tổng hợp)</span>
          </div>
        )}
      </div>

      {/* Output Handles */}
      {nodeDef.outputs.map((out, idx) => {
        let handleColor = '!bg-indigo-600';
        let handleTop = nodeDef.outputs.length === 1 ? '50%' : `${((idx + 1) / (nodeDef.outputs.length + 1)) * 100}%`;
        
        if (nodeData.nodeType === 'filter') {
          if (out.id === 'true') {
            handleColor = '!bg-emerald-500';
            handleTop = '35%';
          } else if (out.id === 'false') {
            handleColor = '!bg-rose-500';
            handleTop = '70%';
          }
        } else if (nodeData.nodeType === 'arrayIterator') {
          if (out.id === 'item') {
            handleColor = '!bg-orange-500';
            handleTop = '35%';
          } else if (out.id === 'done') {
            handleColor = '!bg-gray-500';
            handleTop = '70%';
          }
        }

        return (
          <Handle
            key={out.id}
            id={out.id}
            type="source"
            position={Position.Right}
            className={`!w-3 !h-3 ${handleColor} !border-2 !border-white`}
            style={{ top: handleTop }}
          />
        );
      })}
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
