export type NodeCategory = 'trigger' | 'action' | 'logic' | 'ai' | 'output';

export type NodeType =
  | 'webhook'
  | 'schedule'
  | 'manual'
  | 'httpRequest'
  | 'filter'
  | 'pythonCode'
  | 'transform'
  | 'arrayIterator'
  | 'email'
  | 'telegram'
  | 'geminiAI'
  | 'database';

export type ExecutionStatus = 'idle' | 'running' | 'success' | 'error' | 'skipped';

export interface NodeParameter {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'code' | 'json' | 'textarea' | 'key-value' | 'conditions';
  default?: any;
  options?: { label: string; value: any }[];
  placeholder?: string;
  description?: string;
  language?: string;
}

export interface NodeDefinition {
  type: NodeType;
  label: string;
  description: string;
  category: NodeCategory;
  icon: string;
  color: string;
  inputs: { id: string; label?: string }[];
  outputs: { id: string; label?: string; description?: string }[];
  parameters: NodeParameter[];
  defaultData?: Record<string, any>;
}

export interface CustomNodeData {
  label: string;
  nodeType: NodeType;
  category: NodeCategory;
  description?: string;
  parameters: Record<string, any>;
  status?: ExecutionStatus;
  executionTimeMs?: number;
  inputData?: any;
  outputData?: any;
  error?: string;
  itemCount?: number;
  retryConfig?: {
    maxRetries: number;
    retryIntervalMs: number;
    continueOnFail: boolean;
  };
  [key: string]: any;
}

export interface FilterCondition {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'exists' | 'regex';
  value: any;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  label?: string;
  animated?: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: any[];
  edges: WorkflowEdge[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  scheduleCron?: string;
  webhookId?: string;
}

export interface NodeExecutionResult {
  nodeId: string;
  nodeName: string;
  nodeType: NodeType;
  status: ExecutionStatus;
  startedAt: string;
  durationMs: number;
  input: any;
  output: any;
  error?: string;
  logs: string[];
}

export interface ExecutionLog {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'success' | 'failed' | 'running';
  startedAt: string;
  finishedAt?: string;
  durationMs: number;
  triggerType: string;
  nodeExecutions: Record<string, NodeExecutionResult>;
  executionOrder: string[];
}

export interface Credential {
  id: string;
  name: string;
  type: 'apiKey' | 'oauth2' | 'smtp' | 'bearer' | 'basic';
  data: Record<string, string>;
  createdAt: string;
}

export interface WebhookEvent {
  id: string;
  webhookId: string;
  method: string;
  headers: Record<string, string>;
  query: Record<string, any>;
  body: any;
  timestamp: string;
}
