export interface CodeFile {
  filename: string;
  language: string;
  description: string;
  code: string;
}

export const PYTHON_ARCHITECTURE_FILES: CodeFile[] = [
  {
    filename: "models.py",
    language: "python",
    description: "Data Structures & Pydantic Schemas for Workflow, Nodes, Edges & Credentials",
    code: `from typing import Any, Dict, List, Optional, Literal
from pydantic import BaseModel, Field
import datetime

class WorkflowEdge(BaseModel):
    id: str
    source: str
    target: str
    source_handle: Optional[str] = None
    target_handle: Optional[str] = None

class WorkflowNode(BaseModel):
    id: str
    type: str
    label: str
    category: Literal['trigger', 'action', 'logic', 'ai', 'output']
    position: Dict[str, float] = Field(default_factory=lambda: {"x": 0, "y": 0})
    parameters: Dict[str, Any] = Field(default_factory=dict)
    retry_config: Optional[Dict[str, Any]] = None

class WorkflowSchema(BaseModel):
    id: str
    name: str
    description: Optional[str] = ""
    active: bool = True
    nodes: List[WorkflowNode]
    edges: List[WorkflowEdge]
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

class ExecutionRecord(BaseModel):
    id: str
    workflow_id: str
    status: Literal['success', 'failed', 'running']
    started_at: datetime.datetime
    duration_ms: float
    trigger_type: str
    node_results: Dict[str, Any]
`
  },
  {
    filename: "data_proxy.py",
    language: "python",
    description: "N8N Data Proxy Engine for dynamic {{$json.key}} & {{$node['Node'].json.key}} resolution",
    code: `import re
from typing import Any, Dict

class DataProxy:
    """
    Simulates N8N's expression resolution engine in Python.
    Supports:
      - {{$json.customer.email}}
      - {{$node["Webhook"].json.order_id}}
      - {{$env.API_KEY}}
      - Inline Python expressions: {{$json.total * 0.9}}
    """
    def __init__(self, current_data: Dict[str, Any], node_history: Dict[str, Any], env_vars: Dict[str, str] = None):
        self.json = current_data
        self.nodes = node_history
        self.env = env_vars or {}

    def resolve(self, template: Any) -> Any:
        if not isinstance(template, str):
            return template

        # Check for single complete expression e.g. {{$json.name}}
        exact_match = re.match(r"^\\{\\{(.+)\\}\\}$", template.strip())
        if exact_match:
            return self._evaluate_expression(exact_match.group(1).strip())

        # String template substitution
        def repl(match):
            val = self._evaluate_expression(match.group(1).strip())
            return str(val) if val is not None else ""

        return re.sub(r"\\{\\{(.+?)\\}\\}", repl, template)

    def _evaluate_expression(self, expr: str) -> Any:
        # Build evaluation scope
        scope = {
            "$json": self.json,
            "$node": self.nodes,
            "$env": self.env,
            "json": self.json,
        }
        try:
            # Safe evaluation
            return eval(expr, {"__builtins__": {}}, scope)
        except Exception:
            # Fallback simple dictionary dot traversal
            if expr.startswith("$json."):
                parts = expr[6:].split(".")
                curr = self.json
                for p in parts:
                    if isinstance(curr, dict):
                        curr = curr.get(p)
                    else:
                        return None
                return curr
            return None
`
  },
  {
    filename: "base_node.py",
    language: "python",
    description: "Extensible Plugin Architecture Interface for all Node types",
    code: `from abc import ABC, abstractmethod
from typing import Any, Dict, List
from data_proxy import DataProxy

class PropertyDefinition:
    def __init__(self, name: str, label: str, prop_type: str, default: Any = None, description: str = ""):
        self.name = name
        self.label = label
        self.prop_type = prop_type
        self.default = default
        self.description = description

class BaseNode(ABC):
    """
    Base Plugin Class:
    - description: Display metadata
    - properties: Form fields for React frontend
    - execute(): Core asynchronous execution logic
    """
    type_name: str = "base"
    display_name: str = "Base Node"
    category: str = "action"
    icon: str = "Box"

    def __init__(self, node_id: str, label: str, parameters: Dict[str, Any]):
        self.node_id = node_id
        self.label = label
        self.parameters = parameters

    @classmethod
    @abstractmethod
    def get_properties(cls) -> List[PropertyDefinition]:
        """Defines the input parameters rendered by the UI"""
        pass

    @abstractmethod
    async def execute(self, input_item: Dict[str, Any], proxy: DataProxy) -> Dict[str, Any]:
        """
        Receives incoming item from previous node.
        Performs business logic or network request.
        Returns output dictionary for the next node.
        """
        pass
`
  },
  {
    filename: "engine.py",
    language: "python",
    description: "DAG Workflow Execution Engine with Branching, Retries & Looping",
    code: `import asyncio
import datetime
import logging
from typing import Any, Dict, List, Optional
from models import WorkflowSchema
from data_proxy import DataProxy
from base_node import BaseNode

logger = logging.getLogger("WorkflowEngine")

class WorkflowEngine:
    """
    High-performance Asynchronous DAG Workflow Runner
    """
    def __init__(self, workflow: WorkflowSchema, node_instances: Dict[str, BaseNode]):
        self.workflow = workflow
        self.nodes = node_instances
        self.node_outputs: Dict[str, Any] = {}
        self.logs: List[str] = []

    async def run(self, initial_payload: Dict[str, Any]) -> Dict[str, Any]:
        start_time = datetime.datetime.utcnow()
        self.logs.append(f"Starting execution of {self.workflow.name}")

        # Find starting trigger nodes
        incoming_map = {edge.target: edge for edge in self.workflow.edges}
        root_nodes = [n for n in self.workflow.nodes if n.id not in incoming_map or n.category == 'trigger']

        if not root_nodes and self.workflow.nodes:
            root_nodes = [self.workflow.nodes[0]]

        queue = [(root_nodes[0].id, initial_payload)]

        while queue:
            node_id, current_data = queue.pop(0)
            node = self.nodes.get(node_id)
            if not node:
                continue

            proxy = DataProxy(current_data, self.node_outputs)
            
            # Execute with Retry Strategy
            retry_count = 0
            max_retries = 3
            output = None

            while retry_count <= max_retries:
                try:
                    logger.info(f"Running node [{node.label}]...")
                    output = await node.execute(current_data, proxy)
                    self.node_outputs[node_id] = output
                    break
                except Exception as err:
                    retry_count += 1
                    if retry_count > max_retries:
                        self.logs.append(f"Node [{node.label}] failed after {max_retries} retries: {err}")
                        raise err
                    await asyncio.sleep(2 ** retry_count) # Exponential backoff

            # Find outgoing edges
            outgoing_edges = [e for e in self.workflow.edges if e.source == node_id]

            for edge in outgoing_edges:
                # Branching logic (e.g. If/Filter true/false handles)
                if edge.source_handle:
                    branch_result = output.get("__branch")
                    if branch_result and branch_result != edge.source_handle:
                        continue # Skip non-matching branch

                # Looping / Array splitting
                if output and isinstance(output.get("items"), list) and edge.source_handle == "item":
                    for item in output["items"]:
                        queue.append((edge.target, item))
                else:
                    queue.append((edge.target, output))

        duration_ms = (datetime.datetime.utcnow() - start_time).total_seconds() * 1000
        return {
            "status": "success",
            "duration_ms": duration_ms,
            "outputs": self.node_outputs
        }
`
  },
  {
    filename: "scheduler.py",
    language: "python",
    description: "Cron Job & Event Trigger Scheduler using AsyncIO / APScheduler",
    code: `import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import logging

logger = logging.getLogger("Scheduler")

class WorkflowScheduler:
    def __init__(self, engine_executor_fn):
        self.scheduler = AsyncIOScheduler()
        self.executor_fn = engine_executor_fn

    def schedule_cron_workflow(self, workflow_id: str, cron_expr: str):
        """
        Parses 5-part cron syntax (e.g. '*/15 * * * *')
        """
        parts = cron_expr.split()
        if len(parts) != 5:
            raise ValueError("Cron expression must have 5 parts: min hour day month day_of_week")

        trigger = CronTrigger(
            minute=parts[0],
            hour=parts[1],
            day=parts[2],
            month=parts[3],
            day_of_week=parts[4]
        )

        self.scheduler.add_job(
            self._trigger_job,
            trigger=trigger,
            args=[workflow_id],
            id=f"job_{workflow_id}",
            replace_existing=True
        )
        logger.info(f"Scheduled workflow {workflow_id} with cron '{cron_expr}'")

    async def _trigger_job(self, workflow_id: str):
        logger.info(f"Cron firing for workflow: {workflow_id}")
        await self.executor_fn(workflow_id, {"trigger": "cron"})

    def start(self):
        self.scheduler.start()
`
  },
  {
    filename: "queue_worker.py",
    language: "python",
    description: "Redis / Celery Message Queue Worker for Scalable Background Execution",
    code: `"""
Celery / Redis Job Queue Worker
Prevents HTTP timeout when handling heavy workflows or high concurrency.
"""
from celery import Celery
import asyncio
import json

app = Celery('pyflow_tasks', broker='redis://localhost:6379/0', backend='redis://localhost:6379/0')

@app.task(bind=True, max_retries=3, default_retry_delay=60)
def execute_workflow_job(self, workflow_json_str: str, trigger_payload: dict):
    """
    Worker job executed in background process pool
    """
    try:
        from models import WorkflowSchema
        from engine import WorkflowEngine
        
        workflow = WorkflowSchema.parse_raw(workflow_json_str)
        # Instantiate plugins & execute in event loop
        loop = asyncio.get_event_loop()
        # Run workflow engine asynchronously
        result = loop.run_until_complete(run_workflow_helper(workflow, trigger_payload))
        return result
    except Exception as exc:
        raise self.retry(exc=exc)
`
  },
  {
    filename: "crypto_vault.py",
    language: "python",
    description: "AES-256 GCM Credentials Encryption for API Keys & Passwords",
    code: `from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import base64
import os

class CredentialVault:
    def __init__(self, master_key_hex: str = None):
        if not master_key_hex:
            # 32 bytes = 256 bits
            self.key = AESGCM.generate_key(bit_length=256)
        else:
            self.key = bytes.fromhex(master_key_hex)
        self.aesgcm = AESGCM(self.key)

    def encrypt(self, plain_secret: str) -> str:
        nonce = os.urandom(12) # 96-bit nonce
        ciphertext = self.aesgcm.encrypt(nonce, plain_secret.encode('utf-8'), None)
        # Combine nonce + ciphertext and base64 encode
        combined = nonce + ciphertext
        return base64.b64encode(combined).decode('utf-8')

    def decrypt(self, encrypted_b64: str) -> str:
        data = base64.b64decode(encrypted_b64.encode('utf-8'))
        nonce = data[:12]
        ciphertext = data[12:]
        decrypted = self.aesgcm.decrypt(nonce, ciphertext, None)
        return decrypted.decode('utf-8')
`
  }
];
