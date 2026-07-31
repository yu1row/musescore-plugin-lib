/**
 * Discover and run *.test.js with Node's built-in test runner.
 * Avoids shell glob differences between Windows and Unix.
 */
const { spawnSync } = require("child_process")
const fs = require("fs")
const path = require("path")

const dir = __dirname
const files = fs.readdirSync(dir)
    .filter(function (name) { return name.endsWith(".test.js") })
    .map(function (name) { return path.join(dir, name) })
    .sort()

if (files.length === 0) {
    console.error("No test files found in " + dir)
    process.exit(1)
}

const result = spawnSync(
    process.execPath,
    ["--test", "--test-reporter", "spec"].concat(files),
    { stdio: "inherit" }
)

process.exit(result.status === null ? 1 : result.status)
