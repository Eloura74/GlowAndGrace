import fs from 'fs';
import path from 'path';

const REPLACEMENTS = [
  // Termes
  { from: /outil/gi, to: match => {
      if (match === 'OUTIL') return 'DISPOSITIF';
      if (match === 'Outil') return 'Dispositif';
      if (match === 'outils') return 'dispositifs';
      if (match === 'Outils') return 'Dispositifs';
      return 'dispositif';
  }},
  { from: /machine/gi, to: match => {
      if (match === 'MACHINE') return 'DISPOSITIF';
      if (match === 'Machine') return 'Dispositif';
      if (match === 'machines') return 'dispositifs';
      if (match === 'Machines') return 'Dispositifs';
      return 'dispositif';
  }},
  { from: /équipements onéreux/gi, to: 'dispositifs médicaux onéreux' },
  { from: /Au pharmacie/g, to: 'En pharmacie' } // Fix previous grammatical error
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

const targetDirs = ['src'];
let allFiles = [];
targetDirs.forEach(d => {
  if (fs.existsSync(d)) allFiles = allFiles.concat(walk(d));
});

const ext = ['.ts', '.tsx'];

for (const file of allFiles) {
  if (ext.includes(path.extname(file))) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    for (const { from, to } of REPLACEMENTS) {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    }
    if (modified) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Modified: ${file}`);
    }
  }
}
