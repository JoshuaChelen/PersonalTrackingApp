// Lightweight config for the pure logic tests (recommend/stats). These modules
// have no React Native runtime imports, so we transform TS with babel-preset-expo
// and run in a plain node environment — no need for the full RN jest preset.
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { presets: ['babel-preset-expo'] }],
  },
};
