module.exports = {
  preset: "jest-puppeteer",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  testPathIgnorePatterns: ["/lib/", "/node_modules/"],
  moduleFileExtensions: ["ts", "js", "jsx", "json", "node"],
  preset: "ts-jest",
  rootDir: "./src",
  verbose: true,
  setupFilesAfterEnv: ["expect-puppeteer"]
}