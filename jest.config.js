module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Test file patterns - only unit tests
  testMatch: [
    '**/tests/unit/**/*.test.ts',
    '**/__tests__/**/*.test.ts'
  ],
  
  // Exclude integration tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/integration/',
    '/tests/e2e/'
  ],
  
  // Module paths
  moduleFileExtensions: ['ts', 'js', 'json'],
  rootDir: './src',
  
  // Transform TypeScript files
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Test timeout
  testTimeout: 10000,
};
