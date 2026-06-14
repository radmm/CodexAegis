export interface ServerNode {
  id: string;
  name: string;
  type: 'gateway' | 'auth' | 'billing' | 'database';
  status: 'healthy' | 'compromised' | 'under-attack' | 'patched';
  ip: string;
  load: number;
}

export interface SimulationStep {
  id: string;
  agent: 'chaos' | 'observability' | 'patcher' | 'git';
  message: string;
  timestamp: string;
  status: 'pending' | 'active' | 'success' | 'failed';
  codeSnippet?: {
    filePath: string;
    lineStart: number;
    originalCode: string;
    patchedCode?: string;
  };
}

export interface SimulationResult {
  vulnerability: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cvePlaceholder: string;
  attackLog: string;
  detectiveTelemetry: string;
  patchDiff: string;
  pullRequest: {
    title: string;
    branch: string;
    body: string;
  };
}
