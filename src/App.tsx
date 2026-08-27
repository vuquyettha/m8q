import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNodesState, useEdgesState, Node, Edge } from '@xyflow/react';
import { TopNavbar } from './components/TopNavbar';
import { Sidebar } from './components/Sidebar';
import { FlowCanvas } from './components/FlowCanvas';
import { NodeConfigPanel } from './components/NodeConfigPanel';
import { BottomConsole } from './components/BottomConsole';
import { PythonExportModal } from './components/PythonExportModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { WebhookModal } from './components/WebhookModal';
import { TemplatesModal } from './components/TemplatesModal';
import { CredentialsModal } from './components/CredentialsModal';
import { WORKFLOW_TEMPLATES } from './data/templates';
import { WorkflowRunner } from './engine/workflowRunner';
import { generatePythonWorkflowScript } from './engine/pythonCodeGenerator';
import { CustomNodeData, ExecutionLog, WebhookEvent, Workflow } from './types';

export default function App() {
  // Load initial template
  const initialTemplate = WORKFLOW_TEMPLATES[0];

  const [workflowName, setWorkflowName] = useState(initialTemplate.name);
  const [isActive, setIsActive] = useState(initialTemplate.active);
  const [activeTemplateId, setActiveTemplateId] = useState(initialTemplate.id);
  const [webhookId, setWebhookId] = useState(initialTemplate.webhookId || 'order-received');

  // React Flow State
  const [nodes, setNodes, onNodesChange] = useNodesState(initialTemplate.nodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialTemplate.edges as Edge[]);

  // Selection state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Execution & Logs state
  const [isRunning, setIsRunning] = useState(false);
  const [isTestingSingleNode, setIsTestingSingleNode] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([
    '⚡ Khởi động PyFlow Studio với động cơ DAG Python 3.12.',
    '💡 Nhấn "Chạy Quy Trình" để kiểm tra toàn bộ luồng hoặc nhấn vào node bất kỳ để tùy chỉnh tham số.',
  ]);
  const [executionHistory, setExecutionHistory] = useState<ExecutionLog[]>([]);
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);

  // Modals state
  const [isPythonModalOpen, setIsPythonModalOpen] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);

  // Find currently selected node
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );

  // Auto-generate Python script
  const generatedPythonScript = useMemo(
    () => generatePythonWorkflowScript(workflowName, nodes, edges),
    [workflowName, nodes, edges]
  );

  // Fetch incoming webhook events periodically
  const fetchWebhookEvents = useCallback(async () => {
    try {
      const res = await fetch(`/api/webhooks/${webhookId}/events`);
      if (res.ok) {
        const data = await res.json();
        if (data.events) {
          setWebhookEvents(data.events);
        }
      }
    } catch {
      // ignore in offline mode
    }
  }, [webhookId]);

  useEffect(() => {
    fetchWebhookEvents();
    const interval = setInterval(fetchWebhookEvents, 5000);
    return () => clearInterval(interval);
  }, [fetchWebhookEvents]);

  // Handle selecting a node
  const handleSelectNode = useCallback((node: Node | null) => {
    setSelectedNodeId(node ? node.id : null);
  }, []);

  // Update node data (parameters, labels, etc.)
  const handleUpdateNodeData = useCallback(
    (nodeId: string, updatedData: Partial<CustomNodeData>) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === nodeId) {
            return {
              ...n,
              data: {
                ...n.data,
                ...updatedData,
              },
            };
          }
          return n;
        })
      );
    },
    [setNodes]
  );

  // Delete a node
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      }
    },
    [setNodes, setEdges, selectedNodeId]
  );

  // Run full workflow
  const handleRunWorkflow = useCallback(
    async (customTriggerData?: any) => {
      if (isRunning) return;
      setIsRunning(true);

      // Reset all nodes status to idle
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: {
            ...n.data,
            status: 'idle',
            error: undefined,
          },
        }))
      );

      const runner = new WorkflowRunner(nodes, edges);

      try {
        const executionResult = await runner.run(customTriggerData, {
          onNodeStart: (nodeId) => {
            setNodes((nds) =>
              nds.map((n) =>
                n.id === nodeId
                  ? { ...n, data: { ...n.data, status: 'running' } }
                  : n
              )
            );
          },
          onNodeFinish: (nodeId, result) => {
            setNodes((nds) =>
              nds.map((n) =>
                n.id === nodeId
                  ? {
                      ...n,
                      data: {
                        ...n.data,
                        status: 'success',
                        executionTimeMs: result.durationMs,
                        inputData: result.input,
                        outputData: result.output,
                        error: undefined,
                      },
                    }
                  : n
              )
            );
          },
          onNodeError: (nodeId, error, result) => {
            setNodes((nds) =>
              nds.map((n) =>
                n.id === nodeId
                  ? {
                      ...n,
                      data: {
                        ...n.data,
                        status: 'error',
                        executionTimeMs: result.durationMs,
                        inputData: result.input,
                        outputData: result.output,
                        error,
                      },
                    }
                  : n
              )
            );
          },
          onLog: (msg) => {
            setExecutionLogs((prev) => [...prev, msg]);
          },
        });

        // Record execution history
        const newLog: ExecutionLog = {
          id: `exec_${Date.now()}`,
          workflowId: 'current',
          workflowName,
          status: executionResult.status,
          startedAt: new Date().toISOString(),
          durationMs: executionResult.durationMs,
          triggerType: customTriggerData ? 'Sự kiện Webhook' : 'Chạy thủ công',
          nodeExecutions: executionResult.results,
          executionOrder: executionResult.executionOrder,
        };

        setExecutionHistory((prev) => [newLog, ...prev.slice(0, 49)]);
      } catch (err: any) {
        setExecutionLogs((prev) => [...prev, `❌ Lỗi thực thi quy trình: ${err.message}`]);
      } finally {
        setIsRunning(false);
      }
    },
    [isRunning, nodes, edges, workflowName, setNodes]
  );

  // Test a single node
  const handleTestSingleNode = useCallback(
    async (node: Node, customInput?: any) => {
      setIsTestingSingleNode(true);
      const runner = new WorkflowRunner(nodes, edges);

      const logs: string[] = [];
      try {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id ? { ...n, data: { ...n.data, status: 'running' } } : n
          )
        );

        const inputPayload = customInput || (node.data as any)?.inputData || (node.data as any)?.parameters?.samplePayload || { test: true };
        const output = await runner.executeSingleNode(node, inputPayload, logs);

        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    status: 'success',
                    inputData: inputPayload,
                    outputData: output,
                    error: undefined,
                  },
                }
              : n
          )
        );

        setExecutionLogs((prev) => [
          ...prev,
          `⚡ Kiểm tra bước đơn trên node [${node.data.label || node.id}] thành công.`,
          ...logs,
        ]);
      } catch (err: any) {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    status: 'error',
                    error: err.message,
                  },
                }
              : n
          )
        );
        setExecutionLogs((prev) => [
          ...prev,
          `❌ Kiểm tra bước đơn thất bại trên node [${node.data.label || node.id}]: ${err.message}`,
        ]);
      } finally {
        setIsTestingSingleNode(false);
      }
    },
    [nodes, edges, setNodes]
  );

  // Load a template
  const handleSelectTemplate = useCallback(
    (template: Workflow) => {
      setWorkflowName(template.name);
      setIsActive(template.active);
      setActiveTemplateId(template.id);
      if (template.webhookId) {
        setWebhookId(template.webhookId);
      }
      setNodes(template.nodes as Node[]);
      setEdges(template.edges as Edge[]);
      setSelectedNodeId(null);
      setExecutionLogs([
        `📦 Đã tải quy trình mẫu: ${template.name}`,
        'Sẵn sàng để thực thi hoặc tùy biến theo nhu cầu.',
      ]);
    },
    [setNodes, setEdges]
  );

  // Export Workflow JSON
  const handleExportWorkflowJson = useCallback(() => {
    const workflowData: Workflow = {
      id: `wf_${Date.now()}`,
      name: workflowName,
      description: 'Xuất từ PyFlow Studio',
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        label: e.label as string,
        animated: e.animated,
      })),
      active: isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      webhookId,
    };

    const blob = new Blob([JSON.stringify(workflowData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'workflow'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [workflowName, nodes, edges, isActive, webhookId]);

  // Import Workflow JSON
  const handleImportWorkflowJson = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (json.nodes && json.edges) {
            setWorkflowName(json.name || 'Quy trình đã nhập');
            setNodes(json.nodes);
            setEdges(json.edges);
            if (json.webhookId) setWebhookId(json.webhookId);
            setExecutionLogs((prev) => [
              ...prev,
              `✅ Đã nhập quy trình "${json.name || 'Quy trình'}" với ${json.nodes.length} nodes.`,
            ]);
          } else {
            alert('Cấu trúc tệp JSON quy trình không hợp lệ. Thiếu danh sách nodes hoặc edges.');
          }
        } catch (err: any) {
          alert(`Không thể đọc tệp JSON: ${err.message}`);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [setNodes, setEdges]);

  // Reset Workflow
  const handleResetWorkflow = useCallback(() => {
    if (confirm('Bạn có chắc chắn muốn làm mới toàn bộ canvas?')) {
      setNodes([]);
      setEdges([]);
      setSelectedNodeId(null);
      setExecutionLogs(['Vùng canvas đã được làm mới. Kéo thả các node từ thanh công cụ bên trái để bắt đầu.']);
    }
  }, [setNodes, setEdges]);

  // Trigger from Webhook Tester Modal
  const handleTriggerFromWebhook = useCallback(
    async (payload: any) => {
      await fetch(`/api/webhook/${webhookId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      fetchWebhookEvents();
      await handleRunWorkflow(payload);
    },
    [webhookId, fetchWebhookEvents, handleRunWorkflow]
  );

  return (
    <div id="pyflow-app-root" className="w-screen h-screen flex flex-col bg-slate-100 overflow-hidden font-sans text-gray-900">
      {/* Top Navbar */}
      <TopNavbar
        workflowName={workflowName}
        onUpdateWorkflowName={setWorkflowName}
        isActive={isActive}
        onToggleActive={() => setIsActive(!isActive)}
        isRunning={isRunning}
        onRunWorkflow={() => handleRunWorkflow()}
        onOpenPythonExport={() => setIsPythonModalOpen(true)}
        onOpenArchitecture={() => setIsArchModalOpen(true)}
        onOpenWebhookModal={() => setIsWebhookModalOpen(true)}
        onOpenTemplates={() => setIsTemplatesModalOpen(true)}
        onExportWorkflowJson={handleExportWorkflowJson}
        onImportWorkflowJson={handleImportWorkflowJson}
        onResetWorkflow={handleResetWorkflow}
      />

      {/* Main Workspace Area (Sidebar + Flow Canvas + Node Config Drawer) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Node Palette Sidebar */}
        <Sidebar
          onOpenTemplates={() => setIsTemplatesModalOpen(true)}
          onOpenCredentials={() => setIsCredentialsModalOpen(true)}
          onOpenArchitecture={() => setIsArchModalOpen(true)}
        />

        {/* Center Flow Canvas */}
        <FlowCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          setNodes={setNodes}
          setEdges={setEdges}
          onSelectNode={handleSelectNode}
          selectedNodeId={selectedNodeId}
        />

        {/* Right Node Configuration & Data Panel */}
        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            onClose={() => setSelectedNodeId(null)}
            onUpdateNodeData={handleUpdateNodeData}
            onDeleteNode={handleDeleteNode}
            onTestSingleNode={handleTestSingleNode}
            isTesting={isTestingSingleNode}
          />
        )}
      </div>

      {/* Bottom Collapsible Console */}
      <BottomConsole
        logs={executionLogs}
        executionHistory={executionHistory}
        webhookEvents={webhookEvents}
        onClearLogs={() => setExecutionLogs([])}
        onRefreshWebhooks={fetchWebhookEvents}
        onSendSampleWebhook={() => setIsWebhookModalOpen(true)}
      />

      {/* Modals */}
      <PythonExportModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
        pythonScript={generatedPythonScript}
        workflowName={workflowName}
      />

      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />

      <WebhookModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        webhookId={webhookId}
        onTriggerWebhook={handleTriggerFromWebhook}
      />

      <TemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        activeTemplateId={activeTemplateId}
      />

      <CredentialsModal
        isOpen={isCredentialsModalOpen}
        onClose={() => setIsCredentialsModalOpen(false)}
      />
    </div>
  );
}
