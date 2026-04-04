module.exports = {
  projects: [
    {
      displayName: "components",
      testEnvironment: "jsdom",
      testMatch: ["<rootDir>/__tests__/components/**/*.test.js"],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
      transform: {
        "^.+\\.jsx?$": "babel-jest",
      },
    },
    {
      displayName: "api",
      testEnvironment: "node",
      testMatch: ["<rootDir>/__tests__/api/**/*.test.js"],
      transform: {
        "^.+\\.jsx?$": "babel-jest",
      },
    },
  ],
};
