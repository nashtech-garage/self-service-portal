module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['cobertura', 'html'],
  testEnvironment: "jest-environment-jsdom",
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "node"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  setupFilesAfterEnv: ["<rootDir>/support/setupTests.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  // add other aliases as needed
  // Mock CSS/SCSS imports:
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^@pages/(.*)$": "<rootDir>/src/pages/$1",
    "^@pages$": "<rootDir>/src/pages",
    "^@config$": "<rootDir>/src/config",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@store$": "<rootDir>/src/store/index.ts",
    "^@store/(.*)$": "<rootDir>/src/store/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@schemas/(.*)$": "<rootDir>/src/schemas/$1",
    "^@entities/(.*)$": "<rootDir>/src/entities/$1",
    "^@entities$": "<rootDir>/src/types",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@constants/(.*)$": "<rootDir>/src/constants/$1",
    "^@css$": "<rootDir>/src/css",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "\\.(css|scss)$": "identity-obj-proxy",
  },
  reporters: [
    "default",
    ["jest-junit", {
      outputDirectory: "./junit",
      outputName: "junit.xml",
    }],
  ],
};
