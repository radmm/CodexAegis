import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, ShieldAlert, Cpu, Terminal, GitBranch, 
  RefreshCw, FileCode, Check, Copy, ShieldCheck,
  Server, Database, Network, Key, Layers, ArrowRight, Zap, AlertTriangle
} from 'lucide-react';
import { ServerNode, SimulationStep } from './types';

export default function App() {
  const [repoUrl, setRepoUrl] = useState('https://github.com/devops-hq/secure-express-demo');
  const [vulnType, setVulnType] = useState('auth-service-sql-injection');
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [logs, setLogs] = useState<string[]>([
    '[OBS_TELEMETRY] ⚠️ BREACH ALERT: Critical SQL Injection vulnerability detected in active production thread!',
    '[DETECTION] Hacked Node: AUTH LAYER (10.0.0.5) is currently in a COMPROMISED state.',
    '[VULNERABILITY] File: "src/services/auth.ts" -> Direct dynamic string concatenation allows dynamic bypass injection.',
    `[SUGGESTION] Click "INITIATE SECURITY CYCLE ⚡" below to run the simulation lab, or switch to the "Autonomous Patch Pipeline" (Tab B) to resolve multiple issues sequentially.`
  ]);
  const [selectedNode, setSelectedNode] = useState<string>('auth-node');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPr, setCopiedPr] = useState(false);
  const [simResults, setSimResults] = useState<any>(null);
  const [fixedCount, setFixedCount] = useState(4); // Starts at 4 as per design specs
  const [connectedRepo, setConnectedRepo] = useState('secure-express-demo');

  // NEW: Atomic Remediation state variables
  const [activeTab, setActiveTab] = useState<'single' | 'atomic'>('single');
  const [isAtomicSimulating, setIsAtomicSimulating] = useState(false);
  const [atomicStepIndex, setAtomicStepIndex] = useState(-1);
  const [atomicLogs, setAtomicLogs] = useState<string[]>([
    '[SYSTEM] Atomic pipeline controller is online. Deploy prioritized fixes with sequential sandbox verification rules.'
  ]);
  const [activeAtomicIssueIndex, setActiveAtomicIssueIndex] = useState<number>(-1);
  const [atomicSuccess, setAtomicSuccess] = useState(false);
  
  const [atomicIssues, setAtomicIssues] = useState([
    {
      id: 'sqli',
      title: 'SQL Injection Dynamic Login Concat',
      file: 'src/services/auth.ts',
      severity: 'CRITICAL',
      status: 'pending' as 'pending' | 'scanning' | 'validating' | 'patched' | 'failed',
      pr: 'PR #401',
      prBranch: 'security/mitigate-sqli-priority-1',
      prTitle: 'security: refactor dynamic SQL login bindings',
      patch: `// Secured Parameterized Query
const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
const [rows] = await db.execute(query, [username, password]);`,
      original: `const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";\nconst [rows] = await db.query(query);`,
      testOutput: `✔ Database parameter binding match checks ... passed\n✔ SQLi payload bypass penetration test ... blocked (403)\n✔ Single-module compiler check ... success`
    },
    {
      id: 'rate',
      title: 'Missing Throughput Throttling on Checkout API',
      file: 'src/api/gateway.ts',
      severity: 'HIGH',
      status: 'pending' as 'pending' | 'scanning' | 'validating' | 'patched' | 'failed',
      pr: 'PR #402',
      prBranch: 'security/enforce-checkout-throttling-priority-2',
      prTitle: 'security: enforce token-bucket rate limiter parameters',
      patch: `// Secured Rate Limiting Middleware
import rateLimit from 'express-rate-limit';
export const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 10,
  message: 'Checkout frequency limit reached'
});`,
      original: `// High risk checkout node with zero traffic controls\napp.post('/api/checkout', (req, res) => {\n  processPaymentCharge(req.body);\n});`,
      testOutput: `✔ Concurrency stress test (1000 reqs/sec) ... rate limited safely\n✔ Memory leak profiling ... verified stable (0.01s)\n✔ Route compiler check ... success`
    },
    {
      id: 'cookies',
      title: 'Missing HttpOnly Header on Session Cookie',
      file: 'src/index.ts',
      severity: 'MEDIUM',
      status: 'pending' as 'pending' | 'scanning' | 'validating' | 'patched' | 'failed',
      pr: 'PR #403',
      prBranch: 'security/strict-httponly-session-priority-3',
      prTitle: 'security: append strict HttpOnly and secure headers to credentials',
      patch: `// Secured Cookie Flags
res.cookie('adminSession', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});`,
      original: `res.cookie('adminSession', token, {\n  httpOnly: false\n});`,
      testOutput: `✔ XSS script privilege exposure test ... protected\n✔ Compliance header audit ... Passed (Security A+)\n✔ Main bundle compiler check ... success`
    }
  ]);

  // Multi-agent server nodes in Neo-Brutalist cartoon structure
  const [nodes, setNodes] = useState<ServerNode[]>([
    { id: 'gw-node', name: 'API GATEWAY', type: 'gateway', status: 'healthy', ip: '10.0.0.1', load: 15 },
    { id: 'auth-node', name: 'AUTH LAYER', type: 'auth', status: 'compromised', ip: '10.0.0.5', load: 95 },
    { id: 'billing-node', name: 'BILLING SERVICE', type: 'billing', status: 'healthy', ip: '10.0.0.12', load: 8 },
    { id: 'db-node', name: 'SECURE CORE DB', type: 'database', status: 'healthy', ip: '10.0.0.24', load: 20 },
  ]);

  const [steps, setSteps] = useState<SimulationStep[]>([]);

  // Parse repo name dynamically
  useEffect(() => {
    try {
      const parts = repoUrl.split('/');
      const last = parts[parts.length - 1] || 'repo-sandbox';
      setConnectedRepo(last.replace('.git', ''));
    } catch {
      setConnectedRepo('sandbox-repo');
    }
  }, [repoUrl]);

  useEffect(() => {
    const targetFile = vulnType === 'auth-service-sql-injection' ? 'src/services/auth.ts' : 
                       vulnType === 'payment-gateway-race-condition' ? 'src/api/gateway.ts' : 'src/index.ts';
    
    setSteps([
      {
        id: 'chaos',
        agent: 'chaos',
        message: '🐒 Chaos Monkey Agent executing aggressive SQL injection injection sequences.',
        timestamp: '00:01s',
        status: 'pending'
      },
      {
        id: 'observability',
        agent: 'observability',
        message: `👁️ Observability Agent trapping network failures & locating vulnerability in ${targetFile}.`,
        timestamp: '00:05s',
        status: 'pending'
      },
      {
        id: 'patcher',
        agent: 'patcher',
        message: '🔧 Patching Agent synthesizing safe parameterized code remediations side-by-side.',
        timestamp: '00:09s',
        status: 'pending'
      },
      {
        id: 'git',
        agent: 'git',
        message: '🐙 Git Controller validating clean tests and releasing automated patch Pull Request.',
        timestamp: '00:12s',
        status: 'pending'
      }
    ]);
  }, [vulnType]);

  const handleSimulate = async () => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    setCurrentStepIndex(0);
    setCopiedCode(false);
    setCopiedPr(false);
    setLogs(['[BOOT] Initializing Neo-Brutalist DevSecOps Sandbox...', `[GIT] Connected to virtual repository: ${connectedRepo}`, '[TELEMETRY] Booting agents: [Chaos Monkey, Observability, Patch Engine, Git Controller]...']);
    
    // Reset configurations to standard healthy states
    setNodes(nodes.map(n => ({ ...n, status: 'healthy', load: Math.floor(Math.random() * 20) + 10 })));

    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, vulnerabilityType: vulnType })
      });
      const data = await response.json();
      setSimResults(data.aiStats);
    } catch (err) {
      console.error(err);
    }
  };

  // NEW: Atomic Pipeline Orchestrator
  const handleAtomicSimulate = () => {
    if (isAtomicSimulating) return;
    setAtomicSuccess(false);
    setIsAtomicSimulating(true);
    setAtomicStepIndex(0);
    setActiveAtomicIssueIndex(-1);
    
    // Put critical nodes in compromised threat state initially to signify "Detected" state
    setNodes([
      { id: 'gw-node', name: 'API GATEWAY', type: 'gateway', status: 'compromised', ip: '10.0.0.1', load: 88 },
      { id: 'auth-node', name: 'AUTH LAYER', type: 'auth', status: 'compromised', ip: '10.0.0.5', load: 85 },
      { id: 'billing-node', name: 'BILLING SERVICE', type: 'billing', status: 'compromised', ip: '10.0.0.12', load: 92 },
      { id: 'db-node', name: 'SECURE CORE DB', type: 'database', status: 'healthy', ip: '10.0.0.24', load: 30 },
    ]);

    setAtomicIssues(prev => prev.map(issue => ({ ...issue, status: 'scanning' })));
    setAtomicLogs([
      '[ATOMIC_CORE] Activated Autonomous Patch Pipeline workflow...',
      '[ATOMIC_CORE] Objective: Sequence discovered vulnerabilities, build clean separate testing sandboxes, and solicit explicit developer oversight.',
      `[DETECTION] Sweeping "${connectedRepo}" codebase files for active threads...`,
      `[DETECTION] Discovered 3 critical vulnerabilities in workspace folder. Prioritizing queue...`
    ]);
  };

  const handleRollback = (id: string, index: number) => {
    setAtomicIssues(prev => prev.map((issue, idx) => {
      if (idx === index) return { ...issue, status: 'pending' as any };
      return issue;
    }));

    const nodeId = id === 'sqli' ? 'auth-node' : id === 'rate' ? 'billing-node' : 'gw-node';
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: 'compromised', load: 85 } : n));

    setAtomicLogs(prev => [
      ...prev,
      `[ROLLBACK_SANDBOX] Deprecated patch for branch: ${id === 'sqli' ? 'security/mitigate-sqli-priority-1' : id === 'rate' ? 'security/enforce-checkout-throttling-priority-2' : 'security/strict-httponly-session-priority-3'}`,
      `[ROLLBACK_SANDBOX] Original vulnerable code state restored for ${id === 'sqli' ? 'AUTH LAYER' : id === 'rate' ? 'BILLING SERVICE' : 'API GATEWAY'} in isolation.`,
      `[ROLLBACK_SANDBOX] [INTEGRITY_INDEX_OK] Other active hotfixes remain fully locked and audited.`
    ]);

    setFixedCount(c => Math.max(0, c - 1));
  };

  const handleApprovePatch = (idx: number) => {
    const issue = atomicIssues[idx];
    
    // Mark as patched
    setAtomicIssues(prev => prev.map((item, i) => {
      if (i === idx) return { ...item, status: 'patched' as any };
      return item;
    }));

    setFixedCount(c => c + 1);

    if (idx === 0) {
      setAtomicLogs(prev => [
        ...prev,
        `[DEVELOPER_APPROVED] Human-in-the-loop authorization PASSED for SQLi.`,
        `[BRANCH_RELEASE] Published clean branch "${issue.prBranch}" and merged with main.`,
        `[PULL_REQUEST] Released Pull Request: ${issue.pr} "${issue.prTitle}"!`,
        '-------------------------------------------------------------------------------',
        '[ATOMIC_SANDBOX] Automatically moving to Candidate #2: Throttling in "src/api/gateway.ts"...',
        '[ATOMIC_SANDBOX] Booting target compilation sandbox...'
      ]);

      // Transition nodes
      setNodes(prev => prev.map(n => 
        n.id === 'auth-node' ? { ...n, status: 'patched', load: 12 } :
        n.id === 'billing-node' ? { ...n, status: 'under-attack', load: 90 } : n
      ));
      setSelectedNode('billing-node');
      setActiveAtomicIssueIndex(1);

      // Start validation for index 1
      setTimeout(() => {
        setAtomicIssues(prev => prev.map((item, i) => {
          if (i === 1) return { ...item, status: 'validating' as any };
          return item;
        }));
      }, 1000);

    } else if (idx === 1) {
      setAtomicLogs(prev => [
        ...prev,
        `[DEVELOPER_APPROVED] Human-in-the-loop authorization PASSED for API Limiter.`,
        `[BRANCH_RELEASE] Published clean branch "${issue.prBranch}" and merged with main.`,
        `[PULL_REQUEST] Released Pull Request: ${issue.pr} "${issue.prTitle}"!`,
        '-------------------------------------------------------------------------------',
        '[ATOMIC_SANDBOX] Automatically moving to Candidate #3: HttpOnly Cookies in "src/index.ts"...',
        '[ATOMIC_SANDBOX] Booting target compilation sandbox...'
      ]);

      // Transition nodes
      setNodes(prev => prev.map(n => 
        n.id === 'billing-node' ? { ...n, status: 'patched', load: 8 } :
        n.id === 'gw-node' ? { ...n, status: 'under-attack', load: 75 } : n
      ));
      setSelectedNode('gw-node');
      setActiveAtomicIssueIndex(2);

      // Start validation for index 2
      setTimeout(() => {
        setAtomicIssues(prev => prev.map((item, i) => {
          if (i === 2) return { ...item, status: 'validating' as any };
          return item;
        }));
      }, 1000);

    } else if (idx === 2) {
      // Final step complete!
      setAtomicLogs(prev => [
        ...prev,
        `[DEVELOPER_APPROVED] Human-in-the-loop authorization PASSED for HttpOnly config.`,
        `[BRANCH_RELEASE] Published clean branch "${issue.prBranch}" and merged with main.`,
        `[PULL_REQUEST] Released Pull Request: ${issue.pr} "${issue.prTitle}"!`,
        '-------------------------------------------------------------------------------',
        '[ATOMIC_CORE_SUCCESS] All candidate vulnerabilities successfully mitigated block-by-block!',
        '[ATOMIC_CORE_SUCCESS] Multi-issue integration verified (Zero collisions found in compiled sandbox).',
        '[ATOMIC_CORE_SUCCESS] 3 distinct, granular Pull Requests proposed. Audit trail certified. 🚀'
      ]);

      setNodes(prev => prev.map(n => 
        n.id === 'gw-node' ? { ...n, status: 'patched', load: 15 } : n
      ));
      setActiveAtomicIssueIndex(-1);
      setAtomicSuccess(true);
      setIsAtomicSimulating(false);
    }
  };

  useEffect(() => {
    if (atomicStepIndex === -1 || !isAtomicSimulating) return;

    if (atomicStepIndex === 0) {
      const timer = setTimeout(() => {
        // Stage 1: Done with prioritization
        setAtomicIssues(prev => prev.map((issue, idx) => ({
          ...issue,
          status: idx === 0 ? 'validating' as any : 'pending' as any
        })));
        setActiveAtomicIssueIndex(0);
        setSelectedNode('auth-node');
        setNodes(prev => prev.map(n => n.id === 'auth-node' ? { ...n, status: 'under-attack', load: 95 } : n));
        setAtomicLogs(prev => [
          ...prev,
          '[PRIORITIZE_LOCK] Threat queue organized by severity: 1st Rank: SQLi (Critical) | 2nd Rank: Rate-Limiting (High) | 3rd Rank: Cookie Security (Medium).',
          '[ATOMIC_SANDBOX] Booting target compilation sandbox for Candidate #1: SQLi in "src/services/auth.ts"...',
          '[ATOMIC_SANDBOX] Synthesizing isolated parameterized SQL refactor patch...'
        ]);
        setAtomicStepIndex(-2); // scanner finished
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [atomicStepIndex, isAtomicSimulating]);

  useEffect(() => {
    const validatingIndex = atomicIssues.findIndex(issue => issue.status === 'validating');
    if (validatingIndex === -1 || !isAtomicSimulating) return;

    const timer = setTimeout(() => {
      setAtomicIssues(prev => prev.map((issue, idx) => {
        if (idx === validatingIndex) return { ...issue, status: 'awaiting_review' as any };
        return issue;
      }));

      if (validatingIndex === 0) {
        setAtomicLogs(prev => [
          ...prev,
          '[SANDBOX_VERIFICATION] Sandboxed testing suite (mocha specs/auth.test.js) successfully passed!',
          '✔ Database parameter binding match checks ... passed',
          '✔ SQLi payload bypass penetration test ... blocked (403)',
          '[ATOMIC_STABILITY] Sandbox builds intact. 100% regression score.',
          '[HUMAN_INPUT_GATE] 🖲 Gated Bridge: Awaiting human reviewer confirmation to officially release PR...'
        ]);
      } else if (validatingIndex === 1) {
        setAtomicLogs(prev => [
          ...prev,
          '[SANDBOX_VERIFICATION] Sandboxed testing suite (jest specs/gateway.test.js) successfully passed!',
          '✔ Concurrency stress test (1000 reqs/sec) ... rate limited safely',
          '✔ Memory leak profiling ... verified stable (0.01s)',
          '[ATOMIC_STABILITY] Sandbox builds intact. No concurrent thread locks detected.',
          '[HUMAN_INPUT_GATE] 🖲 Gated Bridge: Awaiting human reviewer confirmation to officially release PR...'
        ]);
      } else if (validatingIndex === 2) {
        setAtomicLogs(prev => [
          ...prev,
          '[SANDBOX_VERIFICATION] Sandboxed compliance header audits successfully passed!',
          '✔ XSS script privilege exposure test ... protected',
          '✔ Session header validation ... Passed (Security Grade: A+)',
          '[ATOMIC_STABILITY] Sandbox builds intact. All authorization cookies locked securely.',
          '[HUMAN_INPUT_GATE] 🖲 Gated Bridge: Awaiting human reviewer confirmation to officially release PR...'
        ]);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [atomicIssues, isAtomicSimulating]);

  useEffect(() => {
    if (currentStepIndex === -1 || !isSimulating) return;

    const timer = setTimeout(() => {
      const currentStepId = steps[currentStepIndex]?.id;
      
      setSteps(prev => prev.map((s, idx) => {
        if (idx === currentStepIndex) return { ...s, status: 'success' };
        if (idx === currentStepIndex + 1) return { ...s, status: 'active' };
        return s;
      }));

      if (currentStepId === 'chaos') {
        const affectedNodeId = vulnType === 'auth-service-sql-injection' ? 'auth-node' :
                               vulnType === 'payment-gateway-race-condition' ? 'billing-node' : 'gw-node';
        
        // Penetration established visual shift
        setNodes(prev => prev.map(n => 
          n.id === affectedNodeId ? { ...n, status: 'compromised', load: 99 } : n
        ));
        setSelectedNode(affectedNodeId);

        // Append high-entropy Chaos logs directly from prompt instructions
        const customLogs = simResults?.chaosMonkeyLogs?.split('\n') || [
          `[INFO] Initiating security simulation on login handler.`,
          `[DEBUG] Dispatching payload to authentication endpoint: user='admin' OR '1'='1'`,
          `[INFO] Backend executed query: SELECT * FROM users WHERE username = 'admin' OR '1'='1' AND password = 'any'`,
          `[WARN] SQL statement logic bypassed. Authentication success status returned.`,
          `[ALERT] Node security breach confirmed: simulated administrative privilege escalation.`,
          `[INFO] Simulation concluded. Logging results to security dashboard.`
        ];
        setLogs(prev => [...prev, ...customLogs]);

      } else if (currentStepId === 'observability') {
        const affectedNodeId = vulnType === 'auth-service-sql-injection' ? 'auth-node' :
                               vulnType === 'payment-gateway-race-condition' ? 'billing-node' : 'gw-node';
        setNodes(prev => prev.map(n => 
          n.id === affectedNodeId ? { ...n, status: 'under-attack' } : n
        ));

        const obsText = simResults?.observabilityAnalysis || `The vulnerability is located in 'src/services/auth.ts' inside the 'loginUser' function. Line 2 performs direct string concatenation.`;
        setLogs(prev => [
          ...prev,
          `[OBS_TELEMETRY] Threat detected in active thread stack trace!`,
          `[OBS_TELEMETRY] Analysis Output: ${obsText}`
        ]);

      } else if (currentStepId === 'patcher') {
        const patchLogs = [
          `[PATCH_BOT] Auto-synthesizing param patch schemas...`,
          `[PATCH_BOT] Refactoring with secure parameterized variable bindings.`
        ];
        setLogs(prev => [...prev, ...patchLogs]);

      } else if (currentStepId === 'git') {
        const affectedNodeId = vulnType === 'auth-service-sql-injection' ? 'auth-node' :
                               vulnType === 'payment-gateway-race-condition' ? 'billing-node' : 'gw-node';
        setNodes(prev => prev.map(n => 
          n.id === affectedNodeId ? { ...n, status: 'patched', load: 14 } : n
        ));

        setLogs(prev => [
          ...prev,
          `[BUILD-TESTS] npm test --all-coverage ... OK`,
          `[GIT-CONTROLLER] PR opened: ${simResults?.pullRequestTitle || 'fix: secured authentication parameter query'}`
        ]);
        
        setFixedCount(c => c + 1);
        setIsSimulating(false);
      }

      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      } else {
        setCurrentStepIndex(-1);
      }

    }, 3200);

    return () => clearTimeout(timer);

  }, [currentStepIndex, isSimulating, steps, simResults, vulnType]);

  const copyToClipboard = (text: string, isPr: boolean) => {
    navigator.clipboard.writeText(text);
    if (isPr) {
      setCopiedPr(true);
      setTimeout(() => setCopiedPr(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const getNodeStatusBadge = (status: ServerNode['status']) => {
    switch (status) {
      case 'healthy': return 'bg-[#00FF66] border-2 border-black font-extrabold text-[#1A1A1A] text-[9px] px-2 py-0.5 shadow-[2px_2px_0px_#000]';
      case 'compromised': return 'bg-[#FF5c00] border-2 border-black font-extrabold text-white text-[9px] px-2 py-0.5 shadow-[2px_2px_0px_#000] animate-bounce';
      case 'under-attack': return 'bg-[#FFE500] border-2 border-black font-extrabold text-[#1A1A1A] text-[9px] px-2 py-0.5 shadow-[2px_2px_0px_#000]';
      case 'patched': return 'bg-cyan-300 border-2 border-black font-extrabold text-[#1A1A1A] text-[9px] px-2 py-0.5 shadow-[2px_2px_0px_#000]';
    }
  };

  const getStepStatusStyle = (status: SimulationStep['status']) => {
    switch (status) {
      case 'success': return 'bg-[#00FF66] text-black border-4 border-black shadow-[4px_4px_0px_#000]';
      case 'active': return 'bg-[#FFE500] text-black border-4 border-black shadow-[4px_4px_0px_#000] scale-[1.02]';
      default: return 'bg-white text-[#555] border-4 border-black/40 shadow-[2px_2px_0px_rgba(0,0,0,0.2)]';
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FAF6EB] text-[#1A1A1A] p-3 sm:p-6 lg:p-12 overflow-x-hidden selection:bg-[#FFE500] selection:text-black">
      
      {/* Playful Neo-Brutalist cartoonish floating illustration/stickers */}
      <div className="absolute top-10 right-10 opacity-15 pointer-events-none hidden md:block">
        <span className="text-7xl">✦</span>
      </div>
      <div className="absolute bottom-20 left-6 opacity-10 pointer-events-none">
        <span className="text-[120px] font-extrabold tracking-tighter">SEC_DEV</span>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col justify-between min-h-full">
        
        {/* NEO-BRUTALIST OVERSIZED HEADER HEADER */}
        <header className="border-4 border-black bg-white p-4 sm:p-6 md:p-8 shadow-[4px_4px_0px_0px_#1A1A1A] sm:shadow-[8px_8px_0px_0px_#1A1A1A] mb-6 sm:mb-8 md:mb-12 flex flex-col md:flex-row items-center justify-between gap-6 relative">
          
          {/* Cartoon style corner badge */}
          <div className="absolute -top-4 -left-4 bg-[#FF5c00] text-white border-2 border-black font-bold uppercase py-0.5 px-3 text-[10px] transform -rotate-3 tracking-widest shadow-[2px_2px_0px_#000]">
            AUTONOMOUS_V1_AGENT
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight uppercase leading-none text-black">
              CodexAegis <span className="text-[10px] sm:text-xs font-mono font-medium lowercase tracking-normal block md:inline md:ml-3 text-neutral-500 bg-neutral-100 border border-black/10 px-2 py-0.5 mt-2 md:mt-0">chaos core dev-sec-ops</span>
            </h1>
            <p className="text-xs uppercase font-mono mt-3 tracking-widest text-[#555] font-bold">
              Autonomous Exploit Testing, Observability Diagnostics & Automated Code Pull-Requests
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-[10px] uppercase tracking-wider font-bold">
            <div className="bg-[#FFE500] border-2 border-black px-3 py-1.5 shadow-[3px_3px_0px_#000]">
              SYS_AGENTS: 04 ACTIVE
            </div>
            <div className="bg-[#00FF66] border-2 border-black px-3 py-1.5 shadow-[3px_3px_0px_#000]">
              SANDBOX_ENCLAVE: PORT 3000
            </div>
          </div>
        </header>

        {/* NEO-BRUTALIST LIVE INPUT REPO TARGET BAR */}
        <section className="border-4 border-black bg-white p-4 sm:p-6 shadow-[4px_4px_0px_0px_#1A1A1A] sm:shadow-[8px_8px_0px_0px_#1A1A1A] mb-6 sm:mb-8 flex flex-col lg:flex-row items-center gap-4 sm:gap-6">
          
          {/* Input repo container */}
          <div className="w-full lg:flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="bg-black text-[#FFE500] px-4 py-2 font-black text-xs uppercase border-2 border-black block select-none text-center sm:text-left shrink-0">
              REPOSITORY_PATH
            </div>
            <input 
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={isSimulating}
              className="flex-1 bg-[#FAF6EB] border-[3px] border-black px-4 py-2.5 font-mono text-xs focus:outline-none focus:bg-white text-black font-bold transition-all disabled:opacity-50"
              placeholder="e.g. https://github.com/my-org/backend-pipeline"
            />
          </div>

          {/* Core scenario selecting drawer */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="bg-black text-white px-4 py-2 font-black text-xs uppercase border-2 border-black block select-none whitespace-normal sm:whitespace-nowrap text-center sm:text-left shrink-0">
              THREAT EXPLOIT SELECTOR
            </div>
            <select
              value={vulnType}
              onChange={(e) => setVulnType(e.target.value)}
              disabled={isSimulating}
              className="bg-[#FFE500] border-[3px] border-black px-4 py-2.5 font-bold text-xs leading-none focus:outline-none text-black cursor-pointer shadow-[3px_3px_0px_#000] hover:translate-y-[-1px] active:translate-y-[1px] disabled:opacity-50 w-full sm:w-auto"
            >
              <option value="auth-service-sql-injection">SQL Injection (auth-service login bypass)</option>
              <option value="payment-gateway-race-condition">Bypass Checkout API Limit</option>
              <option value="session-hijack-insecure-cookie">Session Cookie Missing HttpOnly</option>
            </select>
          </div>

        </section>

        {/* TAB WORKSPACE ACCORDION SWITCHER */}
        <div className="flex flex-col sm:flex-row border-4 border-black bg-white p-1.5 sm:p-2 shadow-[4px_4px_0px_#1A1A1A] sm:shadow-[6px_6px_0px_#1A1A1A] mb-6 sm:mb-8 gap-1.5 sm:gap-2">
          <button
            onClick={() => {
              if (isAtomicSimulating || isSimulating) return;
              setActiveTab('single');
            }}
            disabled={isAtomicSimulating || isSimulating}
            className={`flex-1 py-3 px-4 font-black uppercase text-[11px] tracking-wider border-2 border-black transition-all cursor-pointer ${
              activeTab === 'single'
                ? 'bg-[#FFE500] text-black shadow-[3px_3px_0px_#000]'
                : 'bg-white text-neutral-500 border-transparent hover:bg-neutral-50 hover:text-black'
            }`}
          >
            🔬 Tab A: Live Simulation Lab
          </button>
          <button
            onClick={() => {
              if (isAtomicSimulating || isSimulating) return;
              setActiveTab('atomic');
            }}
            disabled={isAtomicSimulating || isSimulating}
            className={`flex-1 py-3 px-4 font-black uppercase text-[11px] tracking-wider border-2 border-black transition-all cursor-pointer ${
              activeTab === 'atomic'
                ? 'bg-[#FFE500] text-black shadow-[3px_3px_0px_#000]'
                : 'bg-white text-neutral-500 border-transparent hover:bg-neutral-50 hover:text-black'
            }`}
          >
            🌀 Tab B: Autonomous Patch Pipeline
          </button>
        </div>

        {/* SPLIT PRIMARY LIVE FIRE WORKSPACE */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start flex-1 mb-8 sm:mb-12">
          
          {/* LEFT: LIVE NETWORK DIAGRAM MAP REPRESENTING THE REPO (5 Columns) */}
          <section className="lg:col-span-5 flex flex-col gap-6 sm:gap-8">
            
            <div className="border-4 border-black bg-white p-4 sm:p-6 shadow-[4px_4px_0px_0px_#1A1A1A] sm:shadow-[8px_8px_0px_0px_#1A1A1A] flex flex-col gap-4 sm:gap-6 relative">
              
              {/* Cute brute labels */}
              <div className="flex justify-between items-center border-b-[3px] border-black pb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-black flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-black rounded-full inline-block"></span>
                    Interactive Live Repo Diagram
                  </h2>
                  <p className="text-[10px] font-mono opacity-60 mt-0.5">Mapping threat states of repository: index.git</p>
                </div>
                <span className="bg-[#FFE500] text-black border-2 border-black font-extrabold text-[8px] uppercase tracking-wider px-2 py-0.5 shadow-[2px_2px_0px_#000] shrink-0">
                  {connectedRepo}
                </span>
              </div>

              {/* LIVE NETWORK DYNAMIC CONNECTIONS BOX */}
              <div className="border-[3px] border-black bg-[#FAF6EB] p-3 sm:p-6 relative min-h-[260px] sm:min-h-[300px] flex flex-col justify-between overflow-hidden">
                
                {/* Visual Connector Lines in Neo-Brutalist layout */}
                <div className="absolute inset-0 z-0 opacity-10 pointer-events-none handdrawn-dots"></div>
                <div className="absolute left-[50%] top-6 bottom-6 w-[3px] bg-black border-dashed border-l border-black pointer-events-none z-0"></div>
                
                <div className="space-y-3 sm:space-y-4 relative z-10">
                  {nodes.map((node) => {
                    const isSelected = selectedNode === node.id;
                    const isCompromised = node.status === 'compromised';
                    const isUnderAttack = node.status === 'under-attack';
                    const isPatched = node.status === 'patched';

                    return (
                      <div 
                        key={node.id}
                        onClick={() => setSelectedNode(node.id)}
                        className={`border-4 bg-white p-3 sm:p-4 transition-all duration-150 cursor-pointer relative z-10 flex items-center justify-between gap-2 ${
                          isSelected 
                            ? 'border-black bg-[#FFE500] shadow-[4px_4px_0px_#000] -translate-x-1 -translate-y-1' 
                            : 'border-black hover:border-black/80 hover:bg-[#FAF6EB]/60 shadow-[2px_2px_0px_#000]'
                        }`}
                      >
                        {/* Status tag */}
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-none border-2 border-black flex items-center justify-center shrink-0 ${
                            isCompromised ? 'bg-[#FF5c00]' :
                            isUnderAttack ? 'bg-[#FFE500]' :
                            isPatched ? 'bg-cyan-300' : 'bg-white'
                          }`}>
                            {node.type === 'gateway' && <Network className="w-4 h-4 text-black" />}
                            {node.type === 'auth' && <Key className="w-4 h-4 text-black" />}
                            {node.type === 'billing' && <Layers className="w-4 h-4 text-black" />}
                            {node.type === 'database' && <Database className="w-4 h-4 text-black" />}
                          </div>

                          <div>
                            <span className="text-xs font-black tracking-tight block">{node.name}</span>
                            <span className="text-[9px] font-mono opacity-50 block">IP: {node.ip}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={getNodeStatusBadge(node.status)}>
                            {node.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Handdrawn indicator card footer mapping */}
                <div className="border-t-2 border-black pt-3 flex justify-between items-center text-[9px] font-mono uppercase font-bold relative z-10 mt-4">
                  <span>System: Secured Tunnel</span>
                  <span className="text-xs">✦</span>
                  <span>Port Ingress: 3000</span>
                </div>
              </div>

              {/* Exploit Trace Analysis Drawer info */}
              <div className="border-[3px] border-black bg-white p-4 shadow-[4px_4px_0px_#000] flex flex-col gap-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#FF5c00] font-black block">
                  ⚠️ ACTIVE SECURITY THREAT SUMMARY
                </span>
                <div className="text-xs font-bold leading-relaxed">
                  <span className="opacity-60">Status Analysis on: </span>
                  <span className="underline italic">
                    {vulnType === 'auth-service-sql-injection' ? 'SQL injection on dynamic login concat' : 
                     vulnType === 'payment-gateway-race-condition' ? 'Gateway execution limit trace' : 'Session HTTP_Only security flag verification failure'}
                  </span>
                </div>
              </div>

            </div>

          </section>

          {/* RIGHT: SEQUENTIAL PROGRESS / CODE REFACTOR OUTPUT (7 Columns) */}
          <section className="lg:col-span-7 flex flex-col gap-10 font-sans">
            
            {activeTab === 'single' ? (
              <>
                {/* Sequential Steps of Autonomous Multi-Agents */}
                <div className="border-4 border-black bg-white p-4 sm:p-6 shadow-[4px_4px_0px_0px_#1A1A1A] sm:shadow-[8px_8px_0px_0px_#1A1A1A]">
                  <h2 className="text-sm sm:text-lg font-black uppercase text-black border-b-[3px] border-black pb-3 sm:pb-4 mb-4 sm:mb-6 flex items-center gap-2">
                    <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFE500] fill-current stroke-black" />
                    Active Agent Execution Pipeline
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
                    {steps.map((step) => {
                      const isActive = step.status === 'active';
                      const isSuccess = step.status === 'success';

                      return (
                        <div 
                          key={step.id} 
                          className={`p-2.5 sm:p-4 flex flex-col justify-between min-h-[115px] sm:min-h-[140px] transition-all relative ${
                            getStepStatusStyle(step.status)
                          }`}
                        >
                          <div>
                            <span className="text-[8px] sm:text-[9px] tracking-widest font-black uppercase bg-black text-white px-1 py-0.5 border border-black inline-block mb-2 sm:mb-3">
                              {step.agent}
                            </span>
                            <p className="text-[9px] sm:text-[10px] font-bold leading-tight sm:leading-relaxed">{step.message}</p>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/10">
                            <span className="text-[8px] font-mono">{step.timestamp}</span>
                            {isSuccess && <span className="text-[8px] sm:text-[9px] font-extrabold uppercase">Done ✓</span>}
                            {isActive && <span className="text-[8px] sm:text-[9px] font-extrabold uppercase animate-pulse">Run ⏳</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Simulated Live Output Console/Term */}
                <div className="border-4 border-black bg-white p-4 sm:p-6 shadow-[4px_4px_0px_0px_#1A1A1A] sm:shadow-[8px_8px_0px_0px_#1A1A1A] flex flex-col gap-3 sm:gap-4">
                  <div className="flex justify-between items-center border-b-[3px] border-black pb-3">
                    <span className="text-xs uppercase font-mono font-black text-black flex items-center gap-1.5 leading-none">
                      <Terminal className="w-4 h-4 shrink-0" />
                      Live Attack Execution Sandbox Console Logs
                    </span>
                    <button 
                      onClick={() => setLogs(['[SYSTEM] Log system cleared. Trace waiting...'])}
                      className="bg-black text-[9px] font-bold uppercase tracking-wider text-white px-2 py-0.5 border border-black hover:bg-[#FFE500] hover:text-black transition-all shrink-0 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Retro style terminal */}
                  <div className="bg-[#1A1A1A] border-[3px] border-black text-[#FFE500] p-3 sm:p-4 font-mono text-[10px] select-text h-[160px] overflow-y-auto space-y-1.5 relative shadow-inner">
                    {logs.map((log, idx) => (
                      <div key={idx} className="leading-relaxed break-words whitespace-pre-wrap flex items-start">
                        <span className="text-white opacity-40 mr-2 shrink-0 select-none">❯</span>
                        <span>{log}</span>
                      </div>
                    ))}
                    {isSimulating && (
                      <div className="flex items-center gap-2 italic text-[#00FF66] py-1 animate-pulse font-bold break-words whitespace-pre-wrap">
                        <div className="w-2 h-2 rounded-full bg-[#00FF66] shrink-0"></div>
                        Multi-Agent network analyzer tracing sandbox payload parameters...
                      </div>
                    )}
                  </div>
                </div>

                 {/* Remediation Patch Diff output */}
                <AnimatePresence>
                  {simResults && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 relative"
                    >
                      
                      {/* Visual Remediation Editor Mock */}
                      <div className="border-4 border-black bg-white p-4 sm:p-6 shadow-[4px_4px_0px_0px_#1A1A1A] sm:shadow-[6px_6px_0px_0px_#1A1A1A] flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center border-b-2 border-black pb-3 mb-4 gap-2">
                            <span className="text-[10px] uppercase font-mono font-black text-[#FF5c00] leading-none shrink-0">
                              🔨 Patch Schema Generator
                            </span>
                            <button 
                              onClick={() => copyToClipboard(simResults.remediationPatch || '', false)}
                              className="bg-[#FFE500] border-2 border-black text-black font-extrabold text-[8px] uppercase tracking-wider px-2 py-0.5 shadow-[2px_2px_0px_#000] cursor-pointer shrink-0"
                            >
                              {copiedCode ? 'Copied ✓' : 'Copy Remediation'}
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <span className="text-[9px] font-mono opacity-50 block uppercase tracking-wider mb-1 font-bold">
                                Detected Insecure Concatenation:
                              </span>
                              <pre className="bg-[#FF5c00]/10 border-2 border-[#FF5c00] text-red-950 p-2.5 font-mono text-[9px] overflow-x-auto whitespace-pre-wrap break-all">
                                {vulnType === 'auth-service-sql-injection' ? `const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";` :
                                 vulnType === 'payment-gateway-race-condition' ? `const valid = await checkTokenValid(token);\nif (valid) {\n  await processCharge(amount);` :
                                 `res.cookie('adminSession', ... {\n  httpOnly: false\n});`}
                              </pre>
                            </div>

                            <div>
                              <span className="text-[9px] font-mono opacity-50 block uppercase tracking-wider mb-1 font-bold">
                                Remediated Parametrized Code Patch:
                              </span>
                              <pre className="bg-[#00FF66]/10 border-2 border-[#00FF66] text-emerald-950 p-2.5 font-mono text-[9px] overflow-x-auto whitespace-pre-wrap break-all">
                                {simResults.remediationPatch}
                              </pre>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t-2 border-dashed border-black/10 text-[9px] text-[#225035] italic flex items-center gap-1.5 font-bold">
                          <ShieldCheck className="w-4 h-4 text-[#00FF66] fill-[#00FF66] stroke-black shrink-0" />
                          Syntax correct. Code validation passed flawlessly in testing blocks.
                        </div>
                      </div>

                      {/* Pull Request Output Frame */}
                      <div className="border-4 border-black bg-white p-4 sm:p-6 shadow-[4px_4px_0px_0px_#1A1A1A] sm:shadow-[6px_6px_0px_0px_#1A1A1A] flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center border-b-2 border-black pb-3 mb-4 gap-2">
                            <span className="text-[10px] uppercase font-mono font-black text-black leading-none">
                              🐙 Automated Pull Request
                            </span>
                            <span className="bg-black text-white text-[8px] font-mono font-bold px-1.5 py-0.5 border border-black shrink-0">
                              {simResults.cvePlaceholder || 'CVE-2024-SQLI-AUTO'}
                            </span>
                          </div>

                          <div className="space-y-3 text-xs text-black">
                            <div>
                              <span className="text-[8px] font-mono opacity-50 uppercase tracking-wider block font-black">Branch Target</span>
                              <div className="font-mono text-[9px] bg-[#FAF6EB] p-2 border-2 border-black mt-1 font-bold break-all">
                                codexaegis/auto-patch-vulnerability-suite
                              </div>
                            </div>

                            <div>
                              <span className="text-[8px] font-mono opacity-50 uppercase tracking-wider block font-black font-sans">PR TITLE DETAILS</span>
                              <div className="italic text-[10px] bg-[#FAF6EB] p-2 border-2 border-black mt-1 font-extrabold text-[#FF5c00] break-all">
                                {simResults.pullRequestTitle || 'security: use parameterized queries in loginUser to mitigate SQL injection'}
                              </div>
                            </div>

                            <div>
                              <span className="text-[8px] font-mono opacity-50 uppercase tracking-wider block font-black font-sans">DIAGNOSTIC PR BODY</span>
                              <div className="text-[9.5px] leading-relaxed text-[#333] border-l-4 border-[#FFE500] pl-2.5 mt-1 font-bold break-words">
                                {simResults.pullRequestBody}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 flex gap-2 pt-3 border-t-2 border-black/10">
                          <button 
                            onClick={() => copyToClipboard(JSON.stringify(simResults, null, 2), true)}
                            className="flex-1 bg-white border-2 border-black hover:bg-[#FAF6EB] py-2 text-[9px] text-black font-extrabold uppercase tracking-widest transition-all text-center cursor-pointer"
                          >
                            {copiedPr ? 'Copied Data ✓' : 'EXPORT STATISTICS'}
                          </button>
                          <a 
                            href={repoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 bg-[#FFE500] border-2 border-black text-black hover:bg-black hover:text-white py-2 text-[9px] uppercase tracking-widest transition-all text-center font-black shadow-[2px_2px_0px_#000]"
                          >
                            VERIFY REPOSITORY
                          </a>
                        </div>
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <>
                {/* INTERACTIVE ATOMIC WORKFLOW PRESENTATION LAYER */}
                <div className="border-4 border-black bg-[#FF5c00] text-white p-4 sm:p-6 shadow-[4px_4px_0px_#1A1A1A] sm:shadow-[6px_6px_0px_#1A1A1A] relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-[8px] sm:text-xs font-mono font-bold bg-black text-[#FFE500] px-2.5 py-1 border border-black transform rotate-2 hidden xs:block">
                    STABILITY PRESET
                  </div>
                  <h3 className="text-base sm:text-lg font-black uppercase mb-1.5 sm:mb-2 text-white">Atomic Patching Architecture</h3>
                  <p className="text-xs leading-relaxed font-bold font-sans">
                    Favors stability and developer trust over blackbox automated loops. This pipeline discovers multi-stage security vectors, calculates mitigation patches independently block-by-block, certifies sandbox compliance, and issues clean Git branches for granular human reviews.
                  </p>
                </div>

                {/* Vuln Priority Stack Table Card */}
                <div className="border-4 border-black bg-white p-4 sm:p-6 shadow-[4px_4px_0px_0px_#1A1A1A] sm:shadow-[8px_8px_0px_0px_#1A1A1A] flex flex-col gap-4 sm:gap-6">
                  <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 border-b-2 border-black pb-4 mb-2">
                    <div>
                      <h4 className="text-xs sm:text-sm font-black uppercase text-black">Vulnerability Stack Priority (Discovered Sandbox)</h4>
                      <p className="text-[10px] font-mono opacity-60 mt-0.5">Sequence generated from targeted code sweeps on {connectedRepo}</p>
                    </div>

                    <button
                      onClick={handleAtomicSimulate}
                      disabled={isAtomicSimulating}
                      className="py-2.5 px-4 sm:py-3 sm:px-6 bg-[#FFE500] hover:bg-black hover:text-[#00FF66] text-black font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] disabled:opacity-50 transition-all cursor-pointer text-center"
                    >
                      {isAtomicSimulating ? '🔄 Sequential Sandbox Running...' : '⚡ Launch Atomic Pipeline'}
                    </button>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {atomicIssues.map((issue, idx) => {
                      const isActive = activeAtomicIssueIndex === idx;
                      const isPatched = issue.status === 'patched';
                      const isValidating = issue.status === 'validating';

                      return (
                        <div 
                          key={issue.id} 
                          className={`border-4 p-3 sm:p-4 transition-all duration-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 relative ${
                            isActive 
                              ? 'border-black bg-[#FFE500]/15 shadow-[4px_4px_0px_#000]' 
                              : isPatched 
                                ? 'border-black bg-emerald-50 shadow-[2px_2px_0px_#000]' 
                                : 'border-neutral-300 bg-white shadow-[2px_2px_0px_rgba(0,0,0,0.1)]'
                          }`}
                        >
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 font-black text-xs sm:text-sm border-2 border-black bg-black text-[#FFE500] flex items-center justify-center shrink-0">
                              0{idx + 1}
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <span className={`text-[8px] font-mono font-black border uppercase px-1.5 py-0.5 ${
                                  issue.severity === 'CRITICAL' ? 'bg-[#FF5c00] text-white border-black' :
                                  issue.severity === 'HIGH' ? 'bg-amber-100 text-amber-900 border-amber-400' : 'bg-blue-100 text-blue-900 border-blue-400'
                                }`}>
                                  {issue.severity}
                                </span>
                                <span className="text-[9px] font-mono text-neutral-400 font-bold break-all">{issue.file}</span>
                              </div>
                              <h5 className="font-extrabold text-xs mt-1 text-black">{issue.title}</h5>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 w-full md:w-auto justify-end">
                            {isPatched && (
                              <div className="flex flex-col items-end shrink-0">
                                <span className="bg-[#00FF66]/20 text-[#008033] border-2 border-[#00FF66] font-extrabold text-[9px] px-2 py-0.5 uppercase tracking-wide shadow-[1px_1px_0px_#000]">
                                  Patched & Verified ✓
                                </span>
                                <span className="text-[9px] font-mono text-neutral-500 font-bold mt-1">Released {issue.pr}</span>
                              </div>
                            )}
                            {isValidating && (
                              <span className="bg-[#FFE500] border-2 border-black font-extrabold text-[9px] text-black px-2 py-0.5 uppercase tracking-wide animate-pulse shadow-[1px_1px_0px_#000] shrink-0">
                                Sandboxing Test Suite...
                              </span>
                            )}
                            {issue.status === 'awaiting_review' && (
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                                <span className="bg-[#FF5c00] border-2 border-black font-extrabold text-[9px] text-white px-2 py-1.5 sm:py-0.5 uppercase tracking-wide animate-pulse shadow-[1px_1px_0px_#000] text-center shrink-0">
                                  Sandbox Verified ✓
                                </span>
                                <button
                                  onClick={() => handleApprovePatch(idx)}
                                  className="py-1.5 px-3 bg-[#00FF66] hover:bg-black hover:text-white text-black font-black text-[10px] leading-none uppercase border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-px active:translate-y-px active:shadow-none transition-all cursor-pointer animate-none hover:-translate-y-0.5 text-center shrink-0"
                                >
                                  Review & Approve PR {issue.pr} 🚀
                                </button>
                              </div>
                            )}
                            {issue.status === 'pending' && (
                              <span className="bg-neutral-100 border border-neutral-300 text-neutral-500 font-extrabold text-[9px] px-2 py-0.5 uppercase tracking-wide shrink-0">
                                Awaiting Pipeline Run
                              </span>
                            )}
                            {issue.status === 'scanning' && (
                              <span className="bg-sky-200 border-2 border-black text-[#2e5077] font-extrabold text-[9px] px-2 py-0.5 uppercase tracking-wide animate-pulse shadow-[1px_1px_0px_#000] shrink-0">
                                Analyzing Threat Stack
                              </span>
                            )}

                            {isPatched && !isAtomicSimulating && (
                              <button
                                onClick={() => handleRollback(issue.id, idx)}
                                className="bg-[#FF5c00] hover:bg-black text-white font-black text-[8px] uppercase tracking-wider py-1.5 px-3 border border-black shadow-[1px_1px_0px_#000] active:translate-y-px active:shadow-none transition-all cursor-pointer shrink-0"
                                title="Independently revert this patch to inspect stability"
                              >
                                Rollback Fix ↩
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Retro Terminal Output for Atomic Run */}
                <div className="border-4 border-black bg-white p-4 sm:p-6 shadow-[4px_4px_0px_0px_#1A1A1A] sm:shadow-[8px_8px_0px_0px_#1A1A1A] flex flex-col gap-3 sm:gap-4">
                  <div className="flex justify-between items-center border-b-[3px] border-black pb-3">
                    <span className="text-xs uppercase font-mono font-black text-black flex items-center gap-1.5 leading-none">
                      <Terminal className="w-4 h-4 shrink-0" />
                      Atomic Verification Sandbox Console logs
                    </span>
                    <button 
                      onClick={() => setAtomicLogs(['[SYSTEM] Log system cleared. awaiting queue sweep...'])}
                      className="bg-black text-[9px] font-bold uppercase tracking-wider text-white px-2 py-0.5 border border-black hover:bg-[#FFE500] hover:text-black transition-all shrink-0 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Terminal console frame */}
                  <div className="bg-[#1A1A1A] border-[3px] border-black text-[#00FF66] p-3 sm:p-4 font-mono text-[10px] select-text h-[178px] overflow-y-auto space-y-1.5 relative shadow-inner">
                    {atomicLogs.map((log, idx) => {
                      const isSystem = log.startsWith('[SYSTEM]') || log.startsWith('[ROLLBACK');
                      const isSuccess = log.startsWith('[ATOMIC_CORE_SUCCESS') || log.includes('SUCCESS');
                      const isOk = log.startsWith('✔');
                      const isLine = log.startsWith('---');

                      let colorClass = "text-[#FFE500]";
                      if (isSystem) colorClass = "text-[#FF5c00] font-bold";
                      if (isSuccess || isOk) colorClass = "text-emerald-400 font-extrabold";
                      if (isLine) colorClass = "text-neutral-500";

                      return (
                        <div key={idx} className={`leading-relaxed break-words whitespace-pre-wrap flex items-start ${colorClass}`}>
                          <span className="text-white opacity-40 mr-2 shrink-0 select-none">❯</span>
                          <span>{log}</span>
                        </div>
                      );
                    })}
                    {isAtomicSimulating && (
                      <div className="flex items-center gap-2 italic text-[#FFE500] py-1 animate-pulse font-bold break-words whitespace-pre-wrap">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FFE500] shrink-0"></div>
                        Securing sandbox boundaries & processing atomic queue...
                      </div>
                    )}
                  </div>
                </div>

                {/* Atomic Patch Diff Inspector layout */}
                <div className="border-4 border-black bg-white p-4 sm:p-6 shadow-[4px_4px_0px_0px_#1A1A1A] sm:shadow-[8px_8px_0px_#1A1A1A]">
                  <div className="flex justify-between items-center border-b-2 border-black pb-3 mb-4 gap-2 flex-wrap">
                    <span className="text-xs uppercase font-mono font-black text-black">
                      🛠️ Atomic Code Refactor Inspector
                    </span>
                    <span className="text-[9px] uppercase font-mono bg-[#00FF66] text-black border border-black px-2 py-0.5 font-bold shadow-[2px_2px_0px_#000]">
                      ISOLATED COMPILER SANDBOX PASS ✓
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] font-mono opacity-50 block uppercase tracking-wider mb-1 font-bold text-black">Original Code Block:</span>
                      <pre className="bg-[#FF5c00]/10 border-2 border-[#FF5c00] text-red-950 p-3 font-mono text-[9px] overflow-auto whitespace-pre h-[110px] leading-relaxed break-all">
                        {activeAtomicIssueIndex !== -1 
                          ? atomicIssues[activeAtomicIssueIndex].original 
                          : atomicIssues[0].original}
                      </pre>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono opacity-50 block uppercase tracking-wider mb-1 font-bold text-black">Isolated Refined Patch:</span>
                      <pre className="bg-[#00FF66]/10 border-2 border-[#00FF66] text-emerald-950 p-3 font-mono text-[9px] overflow-auto whitespace-pre h-[110px] leading-relaxed break-all">
                        {activeAtomicIssueIndex !== -1 
                          ? atomicIssues[activeAtomicIssueIndex].patch 
                          : atomicIssues[0].patch}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="bg-[#FAF6EB] p-3 border-2 border-black mt-4 text-[9px] font-mono leading-relaxed font-bold">
                    <span className="text-[#FF5c00]">SANDBOX VERIFICATION OUTPUT SUMMARY:</span>
                    <pre className="text-neutral-700 mt-1 whitespace-pre-wrap break-all">
                      {activeAtomicIssueIndex !== -1 
                        ? atomicIssues[activeAtomicIssueIndex].testOutput 
                        : atomicIssues[0].testOutput}
                    </pre>
                  </div>
                </div>

                {/* Granular Pull PR drawer cards */}
                <div className="border-4 border-black bg-white p-4 sm:p-6 shadow-[4px_4px_0px_0px_#1A1A1A] sm:shadow-[8px_8px_0px_#1A1A1A]">
                  <div className="flex justify-between items-center border-b-[3px] border-black pb-3 mb-4 gap-2 flex-wrap">
                    <span className="text-xs uppercase font-mono font-black text-black flex items-center gap-1.5 leading-none">
                      <GitBranch className="w-5 h-5 text-[#FF5c00]" />
                      Granular Branch Pull Requests (Direct human audit)
                    </span>
                    <span className="bg-[#FFE500] border border-black text-black text-[10px] font-mono font-bold px-2 py-0.5 shrink-0">
                      3 Isolated Branches
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {atomicIssues.map((issue) => {
                      const isPatched = issue.status === 'patched';
                      const isAwaitingReview = issue.status === 'awaiting_review';
                      const isActive = isPatched || isAwaitingReview;
                      return (
                        <div 
                          key={issue.id} 
                          className={`border-4 p-3 sm:p-4 flex flex-col justify-between min-h-[190px] transition-all relative ${
                            isPatched 
                              ? 'border-black bg-white shadow-[4px_4px_0px_#000]' 
                              : isAwaitingReview
                                ? 'border-[#FF5c00] bg-[#FF5c00]/5 shadow-[4px_4px_0px_#000] ring-2 ring-[#FF5c00]/10'
                                : 'border-neutral-300 bg-neutral-50/70 opacity-50'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-center mb-2 gap-1.5">
                              <span className="text-[10px] font-mono bg-black text-white px-2 py-0.5 font-bold shrink-0">{issue.pr}</span>
                              <span className={`text-[8px] font-mono font-bold uppercase rounded-sm px-1.5 py-0.5 border shrink-0 ${
                                isPatched ? 'bg-emerald-50 text-emerald-800 border-emerald-400' :
                                isAwaitingReview ? 'bg-orange-50 text-orange-800 border-orange-400 animate-pulse' :
                                'bg-neutral-100 text-neutral-500 border-transparent'
                              }`}>
                                {isPatched ? 'PR ACTIVE ✓' : isAwaitingReview ? 'GATED REVIEW 🖲' : 'PENDING STAGE'}
                              </span>
                            </div>
                            <h6 className="font-extrabold text-[10px] leading-tight mb-2 uppercase text-black break-all">{issue.prTitle}</h6>
                            <span className="text-[8px] font-mono text-neutral-400 block font-bold">BRANCH REF:</span>
                            <span className="text-[8px] font-mono font-bold text-neutral-700 bg-neutral-100 p-1 block mt-0.5 border border-dashed border-neutral-300 overflow-x-auto whitespace-normal break-all">
                              {issue.prBranch}
                            </span>
                          </div>

                          <div className="mt-4 pt-2 border-t border-neutral-200 flex justify-between items-center gap-1.5">
                            <span className="text-[8px] font-mono text-neutral-400 shrink-0">
                              {isPatched ? 'Verified ✓' : isAwaitingReview ? 'Sandbox Pass' : 'Awaiting Test'}
                            </span>
                            {isActive && (
                              <button
                                onClick={() => copyToClipboard(`git checkout ${issue.prBranch} && git pull origin ${issue.prBranch}`, true)}
                                className="text-[8px] font-black bg-[#FFE500] hover:bg-black hover:text-white border border-black px-2 py-0.5 text-black transition-all cursor-pointer rounded-none shrink-0"
                              >
                                {copiedPr ? 'Copied ✓' : 'Copy Git Link'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

          </section>

        </main>

        {/* BRUTALIST 3D-OFFSET FOOTER SECTION */}
        <footer className="mt-8 sm:mt-12 border-t-4 border-black pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-stretch md:items-end gap-6 pb-6">
          
          {/* Brutalist Counts */}
          <div className="flex gap-4 sm:gap-12 flex-row w-full justify-between sm:justify-start md:w-auto order-2 md:order-1">
            <div className="flex-1 sm:flex-initial flex flex-col border-4 border-black bg-white p-3 sm:p-4 shadow-[4px_4px_0px_#1A1A1A] min-w-[110px] sm:min-w-[140px]">
              <span className="text-[#1A1A1A] font-extrabold text-4xl sm:text-5xl leading-none">
                0{fixedCount}
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-widest opacity-60 font-mono font-black mt-2">
                REPAIRS APPLIED
              </span>
            </div>

            <div className="flex-1 sm:flex-initial flex flex-col border-4 border-black bg-white p-3 sm:p-4 shadow-[4px_4px_0px_#1A1A1A] min-w-[110px] sm:min-w-[140px]">
              <span className="text-[#FF5c00] font-extrabold text-4xl sm:text-5xl leading-none">
                0{isSimulating ? 1 : 0}
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-widest opacity-60 font-mono font-black mt-2">
                ACTIVE BREACH RUNS
              </span>
            </div>
          </div>

          {/* Large Action Cycle button with 3D shadow offset */}
          <div className="flex flex-col items-stretch md:items-end gap-3 sm:gap-4 w-full md:w-auto order-1 md:order-2">
            <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-end">
              
              {/* Retro Cartoon smile sticker decorator */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-black bg-[#FAF6EB] flex items-center justify-center font-bold text-base sm:text-lg shadow-[2px_2px_0px_0px_#1A1A1A] shrink-0">
                ☺
              </div>

              {/* Giant Yellow Action Trigger */}
              <button
                onClick={activeTab === 'single' ? handleSimulate : handleAtomicSimulate}
                disabled={activeTab === 'single' ? (isSimulating || !repoUrl) : (isAtomicSimulating || !repoUrl)}
                className="flex-1 sm:flex-initial py-3 px-5 sm:py-4 sm:px-10 bg-[#FFE500] hover:bg-[#FF5c00] hover:text-white text-black font-black uppercase text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.25em] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {activeTab === 'single' ? (
                  isSimulating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                      SIMULATING INJECTS...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current text-current shrink-0" />
                      INITIATE SECURITY CYCLE ⚡
                    </>
                  )
                ) : (
                  isAtomicSimulating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                      VALIDATING QUEUE...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current text-current shrink-0" />
                      DISPATCH ATOMIC REPAIRS ⚡
                    </>
                  )
                )}
              </button>
            </div>

            <p className="text-[8px] sm:text-[9px] tracking-widest text-[#555] font-black uppercase text-right">
              COORDINATE PROTOCOL: S/N: CODE-7742-NEO-B
            </p>
          </div>

        </footer>

      </div>
    </div>
  );
}
