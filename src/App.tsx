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
    '[SYSTEM] Proto-core ready. Input virtual Git repo above and click "INITIATE SECURITY CYCLE ⚡" to launch multi-agent suite.'
  ]);
  const [selectedNode, setSelectedNode] = useState<string>('auth-node');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPr, setCopiedPr] = useState(false);
  const [simResults, setSimResults] = useState<any>(null);
  const [fixedCount, setFixedCount] = useState(4); // Starts at 4 as per design specs
  const [connectedRepo, setConnectedRepo] = useState('secure-express-demo');

  // Multi-agent server nodes in Neo-Brutalist cartoon structure
  const [nodes, setNodes] = useState<ServerNode[]>([
    { id: 'gw-node', name: 'API GATEWAY', type: 'gateway', status: 'healthy', ip: '10.0.0.1', load: 15 },
    { id: 'auth-node', name: 'AUTH LAYER', type: 'auth', status: 'healthy', ip: '10.0.0.5', load: 12 },
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
    <div className="relative min-h-screen bg-[#FAF6EB] text-[#1A1A1A] p-6 lg:p-12 overflow-x-hidden selection:bg-[#FFE500] selection:text-black">
      
      {/* Playful Neo-Brutalist cartoonish floating illustration/stickers */}
      <div className="absolute top-10 right-10 opacity-15 pointer-events-none hidden md:block">
        <span className="text-7xl">✦</span>
      </div>
      <div className="absolute bottom-20 left-6 opacity-10 pointer-events-none">
        <span className="text-[120px] font-extrabold tracking-tighter">SEC_DEV</span>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col justify-between min-h-full">
        
        {/* NEO-BRUTALIST OVERSIZED HEADER HEADER */}
        <header className="border-4 border-black bg-white p-6 md:p-8 shadow-[8px_8px_0px_0px_#1A1A1A] mb-12 flex flex-col md:flex-row items-center justify-between gap-6 relative">
          
          {/* Cartoon style corner badge */}
          <div className="absolute -top-4 -left-4 bg-[#FF5c00] text-white border-2 border-black font-bold uppercase py-0.5 px-3 text-[10px] transform -rotate-3 tracking-widest shadow-[2px_2px_0px_#000]">
            AUTONOMOUS_V1_AGENT
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight uppercase leading-none text-black">
              CodexAegis <span className="text-xs font-mono font-medium lowercase tracking-normal block md:inline md:ml-3 text-neutral-500 bg-neutral-100 border border-black/10 px-2 py-0.5">chaos core dev-sec-ops</span>
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
        <section className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#1A1A1A] mb-10 flex flex-col lg:flex-row items-center gap-6">
          
          {/* Input repo container */}
          <div className="w-full lg:flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="bg-black text-[#FFE500] px-4 py-2 font-black text-xs uppercase border-2 border-black block select-none">
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
            <div className="bg-black text-white px-4 py-2 font-black text-xs uppercase border-2 border-black block select-none whitespace-nowrap">
              THREAT EXPLOIT SELECTOR
            </div>
            <select
              value={vulnType}
              onChange={(e) => setVulnType(e.target.value)}
              disabled={isSimulating}
              className="bg-[#FFE500] border-[3px] border-black px-4 py-2.5 font-bold text-xs leading-none focus:outline-none text-black cursor-pointer shadow-[3px_3px_0px_#000] hover:translate-y-[-1px] active:translate-y-[1px] disabled:opacity-50"
            >
              <option value="auth-service-sql-injection">SQL Injection (auth-service login bypass)</option>
              <option value="payment-gateway-race-condition">Bypass Checkout API Limit</option>
              <option value="session-hijack-insecure-cookie">Session Cookie Missing HttpOnly</option>
            </select>
          </div>

        </section>

        {/* SPLIT PRIMARY LIVE FIRE WORKSPACE */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start flex-1 mb-12">
          
          {/* LEFT: LIVE NETWORK DIAGRAM MAP REPRESENTING THE REPO (5 Columns) */}
          <section className="lg:col-span-5 flex flex-col gap-8">
            
            <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#1A1A1A] flex flex-col gap-6 relative">
              
              {/* Cute brute labels */}
              <div className="flex justify-between items-center border-b-[3px] border-black pb-4">
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-black flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-black rounded-full inline-block"></span>
                    Interactive Live Repo Diagram
                  </h2>
                  <p className="text-[10px] font-mono opacity-60 mt-0.5">Mapping threat states of repository: index.git</p>
                </div>
                <span className="bg-[#FFE500] text-black border-2 border-black font-extrabold text-[8px] uppercase tracking-wider px-2 py-0.5 shadow-[2px_2px_0px_#000]">
                  {connectedRepo}
                </span>
              </div>

              {/* LIVE NETWORK DYNAMIC CONNECTIONS BOX */}
              <div className="border-[3px] border-black bg-[#FAF6EB] p-6 relative min-h-[300px] flex flex-col justify-between overflow-hidden">
                
                {/* Visual Connector Lines in Neo-Brutalist layout */}
                <div className="absolute inset-0 z-0 opacity-10 pointer-events-none handdrawn-dots"></div>
                <div className="absolute left-[50%] top-6 bottom-6 w-[3px] bg-black border-dashed border-l border-black pointer-events-none z-0"></div>
                
                <div className="space-y-4 relative z-10">
                  {nodes.map((node) => {
                    const isSelected = selectedNode === node.id;
                    const isCompromised = node.status === 'compromised';
                    const isUnderAttack = node.status === 'under-attack';
                    const isPatched = node.status === 'patched';

                    return (
                      <div 
                        key={node.id}
                        onClick={() => setSelectedNode(node.id)}
                        className={`border-4 bg-white p-4 transition-all duration-150 cursor-pointer relative z-10 flex items-center justify-between ${
                          isSelected 
                            ? 'border-black bg-[#FFE500] shadow-[4px_4px_0px_#000] -translate-x-1 -translate-y-1' 
                            : 'border-black hover:border-black/80 hover:bg-[#FAF6EB]/60 shadow-[2px_2px_0px_#000]'
                        }`}
                      >
                        {/* Status tag */}
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-none border-2 border-black flex items-center justify-center ${
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

                        <div className="flex items-center gap-2">
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
          <section className="lg:col-span-7 flex flex-col gap-10">
            
            {/* Sequential Steps of Autonomous Multi-Agents */}
            <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#1A1A1A]">
              <h2 className="text-lg font-black uppercase text-black border-b-[3px] border-black pb-4 mb-6 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#FFE500] fill-current stroke-black" />
                Active Agent Execution Pipeline
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {steps.map((step) => {
                  const isActive = step.status === 'active';
                  const isSuccess = step.status === 'success';

                  return (
                    <div 
                      key={step.id} 
                      className={`p-4 flex flex-col justify-between min-h-[140px] transition-all relative ${
                        getStepStatusStyle(step.status)
                      }`}
                    >
                      <div>
                        <span className="text-[9px] tracking-widest font-black uppercase bg-black text-white px-1 py-0.5 border border-black inline-block mb-3">
                          {step.agent}
                        </span>
                        <p className="text-[10px] font-bold leading-relaxed">{step.message}</p>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/10">
                        <span className="text-[8px] font-mono">{step.timestamp}</span>
                        {isSuccess && <span className="text-[9px] font-extrabold uppercase">Complete ✓</span>}
                        {isActive && <span className="text-[9px] font-extrabold uppercase animate-pulse">Running ⏳</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Simulated Live Output Console/Term */}
            <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#1A1A1A] flex flex-col gap-4">
              <div className="flex justify-between items-baseline border-b-[3px] border-black pb-3">
                <span className="text-xs uppercase font-mono font-black text-black flex items-center gap-1.5">
                  <Terminal className="w-4 h-4" />
                  Live Attack Execution Sandbox Console Logs
                </span>
                <button 
                  onClick={() => setLogs(['[SYSTEM] Log system cleared. Trace waiting...'])}
                  className="bg-black text-[9px] font-bold uppercase tracking-wider text-white px-2 py-0.5 border border-black hover:bg-[#FFE500] hover:text-black transition-all"
                >
                  Clear Terminal
                </button>
              </div>

              {/* Retro style terminal */}
              <div className="bg-[#1A1A1A] border-[3px] border-black text-[#FFE500] p-4 font-mono text-[10px] select-text h-[160px] overflow-y-auto space-y-1.5 relative shadow-inner">
                {logs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    <span className="text-white opacity-40 mr-2">❯</span>
                    <span>{log}</span>
                  </div>
                ))}
                {isSimulating && (
                  <div className="flex items-center gap-2 italic text-[#00FF66] py-1 animate-pulse font-bold">
                    <div className="w-2 h-2 rounded-full bg-[#00FF66]"></div>
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
                  className="grid grid-cols-1 md:grid-cols-2 gap-8 relative"
                >
                  
                  {/* Visual Remediation Editor Mock */}
                  <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#1A1A1A] flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-baseline border-b-2 border-black pb-3 mb-4">
                        <span className="text-[10px] uppercase font-mono font-black text-[#FF5c00]">
                          🔨 Patch Synthesis Generator
                        </span>
                        <button 
                          onClick={() => copyToClipboard(simResults.remediationPatch || '', false)}
                          className="bg-[#FFE500] border-2 border-black text-black font-extrabold text-[8px] uppercase tracking-wider px-2 py-0.5 shadow-[2px_2px_0px_#000]"
                        >
                          {copiedCode ? 'Copied ✓' : 'Copy Remediation'}
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <span className="text-[9px] font-mono opacity-50 block uppercase tracking-wider mb-1">
                            Detected Insecure Concatenation:
                          </span>
                          <pre className="bg-[#FF5c00]/10 border-2 border-[#FF5c00] text-red-950 p-2.5 font-mono text-[9px] overflow-x-auto whitespace-pre-wrap">
                            {vulnType === 'auth-service-sql-injection' ? `const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";` :
                             vulnType === 'payment-gateway-race-condition' ? `const valid = await checkTokenValid(token);\nif (valid) {\n  await processCharge(amount);` :
                             `res.cookie('adminSession', ... {\n  httpOnly: false\n});`}
                          </pre>
                        </div>

                        <div>
                          <span className="text-[9px] font-mono opacity-50 block uppercase tracking-wider mb-1">
                            Remediated Parametrized Code Patch:
                          </span>
                          <pre className="bg-[#00FF66]/10 border-2 border-[#00FF66] text-emerald-950 p-2.5 font-mono text-[9px] overflow-x-auto whitespace-pre-wrap">
                            {simResults.remediationPatch}
                          </pre>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t-2 border-dashed border-black/10 text-[9px] text-[#225035] italic flex items-center gap-1.5 font-bold">
                      <ShieldCheck className="w-4 h-4 text-[#00FF66] fill-[#00FF66] stroke-black" />
                      Syntax correct. Code validation passed flawlessly in testing blocks.
                    </div>
                  </div>

                  {/* Pull Request Output Frame */}
                  <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#1A1A1A] flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-baseline border-b-2 border-black pb-3 mb-4">
                        <span className="text-[10px] uppercase font-mono font-black text-black">
                          🐙 Automated Pull Request
                        </span>
                        <span className="bg-black text-white text-[8px] font-mono font-bold px-1.5 py-0.5 border border-black">
                          {simResults.cvePlaceholder || 'CVE-2024-SQLI-AUTO'}
                        </span>
                      </div>

                      <div className="space-y-3 text-xs text-black">
                        <div>
                          <span className="text-[8px] font-mono opacity-50 uppercase tracking-wider block font-black">Branch Target</span>
                          <div className="font-mono text-[9px] bg-[#FAF6EB] p-2 border-2 border-black mt-1 font-bold">
                            codexaegis/auto-patch-vulnerability-suite
                          </div>
                        </div>

                        <div>
                          <span className="text-[8px] font-mono opacity-50 uppercase tracking-wider block font-black font-sans">PR TITLE DETAILS</span>
                          <div className="italic text-[10px] bg-[#FAF6EB] p-2 border-2 border-black mt-1 font-extrabold text-[#FF5c00]">
                            {simResults.pullRequestTitle || 'security: use parameterized queries in loginUser to mitigate SQL injection'}
                          </div>
                        </div>

                        <div>
                          <span className="text-[8px] font-mono opacity-50 uppercase tracking-wider block font-black font-sans">DIAGNOSTIC PR BODY</span>
                          <div className="text-[9.5px] leading-relaxed text-[#333] border-l-4 border-[#FFE500] pl-2.5 mt-1 font-bold">
                            {simResults.pullRequestBody}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-2 pt-3 border-t-2 border-black/10">
                      <button 
                        onClick={() => copyToClipboard(JSON.stringify(simResults, null, 2), true)}
                        className="flex-1 bg-white border-2 border-black hover:bg-[#FAF6EB] py-2 text-[9px] text-black font-extrabold uppercase tracking-widest transition-all text-center"
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

          </section>

        </main>

        {/* BRUTALIST 3D-OFFSET FOOTER SECTION */}
        <footer className="mt-12 border-t-4 border-black pt-8 flex flex-col md:flex-row justify-between items-end gap-6 pb-6">
          
          {/* Brutalist Counts */}
          <div className="flex gap-12 order-2 md:order-1">
            <div className="flex flex-col border-4 border-black bg-white p-4 shadow-[4px_4px_0px_#1A1A1A] min-w-[140px]">
              <span className="text-[#1A1A1A] font-extrabold text-5xl leading-none">
                0{fixedCount}
              </span>
              <span className="text-[9px] uppercase tracking-widest opacity-60 font-mono font-black mt-2">
                REPAIRS APPLIED
              </span>
            </div>

            <div className="flex flex-col border-4 border-black bg-white p-4 shadow-[4px_4px_0px_#1A1A1A] min-w-[140px]">
              <span className="text-[#FF5c00] font-extrabold text-5xl leading-none">
                0{isSimulating ? 1 : 0}
              </span>
              <span className="text-[9px] uppercase tracking-widest opacity-60 font-mono font-black mt-2">
                ACTIVE BREACH RUNS
              </span>
            </div>
          </div>

          {/* Large Action Cycle button with 3D shadow offset */}
          <div className="flex flex-col items-end gap-4 w-full md:w-auto order-1 md:order-2">
            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
              
              {/* Retro Cartoon smile sticker decorator */}
              <div className="w-12 h-12 rounded-full border-4 border-black bg-[#FAF6EB] flex items-center justify-center font-bold text-lg shadow-[2px_2px_0px_0px_#1A1A1A]">
                ☺
              </div>

              {/* Giant Yellow Action Trigger */}
              <button
                onClick={handleSimulate}
                disabled={isSimulating || !repoUrl}
                className="py-4 px-10 bg-[#FFE500] hover:bg-[#FF5c00] hover:text-white text-black font-black uppercase text-xs tracking-[0.25em] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex items-center gap-2"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    SIMULATING INJECTS...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current text-current" />
                    INITIATE SECURITY CYCLE ⚡
                  </>
                )}
              </button>
            </div>

            <p className="text-[9px] tracking-widest text-[#555] font-black uppercase">
              COORDINATE PROTOCOL: S/N: CODE-7742-NEO-B
            </p>
          </div>

        </footer>

      </div>
    </div>
  );
}
