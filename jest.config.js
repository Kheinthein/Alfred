const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/tests/e2e/'],
  // Les tests d'intégration partagent le même SQLite (test.db) :
  // forcer l'exécution séquentielle évite les race conditions entre workers.
  maxWorkers: 1,
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
      },
    }],
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    // Fichiers de types et configuration
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/container.ts',
    // Pages Next.js, layouts et routes API (couverts par tests E2E et d'intégration)
    '!src/app/**',
    // Composants UI React (couverts par tests E2E)
    '!src/components/**',
    // Couche présentation frontend (couverte par E2E)
    '!src/shared/services/**',
    '!src/shared/providers/**',
    '!src/shared/utils/**',
    '!src/shared/hooks/**',
    // Modules sans tests unitaires dédiés (à couvrir progressivement)
    '!src/modules/book/**',
    '!src/modules/ai-assistant/infrastructure/ai/ClaudeAdapter.ts',
    '!src/modules/ai-assistant/infrastructure/ai/OpenAIAdapter.ts',
    '!src/modules/ai-assistant/infrastructure/ai/AIAdapterFactory.ts',
  ],
  coverageThreshold: {
    global: {
      // Périmètre : domaine métier (entities, use-cases, value-objects)
      // + infrastructure testée (repositories document/user, adapters AI)
      branches: 55,
      functions: 65,
      lines: 65,
      statements: 65,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@app/(.*)$': '<rootDir>/src/app/$1',
  },
  setupFiles: ['<rootDir>/tests/setup-env.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 10000,
  // Force Jest à quitter même si des handles asynchrones restent ouverts
  // (connexions Prisma, timers du rate limiter, etc.)
  forceExit: true,
  moduleDirectories: ['node_modules', '<rootDir>'],
};

module.exports = createJestConfig(customJestConfig);

