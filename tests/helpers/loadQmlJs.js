/**
 * Load a MuseScore-style QML JS module (top-level functions) into Node.
 */
const fs = require("fs")
const path = require("path")
const vm = require("vm")
const assert = require("node:assert/strict")

function loadQmlJs(relativePath, extras) {
    const filename = path.resolve(__dirname, "..", "..", relativePath)
    const code = fs.readFileSync(filename, "utf8")
    const sandbox = Object.assign({
        console: console,
        Math: Math,
        JSON: JSON,
        Object: Object,
        Array: Array,
        String: String,
        Number: Number,
        Boolean: Boolean,
        Error: Error,
        RegExp: RegExp,
        parseInt: parseInt,
        isNaN: isNaN,
        undefined: undefined
    }, extras || {})

    vm.createContext(sandbox)
    vm.runInContext(code, sandbox, { filename: filename })

    const mod = {}
    for (const key of Object.keys(sandbox)) {
        if (typeof sandbox[key] === "function"
                && key !== "parseInt"
                && key !== "isNaN")
            mod[key] = sandbox[key]
    }
    return mod
}

/** deepEqual that ignores VM realm differences */
function assertSame(actual, expected) {
    assert.equal(JSON.stringify(actual), JSON.stringify(expected))
}

module.exports = { loadQmlJs, assertSame }
