# CodexAegis 🛡️

**CodexAegis** is an advanced, high-contrast interactive DevSecOps dashboard and chaos core vulnerability simulation tool. It is designed to model autonomous multi-agent pipelines scanning repository architectures, generating sandbox payload injection tests, and outputting validated, isolated git branch patches to remediate security risks such as SQL Injections, Race Conditions, and Cookie Session Misconfigurations in real time.

---

## 🎨 Design Concept
Crafted with a distinct **Neo-Brutalist** aesthetic, CodexAegis utilizes:
- Heavy solid black borders (`border-4 border-black`)
- High-contrast color blocks (deep warning oranges, security emeralds, cyber yellows, and rich off-whites)
- Distinctive 3D offset drop shadows (`shadow-[8px_8px_0px_0px_#1A1A1A]`)
- Fully fluid and optimized layouts tailored for great readability across both standard desktop monitors and mobile ports

---

## 🔆 Key Features

### 1. Interactive Live Topology Mapping
- View active system node connections representing critical files and endpoints (e.g., Auth Server, Payment Gateway, Cookie Manager).
- Dynamically monitor live status variables (Secure, Under Attack, Compromised, or Patched) marked by distinct color states.
- Click any node to instantly view its localized status summary and security telemetry.

### 2. Specialized Multi-Agent Orchestration
- **Dual Pipeline Modalities**: Switch effortlessly between the **Autonomous Single-Agent Core** and the **Isolated Multi-Agent Pipeline**.
- **Execution Pipelines**: Observe dedicated autonomous agents (`Aegis-Scanner`, `Aegis-Breacher`, `Aegis-Synthesizer`, and `Aegis-Certifier`) executing sequential scanning and patching.

### 3. Attack & Sandbox Console Logs
- Real-time simulated execution streams of security tests displayed inside eye-safe, customized terminal shells.
- Supports logs for active breaches, parameters trace analyses, code validation evaluations, and branch creation histories.

### 4. Patch Synthesis & Code Compares
- Inline comparisons showing original insecure statements alongside recommended parameterized remediations.
- Automated generation of Git Branch pull request details (branch metadata, structured titles, and granular diagnostic Markdown descriptions).

### 5. Multi-System Atomic Control
- Granular review, approval, and independent rollbacks for individual vulnerability fixes itemized block-by-block.
- Promotes total engineering trust through non-destructive, staging-level validation reviews.

---

## 💻 Tech Stack

- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) with [TypeScript](https://www.typescriptlang.org/) for clean, reliable, type-safe operations.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for fluid mobile-first layouts, flexible flexboxes, custom scrollbars, and aesthetic padding.
- **Micro-Animations**: [Framer Motion](https://motion.dev/) (via `motion/react`) driving key pipeline movements, state transitions, and responsive triggers.
- **Vector Assets**: [Lucide React](https://lucide.dev/) for precise developer-focused iconography.

---

## 📖 Operational Guide

Follow these steps to operate the simulation:

### Step 1: Input Target Parameters
- Specify any remote pipeline directory path using the interactive **Repository Path** input bar.
- Choose a targeted vulnerability archetype using the **Threat Exploit Selector** dropdown menu:
  - **SQL Injection** (`auth-service` login bypass vulnerabilities)
  - **Bypass Checkout API Limit** (race conditions in order processing endpoints)
  - **HttpOnly Cookie Missing Flag** (unsafe session credential handling)

### Step 2: Choose Your Execution Flow
- **Single-Agent Security Cycle**: Runs a comprehensive end-to-end automated compromise run to produce a combined remediation patch.
- **Atomic Repairs Pipeline**: Breaks down found issues sequentially. Runs localized sandboxes for each CVE and prompts developer-driven git branch merges and rollbacks.

### Step 3: Trigger the Pipeline
- Press the **Initiate Security Cycle** or **Dispatch Atomic Repairs** button situated in the footer action block.
- Monitor the step-by-step agent transition and log generation inside the simulated sandboxed terminal.

### Step 4: Perform Remediation Audits
- Copy recommended code modifications directly with a single click using the **Copy Remediation** buttons.
- View auto-formatted, ready-to-use branch commands or export complete mock JSON stats directly into your local buffers.
