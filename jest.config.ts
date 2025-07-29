const tsconfig = require('./tsconfig.json');
const { pathsToModuleNameMapper } = require('ts-jest');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)sx?$': ['ts-jest', { useESM: true }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!get-folder-size).+\\.js$'
  ],
  moduleNameMapper: {
    '^@admin/(.*)$': '<rootDir>/src/admin/$1',
    '^@caching/(.*)$': '<rootDir>/src/caching/$1',
    '^@captcha/(.*)$': '<rootDir>/src/captcha/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@library/(.*)$': '<rootDir>/src/library/$1',
    '^@locale/(.*)$': '<rootDir>/src/locale/$1',
    '^@persistence/(.*)$': '<rootDir>/src/persistence/$1',
    '^@posting/(.*)$': '<rootDir>/src/posting/$1',
    '^@restriction/(.*)$': '<rootDir>/src/restriction/$1',
  },
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: 'tsconfig.json',
    },
  },
};
