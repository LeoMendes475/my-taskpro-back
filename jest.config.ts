import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './src',
  testMatch: ['**/__tests__/**/*.spec.ts'],
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^@modules/(.*)$': '<rootDir>/modules/$1',
  },
  // Silence winston logs during tests
  setupFiles: ['<rootDir>/__tests__/setup.ts'],
  resetMocks: true,
  collectCoverageFrom: [
    '**/*.ts',
    '!**/__tests__/**',
    '!**/node_modules/**',
    '!server.ts',
    '!shared/docs/**',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: '../coverage',
}

export default config
