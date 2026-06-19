const fs = require('fs');
const path = require('path');
const root = process.argv[2];
const dir = path.join(root, '.understand-anything/intermediate');
const assembled = JSON.parse(fs.readFileSync(path.join(dir, 'assembled-graph.json'), 'utf8'));
const layers = JSON.parse(fs.readFileSync(path.join(dir, 'layers.json'), 'utf8'));
const tour = JSON.parse(fs.readFileSync(path.join(dir, 'tour.json'), 'utf8'));
const graph = {
  version: '1.0.0',
  project: {
    name: 'elite_ludo_final',
    languages: ['config','javascript','json','markdown','sql','txt','typescript','unknown'],
    frameworks: ['Expo','React','React Native','Supabase','Zustand'],
    description: 'Premium black-and-gold Ludo game for Android, built with Expo and React Native.',
    analyzedAt: new Date().toISOString(),
    gitCommitHash: 'a0e77b08a650c16e1793c9efaa10b8bf6fd73454'
  },
  nodes: assembled.nodes,
  edges: assembled.edges,
  layers,
  tour
};
fs.writeFileSync(path.join(dir, 'assembled-graph.json'), JSON.stringify(graph, null, 2));

