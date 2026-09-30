// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
    clearMocks: true,
    coverageDirectory: 'temp/coverage',
    testEnvironment: 'jsdom',
    collectCoverage: true,
    reporters: ['default'],
    collectCoverageFrom: [
        'ui-src/**/*.ts*',
        '!ui-src/**/*.stories.tsx',
        '!ui-src/**/*.types.ts',
        '!ui-src/**/*.d.ts',
        '!ui-src/**/index.ts*'
    ],
    reporters: [
        'default',
        [
            './node_modules/jest-html-reporter',
            {
                pageTitle: 'Test Report',
                outputPath: './temp/testResult.html'
            }
        ]
    ],
    setupFilesAfterEnv: ['<rootDir>/internals/jestSettings.js'],
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest'
    },
    moduleNameMapper: {
        '\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/internals/__mocks__/fileMock.js',
        '\\.svg': '<rootDir>/internals/__mocks__/svg.js'
    },
    verbose: false,
    testPathIgnorePatterns: ['/node_modules/', 'temp'],
    transformIgnorePatterns: []
};
