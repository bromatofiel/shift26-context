import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { analyzeRequestSchema } from "./schema.js";
import { runAnalysis } from "./services/analyze.js";

const app = express();
const port = config.port;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    version: "0.1.0",
    uptime_ms: Math.round(process.uptime() * 1000)
  });
});

app.post("/api/analyze", async (req, res) => {
  try {
    const input = analyzeRequestSchema.parse(req.body);
    const result = await runAnalysis(input);
    return res.json(result);
  } catch (error) {
    const isRequestValidationError =
      error?.name === "ZodError" &&
      Array.isArray(error?.issues) &&
      error.issues.every((issue) => (issue.path || []).length > 0);
    console.error("[/api/analyze] request failed", {
      body: req.body,
      error: error?.issues || error?.message || error
    });
    return res.status(isRequestValidationError ? 400 : 500).json({
      request_id: crypto.randomUUID(),
      status: "error",
      code: isRequestValidationError ? "INVALID_REQUEST" : "ANALYSIS_FAILED",
      message: isRequestValidationError
        ? "Invalid analyze payload."
        : error?.message || "Blind Spot could not analyze this article.",
      retryable: !isRequestValidationError
    });
  }
});

app.listen(port, () => {
  console.log(`Blind Spot API listening on http://localhost:${port}`);
});
