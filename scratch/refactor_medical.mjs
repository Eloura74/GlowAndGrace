import fs from 'fs';
import path from 'path';

const REPLACEMENTS = [
  // Termes
  { from: /Dépôt/g, to: 'Pharmacie' },
  { from: /dépôt/g, to: 'pharmacie' },
  { from: /Depot/g, to: 'Pharmacie' },
  { from: /depot/g, to: 'pharmacie' },
  { from: /Chantier/g, to: 'Patient' }, // au cas où
  { from: /chantier/g, to: 'patient' },
  // Icones Lucide
  { from: /HardHat/g, to: 'Activity' }, // Pour Patient / activité
  { from: /Wrench/g, to: 'Stethoscope' }, // Pour Matériel
  { from: /Truck/g, to: 'HeartPulse' } // Pour Chantiers Actifs / flux
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

const targetDirs = ['src', 'prisma'];
let allFiles = [];
targetDirs.forEach(d => {
  if (fs.existsSync(d)) allFiles = allFiles.concat(walk(d));
});

const ext = ['.ts', '.tsx', '.prisma', '.json'];

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
