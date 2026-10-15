#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { compare } = require('../src/diff');
const { generateDiffSVG } = require('../src/svg');

const before = process.argv[2];
const after = process.argv[3];
const outFile = process.argv[4] || 'agentdiff.svg';

if (!before || !after) {
  console.log('\nUsage: npx agentdiff <before-path> <after-path> [output.svg]\n');
  console.log('Example: npx agentdiff ./before ./after my-diff.svg\n');
  process.exit(1);
}

console.log('\n🔍 agentdiff — security diff of your AI coding session\n');

const result = compare(before, after);
const svg = generateDiffSVG(result);

fs.writeFileSync(outFile, svg);

console.log(`Diff written to ${outFile}`);
console.log(`New secrets: ${result.newSecrets}`);
console.log(`New debug leftovers: ${result.newDebug}`);
console.log(`New risky routes: ${result.newAuth}`);
console.log('\nOpen the SVG or embed it in a PR / README.\n');
