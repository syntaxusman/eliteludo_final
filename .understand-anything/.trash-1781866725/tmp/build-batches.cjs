const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = process.argv[2];
const skillDir = process.argv[3];
const ua = path.join(root, '.understand-anything');
const intermediate = path.join(ua, 'intermediate');
const tmp = path.join(ua, 'tmp');
const batches = JSON.parse(fs.readFileSync(path.join(intermediate, 'batches.json'), 'utf8')).batches;

const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2));
const kebab = (value) => String(value).replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
const complexity = (lines) => lines > 200 ? 'complex' : lines >= 50 ? 'moderate' : 'simple';
const basename = (p) => path.posix.basename(p);

function fileType(file) {
  const p = file.path.toLowerCase();
  if (file.fileCategory === 'config') return ['config', `config:${file.path}`];
  if (file.fileCategory === 'docs') return ['document', `document:${file.path}`];
  if (file.fileCategory === 'infra') {
    if (p.includes('.github/workflows/') || p.includes('.circleci/') || p.endsWith('.gitlab-ci.yml') || p.endsWith('jenkinsfile')) return ['pipeline', `pipeline:${file.path}`];
    if (p.endsWith('.tf') || p.endsWith('.tfvars') || p.endsWith('vagrantfile')) return ['resource', `resource:${file.path}`];
    return ['service', `service:${file.path}`];
  }
  if (file.fileCategory === 'data') {
    if (p.endsWith('.graphql') || p.endsWith('.gql') || p.endsWith('.proto') || p.endsWith('.prisma')) return ['schema', `schema:${file.path}`];
    if (p.endsWith('.sql')) return ['table', `table:${file.path}:${kebab(path.posix.basename(file.path, '.sql')) || 'migration'}`];
    return ['schema', `schema:${file.path}`];
  }
  return ['file', `file:${file.path}`];
}

function fileSummary(file, result) {
  const name = basename(file.path);
  const sections = (result.sections || []).slice(0, 3).map(s => s.name || s.title || s.key).filter(Boolean);
  if (file.fileCategory === 'docs') return `${name} documents ${sections.length ? sections.join(', ') : 'project guidance and reference material'}.`;
  if (file.fileCategory === 'config') return `${name} configures project tooling, dependencies, or runtime behavior.`;
  if (file.fileCategory === 'data') return `${name} defines database schema, migration, or structured project data.`;
  if (file.fileCategory === 'infra') return `${name} defines build, deployment, or infrastructure behavior.`;
  const parts = [];
  if ((result.functions || []).length) parts.push(`${result.functions.length} function${result.functions.length === 1 ? '' : 's'}`);
  if ((result.classes || []).length) parts.push(`${result.classes.length} class${result.classes.length === 1 ? '' : 'es'}`);
  return `${name} provides ${parts.length ? parts.join(' and ') : 'application code and declarations'} for the ${file.path.split('/')[0]} area.`;
}

function tagsFor(file, result) {
  const tags = [];
  if (file.fileCategory === 'docs') tags.push('documentation', file.path.toLowerCase().includes('readme') ? 'entry-point' : 'reference');
  else if (file.fileCategory === 'config') tags.push('configuration', 'build-system');
  else if (file.fileCategory === 'data') tags.push('database', 'schema-definition');
  else if (file.fileCategory === 'infra') tags.push('infrastructure', 'deployment');
  else {
    const p = file.path.toLowerCase();
    if (p.includes('/components/') || p.endsWith('.tsx')) tags.push('component');
    if (p.includes('/hooks/')) tags.push('hook');
    if (p.includes('/stores/')) tags.push('state-management');
    if (p.includes('/utils/')) tags.push('utility');
    if (p.includes('/tests/') || /\.(test|spec)\./.test(p)) tags.push('test');
    if (basename(p).startsWith('index.') || basename(p).startsWith('_layout.')) tags.push('entry-point');
    tags.push('source-code');
  }
  tags.push(file.language || 'unknown');
  return [...new Set(tags.map(kebab))].filter(Boolean).slice(0, 5);
}

function graphFor(batch, extracted) {
  const byPath = new Map((extracted.results || []).map(r => [r.path, r]));
  const nodes = [], edges = [];
  const fileIds = new Map();
  for (const file of batch.files) {
    const result = byPath.get(file.path) || { path: file.path, functions: [], classes: [], exports: [], nonEmptyLines: file.sizeLines };
    const [type, id] = fileType(file);
    fileIds.set(file.path, id);
    nodes.push({ id, type, name: basename(file.path), filePath: file.path, summary: fileSummary(file, result), tags: tagsFor(file, result), complexity: complexity(result.nonEmptyLines ?? file.sizeLines) });
    if (file.fileCategory !== 'code' && file.fileCategory !== 'script') continue;
    const exported = new Set((result.exports || []).map(e => e.name));
    for (const fn of result.functions || []) {
      const lines = Math.max(1, (fn.endLine || fn.startLine || 1) - (fn.startLine || 1) + 1);
      if (lines < 10 && !exported.has(fn.name)) continue;
      const childId = `function:${file.path}:${fn.name}`;
      nodes.push({ id: childId, type: 'function', name: fn.name, filePath: file.path, lineRange: [fn.startLine || 1, fn.endLine || fn.startLine || 1], summary: `${fn.name} implements a significant behavior within ${basename(file.path)}.`, tags: ['function', kebab(fn.name), 'behavior'].filter(Boolean), complexity: complexity(lines) });
      edges.push({ source: id, target: childId, type: 'contains', direction: 'forward', weight: 1 });
      if (exported.has(fn.name)) edges.push({ source: id, target: childId, type: 'exports', direction: 'forward', weight: 0.8 });
    }
    for (const cls of result.classes || []) {
      const lines = Math.max(1, (cls.endLine || cls.startLine || 1) - (cls.startLine || 1) + 1);
      if (lines < 20 && (cls.methods || []).length < 2 && !exported.has(cls.name)) continue;
      const childId = `class:${file.path}:${cls.name}`;
      nodes.push({ id: childId, type: 'class', name: cls.name, filePath: file.path, lineRange: [cls.startLine || 1, cls.endLine || cls.startLine || 1], summary: `${cls.name} groups related state and behavior in ${basename(file.path)}.`, tags: ['class', kebab(cls.name), 'abstraction'].filter(Boolean), complexity: complexity(lines) });
      edges.push({ source: id, target: childId, type: 'contains', direction: 'forward', weight: 1 });
      if (exported.has(cls.name)) edges.push({ source: id, target: childId, type: 'exports', direction: 'forward', weight: 0.8 });
    }
  }
  for (const file of batch.files) {
    const source = fileIds.get(file.path);
    for (const targetPath of (batch.batchImportData[file.path] || [])) {
      edges.push({ source, target: `file:${targetPath}`, type: 'imports', direction: 'forward', weight: 0.7 });
    }
  }
  return { nodes, edges };
}

function writeParts(batch, graph) {
  const old = fs.readdirSync(intermediate).filter(n => n === `batch-${batch.batchIndex}.json` || n.startsWith(`batch-${batch.batchIndex}-part-`));
  for (const n of old) fs.unlinkSync(path.join(intermediate, n));
  if (graph.nodes.length <= 60 && graph.edges.length <= 120) {
    writeJson(path.join(intermediate, `batch-${batch.batchIndex}.json`), graph);
    return 1;
  }
  const parts = Math.ceil(Math.max(graph.nodes.length / 60, graph.edges.length / 120));
  const files = [...batch.files].sort((a, b) => a.path.localeCompare(b.path));
  const chunkSize = Math.ceil(files.length / parts);
  for (let i = 0; i < parts; i++) {
    const paths = new Set(files.slice(i * chunkSize, (i + 1) * chunkSize).map(f => f.path));
    const nodes = graph.nodes.filter(n => paths.has(n.filePath));
    const ids = new Set(nodes.map(n => n.id));
    const edges = graph.edges.filter(e => ids.has(e.source));
    writeJson(path.join(intermediate, `batch-${batch.batchIndex}-part-${i + 1}.json`), { nodes, edges });
  }
  return parts;
}

let totalNodes = 0, totalEdges = 0;
for (const batch of batches) {
  const inputPath = path.join(tmp, `ua-file-analyzer-input-${batch.batchIndex}.json`);
  const outputPath = path.join(tmp, `ua-file-extract-results-${batch.batchIndex}.json`);
  writeJson(inputPath, { projectRoot: root, batchFiles: batch.files, batchImportData: batch.batchImportData });
  const proc = spawnSync(process.execPath, [path.join(skillDir, 'extract-structure.mjs'), inputPath, outputPath], { encoding: 'utf8' });
  if (proc.status !== 0 || !fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
    throw new Error(`Batch ${batch.batchIndex} extraction failed: ${proc.stderr || 'missing output'}`);
  }
  const extracted = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
  const graph = graphFor(batch, extracted);
  const partCount = writeParts(batch, graph);
  totalNodes += graph.nodes.length;
  totalEdges += graph.edges.length;
  process.stdout.write(`Analyzed batch ${batch.batchIndex}/${batches.length} (${batch.files.slice(0, 3).map(f => f.path).join(', ')}${batch.files.length > 3 ? ', ...' : ''}) — ${graph.nodes.length} nodes, ${graph.edges.length} edges, ${partCount} part(s)\n`);
}
process.stdout.write(`Completed ${batches.length} batches — ${totalNodes} nodes, ${totalEdges} edges\n`);
