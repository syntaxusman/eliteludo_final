const fs = require('fs');
const path = require('path');
const root = process.argv[2];
const graph = JSON.parse(fs.readFileSync(path.join(root, '.understand-anything/intermediate/assembled-graph.json'), 'utf8'));
const fileTypes = new Set(['file','config','document','service','pipeline','table','schema','resource','endpoint']);
const layers = [
  { id:'layer:ui', name:'Application UI', description:'Expo Router screens, reusable React Native components, and Skia-powered visual presentation for Elite Ludo.', nodeIds:[] },
  { id:'layer:game-domain', name:'Game Domain', description:'Ludo rules, board state, move generation, AI decisions, and gameplay-specific types.', nodeIds:[] },
  { id:'layer:services-state', name:'Services & State', description:'Zustand stores, Supabase clients, edge functions, hooks, and runtime integrations that coordinate application behavior.', nodeIds:[] },
  { id:'layer:shared-foundation', name:'Shared Foundation', description:'Themes, assets, constants, reusable types, and cross-cutting utilities shared throughout the mobile app.', nodeIds:[] },
  { id:'layer:data', name:'Data Layer', description:'Supabase SQL migrations and schemas defining persistent game, profile, economy, and matchmaking data.', nodeIds:[] },
  { id:'layer:configuration', name:'Project Configuration', description:'Expo, TypeScript, package, environment, linting, and tool configuration governing builds and development.', nodeIds:[] },
  { id:'layer:product-documentation', name:'Product Documentation', description:'Elite Ludo product, architecture, testing, release, and onboarding documentation.', nodeIds:[] },
  { id:'layer:agent-knowledge', name:'Agent Knowledge', description:'Repository-local coding skills and reference material used by AI development agents.', nodeIds:[] }
];
const byId = new Map(layers.map(l => [l.id, l]));
for (const node of graph.nodes.filter(n => fileTypes.has(n.type))) {
  const p = (node.filePath || '').replace(/\\/g,'/').toLowerCase();
  let id;
  if (p.startsWith('.agents/') || p.startsWith('.claude/')) id='layer:agent-knowledge';
  else if (node.type === 'table' || node.type === 'schema' || p.startsWith('supabase/migrations/')) id='layer:data';
  else if (p.startsWith('docs/') || p === 'readme.md') id='layer:product-documentation';
  else if (p.startsWith('app/') || p.startsWith('src/components/') || p.startsWith('src/skia/')) id='layer:ui';
  else if (p.startsWith('src/game/')) id='layer:game-domain';
  else if (p.startsWith('src/stores/') || p.startsWith('src/hooks/') || p.startsWith('src/supabase/') || p.startsWith('supabase/functions/')) id='layer:services-state';
  else if (p.startsWith('src/theme/') || p.startsWith('src/utils/') || p.startsWith('src/types/') || p.startsWith('src/constants/') || p.startsWith('src/assets/')) id='layer:shared-foundation';
  else if (node.type === 'config' || node.type === 'service' || node.type === 'pipeline' || node.type === 'resource' || !p.includes('/')) id='layer:configuration';
  else id='layer:shared-foundation';
  byId.get(id).nodeIds.push(node.id);
}
const finalLayers = layers.filter(l => l.nodeIds.length);
fs.writeFileSync(path.join(root, '.understand-anything/intermediate/layers.json'), JSON.stringify(finalLayers, null, 2));
console.log(finalLayers.map(l => `${l.name}: ${l.nodeIds.length}`).join('\n'));
