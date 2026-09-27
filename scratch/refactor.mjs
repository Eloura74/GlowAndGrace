import fs from 'fs';
import path from 'path';

const REPLACEMENTS = [
  { from: /Chantier/g, to: 'Patient' },
  { from: /chantier/g, to: 'patient' },
  { from: /Chantiers/g, to: 'Patients' },
  { from: /chantiers/g, to: 'patients' },
  { from: /Outillage/g, to: 'Materiel' },
  { from: /outillage/g, to: 'materiel' },
  { from: /Outillages/g, to: 'Materiels' },
  { from: /outillages/g, to: 'materiels' },
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

// Extensions to modify
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

// Now rename files and directories
const RENAME_MAP = [
  { old: 'src/app/chantiers', new: 'src/app/patients' },
  { old: 'src/app/outillage', new: 'src/app/materiel' },
  { old: 'src/components/OutillageCard.tsx', new: 'src/components/MaterielCard.tsx' },
  { old: 'src/components/OutillageForm.tsx', new: 'src/components/MaterielForm.tsx' },
  { old: 'src/components/EmpruntOutillageForm.tsx', new: 'src/components/EmpruntMaterielForm.tsx' },
];

for (const { old: o, new: n } of RENAME_MAP) {
  if (fs.existsSync(o)) {
    fs.renameSync(o, n);
    console.log(`Renamed: ${o} -> ${n}`);
  }
}

// Delete folders
const DELETE_FOLDERS = [
  'src/app/reception-magique',
  'src/app/equipe',
  'src/app/guide',
];

for (const d of DELETE_FOLDERS) {
  if (fs.existsSync(d)) {
    fs.rmSync(d, { recursive: true, force: true });
    console.log(`Deleted: ${d}`);
  }
}
