module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/__tests__/**/*.test.ts'
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
