/**
 * Script de vérification de la configuration Gemini
 * Usage: npx tsx scripts/check-gemini-config.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

interface CheckResult {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
}

const checks: CheckResult[] = [];

console.log('🔍 Vérification de la configuration Gemini...\n');

// 1. Vérifier l'existence du fichier .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  checks.push({
    name: 'Fichier .env.local',
    status: 'success',
    message: 'Le fichier .env.local existe',
  });
} else {
  checks.push({
    name: 'Fichier .env.local',
    status: 'error',
    message:
      'Le fichier .env.local est manquant. Copiez .env.example vers .env.local',
  });
}

// 2. Vérifier AI_PROVIDER
const aiProvider = process.env.AI_PROVIDER;
if (aiProvider === 'gemini') {
  checks.push({
    name: 'AI_PROVIDER',
    status: 'success',
    message: `AI_PROVIDER est configuré sur "gemini"`,
  });
} else if (aiProvider) {
  checks.push({
    name: 'AI_PROVIDER',
    status: 'warning',
    message: `AI_PROVIDER est configuré sur "${aiProvider}" (pas Gemini)`,
  });
} else {
  checks.push({
    name: 'AI_PROVIDER',
    status: 'error',
    message: "AI_PROVIDER n'est pas défini",
  });
}

// 3. Vérifier GEMINI_API_KEY
const geminiKey = process.env.GEMINI_API_KEY;
if (geminiKey) {
  if (geminiKey.startsWith('AIzaSy')) {
    checks.push({
      name: 'GEMINI_API_KEY',
      status: 'success',
      message: `GEMINI_API_KEY est défini (${geminiKey.slice(0, 10)}...${geminiKey.slice(-4)})`,
    });
  } else {
    checks.push({
      name: 'GEMINI_API_KEY',
      status: 'warning',
      message:
        'GEMINI_API_KEY ne commence pas par "AIzaSy" (format inhabituel)',
    });
  }
} else {
  checks.push({
    name: 'GEMINI_API_KEY',
    status: 'error',
    message: "GEMINI_API_KEY n'est pas défini",
  });
}

// 4. Vérifier GEMINI_MODEL
const geminiModel = process.env.GEMINI_MODEL;
if (geminiModel) {
  checks.push({
    name: 'GEMINI_MODEL',
    status: 'success',
    message: `Modèle configuré: ${geminiModel}`,
  });
} else {
  checks.push({
    name: 'GEMINI_MODEL',
    status: 'warning',
    message: 'GEMINI_MODEL non défini (utilisera gemini-1.5-pro par défaut)',
  });
}

// 5. Vérifier le package @google/generative-ai
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const hasGeminiPackage = packageJson.dependencies?.['@google/generative-ai'];

  if (hasGeminiPackage) {
    checks.push({
      name: 'Package @google/generative-ai',
      status: 'success',
      message: `Installé (version ${hasGeminiPackage})`,
    });
  } else {
    checks.push({
      name: 'Package @google/generative-ai',
      status: 'error',
      message: 'Package manquant dans package.json',
    });
  }
} else {
  checks.push({
    name: 'Package @google/generative-ai',
    status: 'error',
    message: 'Impossible de lire package.json',
  });
}

// 6. Vérifier l'installation dans node_modules
const nodeModulesPath = path.join(
  process.cwd(),
  'node_modules',
  '@google',
  'generative-ai'
);
if (fs.existsSync(nodeModulesPath)) {
  checks.push({
    name: 'Installation node_modules',
    status: 'success',
    message: '@google/generative-ai est installé dans node_modules',
  });
} else {
  checks.push({
    name: 'Installation node_modules',
    status: 'error',
    message: "@google/generative-ai n'est pas installé. Lancez: npm install",
  });
}

// 7. Vérifier l'existence du fichier adapter
const adapterPath = path.join(
  process.cwd(),
  'src',
  'modules',
  'ai-assistant',
  'infrastructure',
  'ai',
  'GeminiAdapter.ts'
);
if (fs.existsSync(adapterPath)) {
  checks.push({
    name: 'GeminiAdapter.ts',
    status: 'success',
    message: 'Le fichier adapter existe',
  });
} else {
  checks.push({
    name: 'GeminiAdapter.ts',
    status: 'error',
    message: 'Le fichier GeminiAdapter.ts est manquant',
  });
}

// Afficher les résultats
console.log('📋 Résultats de la vérification:\n');

const getIcon = (status: CheckResult['status']) => {
  switch (status) {
    case 'success':
      return '✅';
    case 'warning':
      return '⚠️';
    case 'error':
      return '❌';
  }
};

checks.forEach((check) => {
  console.log(`${getIcon(check.status)} ${check.name}`);
  console.log(`   ${check.message}\n`);
});

// Résumé
const successCount = checks.filter((c) => c.status === 'success').length;
const warningCount = checks.filter((c) => c.status === 'warning').length;
const errorCount = checks.filter((c) => c.status === 'error').length;

console.log('─'.repeat(60));
console.log(
  `\n📊 Résumé: ${successCount} succès, ${warningCount} avertissements, ${errorCount} erreurs\n`
);

if (errorCount === 0 && warningCount === 0) {
  console.log(
    "🎉 Configuration Gemini parfaite ! Vous pouvez lancer l'application.\n"
  );
  process.exit(0);
} else if (errorCount === 0) {
  console.log(
    '✅ Configuration Gemini fonctionnelle avec des avertissements mineurs.\n'
  );
  process.exit(0);
} else {
  console.log(
    '❌ Des erreurs critiques ont été détectées. Corrigez-les avant de continuer.\n'
  );
  console.log('💡 Consultez le guide: docs/guide-demarrage-gemini.md\n');
  process.exit(1);
}
