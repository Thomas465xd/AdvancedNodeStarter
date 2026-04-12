export default {
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",
    setupFilesAfterEnv: ["./src/tests/setup.ts"],
    extensionsToTreatAsEsm: [".ts"],
    // Run test files sequentially — all workers share a single Atlas DB,
    // so parallel execution causes race conditions (one worker's beforeEach
    // wipes collections while another worker's login() is creating users).
    maxWorkers: 1,
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    transform: {
        "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
    },
};
