# CodexAegis 🛡️

**CodexAegis** is an advanced, high-contrast interactive DevSecOps dashboard and chaos core vulnerability simulation tool. It is designed to model autonomous multi-agent pipelines scanning reposit[...]

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

## 🚀 How to Run

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Google Gemini API Key** (required for AI-powered simulations)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/radmm/CodexAegis.git
   cd CodexAegis
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env.local`
     ```bash
     cp .env.example .env.local
     ```
   - Add your Google Gemini API key to `.env.local`:
     ```env
     GEMINI_API_KEY=your_actual_gemini_api_key_here
     APP_URL=http://localhost:3000
     ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The application will be available at `http://localhost:3000`

5. **Build for production**
   ```bash
   npm run build
   # or
   yarn build
   ```

6. **Start the production server**
   ```bash
   npm start
   # or
   yarn start
   ```

### Development Commands
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (Vite + esbuild)
- `npm start` - Run production server
- `npm run clean` - Remove build artifacts
- `npm run lint` - Run TypeScript type checking

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

---

## 🔐 Security Considerations

### API Key Protection
- **Never commit `.env.local` or any files containing API keys** to version control. The `.gitignore` should include `.env.local`.
- Always use environment variables or secrets management systems (e.g., GitHub Secrets, cloud provider secret managers) for sensitive credentials.
- Rotate your Gemini API keys regularly and monitor API usage for unauthorized access.

### Server Configuration
- In production, the server listens on `0.0.0.0:3000`. Consider restricting this to specific IP ranges or running behind a reverse proxy (nginx, Apache) for additional security.
- Set `NODE_ENV=production` in production environments to disable Vite dev server middleware.

### Input Validation
- Repository URL inputs are passed to the AI model—ensure proper validation to prevent prompt injection attacks.
- All user inputs should be sanitized before being sent to external APIs (Gemini).

### CORS & Network Security
- Configure CORS policies appropriately if the frontend and backend are on different domains.
- Use HTTPS in production to encrypt API communications with the Gemini service.

### Dependencies
- Keep dependencies updated: `npm audit` and `npm update` regularly.
- Review the audit report for vulnerabilities: `npm audit --production` to focus on production dependencies.
- The project uses `@google/genai`, `express`, and `react` as key dependencies—monitor their security advisories.

### Session Security (Cookies)
- The application demonstrates insecure cookie handling as a teaching tool. In production systems:
  - Always set `httpOnly: true` to prevent XSS attacks
  - Always set `secure: true` for HTTPS-only transmission
  - Use `sameSite: 'strict'` or `'lax'` for CSRF protection

---
