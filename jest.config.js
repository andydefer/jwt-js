/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom', // nécessaire pour les hooks React ou Zustand
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
