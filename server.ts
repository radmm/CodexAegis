import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize server-side Gemini client using the modern @google/genai SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Seed system blueprints
const REPOSITORY_VULNERABILITIES = [
  {
    name: "auth-service-sql-injection",
    title: "SQL Injection in User Login Handler",
    targetFile: "src/services/auth.ts",
    vulnerableCode: `async function loginUser(username, password) {\n  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";\n  const user = await db.query(query);\n  return user;\n}`,
    patchTemplate: `async function loginUser(username, password) {\n  const query = "SELECT * FROM users WHERE username = ? AND password = ?";\n  const user = await db.query(query, [username, password]);\n  return user;\n}`,
    attackVector: "admin' OR '1'='1"
  },
  {
    name: "payment-gateway-race-condition",
    title: "API Rate-limiting Bypass on checkout key validation",
    targetFile: "src/api/gateway.ts",
    vulnerableCode: `app.post("/api/checkout", async (req, res) => {\n  const { token, amount } = req.body;\n  // Unrestricted loop validation\n  const valid = await checkTokenValid(token);\n  if (valid) {\n    await processCharge(amount);\n    return res.status(200).send({ status: "success" });\n  }\n});`,
    patchTemplate: `app.post("/api/checkout", rateLimit({ max: 5 }), async (req, res) => {\n  const { token, amount } = req.body;\n  const valid = await checkTokenValid(token);\n  if (valid) {\n    await processCharge(amount);\n    return res.status(200).send({ status: "success" });\n  }\n});`,
    attackVector: "rapid_concurrent_payload_limit_1000"
  },
  {
    name: "session-hijack-insecure-cookie",
    title: "Missing secure flag on sensitive Admin SSR cookies",
    targetFile: "src/index.ts",
    vulnerableCode: `res.cookie('adminSession', sessionId, {\n  httpOnly: false,\n  maxAge: 900000\n});`,
    patchTemplate: `res.cookie('adminSession', sessionId, {\n  httpOnly: true,\n  secure: true,\n  sameSite: 'strict',\n  maxAge: 900000\n});`,
    attackVector: "hijack_unsecured_session_cookie"
  }
];

// Core simulator run route calling Gemini 3.5 Flash
app.post("/api/simulate", async (req, res) => {
  const { repoUrl, vulnerabilityType } = req.body;
  
  if (!repoUrl) {
    return res.status(400).json({ error: "Repository URL is required" });
  }

  // Find or default the vulnerability profile
  const profile = REPOSITORY_VULNERABILITIES.find(v => v.name === vulnerabilityType) || REPOSITORY_VULNERABILITIES[0];

  // If the SQL injection simulation is selected, return the exact requested User Experience JSON structure
  if (vulnerabilityType === "auth-service-sql-injection") {
    return res.json({
      success: true,
      profile,
      aiStats: {
        cvePlaceholder: "CVE-2024-SQLI-AUTO",
        severity: "critical",
        chaosMonkeyLogs: "[INFO] Initiating security simulation on login handler.\n[DEBUG] Dispatching payload to authentication endpoint: user='admin' OR '1'='1'\n[INFO] Backend executed query: SELECT * FROM users WHERE username = 'admin' OR '1'='1' AND password = 'any'\n[WARN] SQL statement logic bypassed. Authentication success status returned.\n[ALERT] Node security breach confirmed: simulated administrative privilege escalation.\n[INFO] Simulation concluded. Logging results to security dashboard.",
        observabilityAnalysis: "The vulnerability is located in 'src/services/auth.ts' inside the 'loginUser' function. Line 2 performs direct string concatenation of unvalidated user inputs ('username' and 'password') into the SQL query string, allowing arbitrary SQL execution.",
        remediationPatch: `async function loginUser(username, password) {\n  const query = "SELECT * FROM users WHERE username = ? AND password = ?";\n  const user = await db.query(query, [username, password]);\n  return user;\n}`,
        pullRequestTitle: "security: use parameterized queries in loginUser to mitigate SQL injection",
        pullRequestBody: "This automated pull request remediates a SQL injection vulnerability in the login handler within 'src/services/auth.ts'. Dynamic SQL string concatenation has been replaced with safe parameterized queries, ensuring user inputs are treated as literal values rather than executable SQL commands."
      }
    });
  }

  let responseText = "";
  let successfullyGenerated = false;
  
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      cvePlaceholder: { type: Type.STRING },
      severity: { type: Type.STRING },
      chaosMonkeyLogs: { type: Type.STRING },
      observabilityAnalysis: { type: Type.STRING },
      remediationPatch: { type: Type.STRING },
      pullRequestTitle: { type: Type.STRING },
      pullRequestBody: { type: Type.STRING }
    },
    required: ["cvePlaceholder", "severity", "chaosMonkeyLogs", "observabilityAnalysis", "remediationPatch", "pullRequestTitle", "pullRequestBody"]
  };

  const safePrompt = `You are a helpful education security reviewer called "CodexAegis" inside an education code evaluation simulator.
We are reviewing security architectures of target repositories to teach developers about secure programming techniques.
Target Repository URL: "${repoUrl}".
Focus Course Topic: "${profile.title}".
Review file: "${profile.targetFile}".
Vulnerable candidate code:
\`\`\`ts
${profile.vulnerableCode}
\`\`\`
Virtual review parameters: "${profile.attackVector}".

Generate secure coding sandbox responses. Ensure the text is comprehensive. Provide clear remediationPatch code containing proper parameterized logic, and standard log lines matching standard security checks. Output compliant JSON structure.
`;

  try {
    // Stage 1: Attempt the default standard text model
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: safePrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema
      }
    });
    responseText = response.text || "";
    successfullyGenerated = true;
  } catch (primaryError: any) {
    console.warn("Primary gemini-3.5-flash failed, attempting stable fallback model gemini-flash-latest:", primaryError.message || primaryError);
    try {
      // Stage 2: Attempt the stable general purpose alias model
      const fallbackResponse = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: safePrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema
        }
      });
      responseText = fallbackResponse.text || "";
      successfullyGenerated = true;
    } catch (secondaryError: any) {
      console.warn("Stable fallback model also encountered an issue, attempting schema-less text parsing:", secondaryError.message || secondaryError);
      try {
        // Stage 3: Attempt a raw schema-less query to minimize validation friction
        const rawResponse = await ai.models.generateContent({
          model: "gemini-flash-latest",
          contents: safePrompt + "\nOutput response ONLY as a single valid JSON object format matching the required properties. No markdown formatting, no comments.",
        });
        const cleanText = (rawResponse.text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
        JSON.parse(cleanText); // validate syntax
        responseText = cleanText;
        successfullyGenerated = true;
      } catch (lastError: any) {
        console.warn("All live model attempts exhausted. Loading local simulation stats safely.");
      }
    }
  }

  if (successfullyGenerated && responseText) {
    try {
      const parsedData = JSON.parse(responseText);
      return res.json({
        success: true,
        profile,
        aiStats: parsedData
      });
    } catch (parseError) {
      console.warn("Failed to parse live model response, activating simulation fallback stats");
    }
  }

  // Graceful fallback simulation mock data matching the exact schema but customized for current type
  return res.json({
    success: true,
    profile,
    isFallback: true,
    aiStats: {
      cvePlaceholder: vulnerabilityType === "payment-gateway-race-condition" ? "CVE-2024-RACE-AUTO" : "CVE-2024-COOKIE-AUTO",
      severity: vulnerabilityType === "payment-gateway-race-condition" ? "high" : "medium",
      chaosMonkeyLogs: vulnerabilityType === "payment-gateway-race-condition" 
        ? `[INFO] Initiating security simulation on Checkout route.\n[DEBUG] Dispatching rapid synchronous payload to endpoint: user_tokens=1000\n[WARN] API Gateway allowed concurrent resource state mutation bypass.\n[ALERT] Rate-limiting breach identified: checkout API balance bypassed.\n[INFO] Simulation concluded. Logs recorded successfully.`
        : `[INFO] Initiating vulnerability sweep on cookie handler.\n[DEBUG] Sniffing document cookies in client-side runtime payload\n[WARN] Sensitive session cookie found containing no HttpOnly flag.\n[ALERT] Security hazard: administrators session cookie exposed to unsafe client threads.\n[INFO] Sweep concluded. Results written.`,
      observabilityAnalysis: vulnerabilityType === "payment-gateway-race-condition"
        ? `The vulnerability is in 'src/api/gateway.ts' inside checkout endpoint block. Rapid synchronized API commands are authorized without standard request rate limiter throttling parameters.`
        : `The vulnerability is in 'src/index.ts'. The Cookie 'adminSession' is issued with httpOnly set to false, exposing authentication headers to cross-site injection attacks.`,
      remediationPatch: profile.patchTemplate,
      pullRequestTitle: vulnerabilityType === "payment-gateway-race-condition"
        ? `security: enforce request rate limiting bounds inside ${profile.targetFile}`
        : `security: enforce strict secure httpOnly settings on session cookie headers`,
      pullRequestBody: vulnerabilityType === "payment-gateway-race-condition"
        ? `This automated pull request remediates rate-limiting vulnerabilities inside '${profile.targetFile}' by configuring standard parameter guards and preventing resource exhaustion.`
        : `This automated pull request remediates cookie leakage vulnerabilities by adding httpOnly, secure, and sameSite configuration elements inside '${profile.targetFile}'.`
    }
  });
});

// Setup Vite Dev Server / Serve static assets in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CodexAegis custom multi-agent backend running on port ${PORT}`);
  });
}

startServer();
