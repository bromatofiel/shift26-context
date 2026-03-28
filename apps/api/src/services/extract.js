import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PYTHON_SCRIPT = join(__dirname, '../../extract.py');
const VENV_PYTHON = join(__dirname, '../../../.venv/bin/python3');

export async function extractArticle(url, timeoutMs = 8000) {
  const timeoutSeconds = Math.floor(timeoutMs / 1000);

  return new Promise((resolve, reject) => {
    const python = spawn(VENV_PYTHON, [
      PYTHON_SCRIPT,
      url,
      timeoutSeconds.toString()
    ], {
      timeout: timeoutMs + 2000
    });

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0 && !stdout) {
        console.error(`[extractArticle] Python exited with code ${code}`);
        console.error(`[stderr] ${stderr}`);
        return reject(new Error(`Extraction failed with code ${code}`));
      }

      try {
        const result = JSON.parse(stdout.trim());
        
        if (result.error) {
          return reject(new Error(result.error));
        }

        // Normalize output to match previous format
        resolve({
          finalUrl: result.final_url || url,
          hostname: result.hostname || safeHostname(url),
          title: result.title || "Article sans titre",
          byline: result.author || null,
          excerpt: extractExcerpt(result.text || ""),
          contentText: cleanText(result.text || ""),
          contentHtml: result.html || "",
          siteName: result.sitename || result.hostname || safeHostname(url),
          lang: null,
          extractionMethod: result.method || "trafilatura"
        });
      } catch (e) {
        console.error("[extractArticle] Failed to parse Python output:", stdout);
        reject(new Error("Invalid extraction output"));
      }
    });

    python.on('error', (err) => {
      reject(new Error(`Failed to start Python: ${err.message}`));
    });
  });
}

function extractExcerpt(text) {
  if (!text) return "";
  const sentences = text.split(/[.!?]+/).slice(0, 2).join('. ');
  return cleanText(sentences).slice(0, 280);
}

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function safeHostname(value) {
  try {
    const url = new URL(value);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// Re-export from article.js (the new robust JS implementation)
export { fetchArticle } from './article.js';
