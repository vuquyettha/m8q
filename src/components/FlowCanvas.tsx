import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowInstance,
} from '@xyflow/react';
import { CustomNode } from './CustomNode';
import { NODE_DEFINITIONS } from '../data/nodeDefinitions';
import { NodeType } from '../types';

const nodeTypes = {
  custom: CustomNode,
};

interface FlowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onSelectNode: (node: Node | null) => void;
  selectedNodeId: string | null;
}

export const FlowCanvas: React.FC<FlowCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  setNodes,
  setEdges,
  onSelectNode,
  selectedNodeId,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = React.useState<ReactFlowInstance | null>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        ...params,
        id: `e_${params.source}_${params.sourceHandle || 'def'}_${params.target}_${Date.now()}`,
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2.5 },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/pyflow-node-type') as NodeType;
      if (!type || !reactFlowInstance || !reactFlowWrapper.current) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const nodeDef = NODE_DEFINITIONS[type] || NODE_DEFINITIONS.manual;

      // Extract default parameters
      const defaultParams: Record<string, any> = {};
      nodeDef.parameters.forEach((param) => {
        if (param.default !== undefined) {
          defaultParams[param.name] = param.default;
        }
      });

      const newNode: Node = {
        id: `node_${type}_${Date.now().toString(36)}`,
        type: 'custom',
        position,
        data: {
          label: nodeDef.label,
          nodeType: type,
          category: nodeDef.category,
          description: nodeDef.description,
          parameters: defaultParams,
          status: 'idle',
        },
      };

      setNodes((nds) => nds.concat(newNode));
      onSelectNode(newNode);
    },
    [reactFlowInstance, setNodes, onSelectNode]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onSelectNode(node);
    },
    [onSelectNode]
  );

  const onPaneClick = useCallback(() => {
    onSelectNode(null);
  }, [onSelectNode]);

  return (
    <div id="flow-canvas-container" className="w-full h-full flex-1 relative bg-slate-50" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid={true}
        snapGrid={[16, 16]}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2.5 },
        }}
      >
        <Controls position="bottom-left" className="!bg-white !border !border-gray-200 !rounded-lg !shadow-sm !overflow-hidden" />
        <MiniMap
          position="bottom-right"
          nodeColor={(n: any) => {
            switch (n.data?.category) {
              case 'trigger': return '#10b981';
              case 'action': return '#0284c7';
              case 'logic': return '#f59e0b';
              case 'ai': return '#9333ea';
              case 'output': return '#f43f5e';
              default: return '#6366f1';
            }
          }}
          className="!bg-white !border !border-gray-200 !rounded-lg !shadow-sm"
          maskColor="rgba(241, 245, 249, 0.7)"
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="#cbd5e1" />
      </ReactFlow>
    </div>
  );
};
