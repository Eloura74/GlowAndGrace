import fs from 'fs';
import path from 'path';

const REPLACEMENTS = [
  { from: /Patient/g, to: 'Client' },
  { from: /patient/g, to: 'client' },
  { from: /Patients/g, to: 'Clients' },
  { from: /patients/g, to: 'clients' },

  { from: /Article/g, to: 'Produit' },
  { from: /article/g, to: 'produit' },
  { from: /Articles/g, to: 'Produits' },
  { from: /articles/g, to: 'produits' },

  { from: /Materiel/g, to: 'Equipement' },
  { from: /materiel/g, to: 'equipement' },
  { from: /Materiels/g, to: 'Equipements' },
  { from: /materiels/g, to: 'equipements' },
  
  { from: /Infirmier/g, to: 'Estheticienne' },
  { from: /INFIRMIER/g, to: 'ESTHETICIENNE' },
  { from: /infirmier/g, to: 'estheticienne' },
  
  { from: /depart-matin/g, to: 'cabine' },
  { from: /DepartMatin/g, to: 'Cabine' },
  { from: /Depart Matin/g, to: 'Cabine' },
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

const ext = ['.ts', '.tsx', '.prisma', '.json', '.mjs', '.md'];

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

// Rename files and directories safely
const RENAME_MAP = [
  { old: 'src/app/patients', new: 'src/app/clients' },
  { old: 'src/app/materiel', new: 'src/app/equipement' },
  { old: 'src/app/depart-matin', new: 'src/app/cabine' },
  
  { old: 'src/app/actions/patients.ts', new: 'src/app/actions/clients.ts' },
  { old: 'src/app/actions/materiel.ts', new: 'src/app/actions/equipement.ts' },
  { old: 'src/app/actions/articles.ts', new: 'src/app/actions/produits.ts' },
  
  { old: 'src/components/MaterielCard.tsx', new: 'src/components/EquipementCard.tsx' },
  { old: 'src/components/MaterielForm.tsx', new: 'src/components/EquipementForm.tsx' },
  { old: 'src/components/EmpruntMaterielForm.tsx', new: 'src/components/EmpruntEquipementForm.tsx' },
  { old: 'src/app/cabine/DepartMatinClient.tsx', new: 'src/app/cabine/CabineClient.tsx' }
];

for (const { old: o, new: n } of RENAME_MAP) {
  if (fs.existsSync(o)) {
    fs.renameSync(o, n);
    console.log(`Renamed: ${o} -> ${n}`);
  }
}
