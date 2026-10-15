const fs = require('fs');
const path = require('path');

function scan(dir) {
  const findings = { secrets: 0, debug: 0, auth: 0, files: 0 };
  if (!fs.existsSync(dir)) return findings;

  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(js|ts|tsx|jsx|mjs|cjs|json|md|env|py|swift)$/.test(entry.name)) {
        findings.files++;
        let content;
        try { content = fs.readFileSync(full, 'utf8'); } catch { continue; }
        if (/sk_live_|AKIA|ghp_|xox[baprs]-|AIza|api[_-]?key|secret|token/i.test(content)) findings.secrets++;
        if (/console\.log\s*\(.*?(key|secret|token)|debugger;|print\(.*secret/i.test(content)) findings.debug++;
        if (/(admin|internal|debug)\s*(route|endpoint|path)/i.test(content) && !/(auth|protect|middleware)/i.test(content)) findings.auth++;
      }
    }
  }

  walk(dir);
  return findings;
}

function compare(beforePath, afterPath) {
  const before = scan(beforePath);
  const after = scan(afterPath);

  return {
    before,
    after,
    newSecrets: Math.max(0, after.secrets - before.secrets),
    newDebug: Math.max(0, after.debug - before.debug),
    newAuth: Math.max(0, after.auth - before.auth),
    filesDelta: after.files - before.files
  };
}

module.exports = { compare };
