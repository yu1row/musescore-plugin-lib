const { describe, it } = require("node:test")
const assert = require("node:assert/strict")
const { loadQmlJs, assertSame } = require("./helpers/loadQmlJs")

const Log = loadQmlJs("lib/log.js")

describe("log.js", () => {
    it("buffers formatted lines", () => {
        const logger = Log.create({ prefix: "P: " })
        Log.info(logger, "hello")
        Log.warn(logger, "careful")
        assertSame(Log.dump(logger), "[INFO] P: hello\n[WARN] P: careful")
    })

    it("clear empties the buffer", () => {
        const logger = Log.create()
        Log.error(logger, "x")
        Log.clear(logger)
        assert.equal(Log.dump(logger), "")
    })

    it("writeFile uses FileIO.write", () => {
        const logger = Log.create()
        Log.info(logger, "saved")
        let written = null
        const fileIO = {
            write: function (data) {
                written = data
                return true
            }
        }
        assert.equal(Log.writeFile(logger, fileIO), true)
        assert.equal(written, "[INFO] saved\n")
    })

    it("appendFile concatenates with previous content", () => {
        const logger = Log.create()
        Log.info(logger, "b")
        const fileIO = {
            read: function () { return "[INFO] a\n" },
            write: function (data) {
                this._data = data
                return true
            }
        }
        assert.equal(Log.appendFile(logger, fileIO), true)
        assert.equal(fileIO._data, "[INFO] a\n[INFO] b\n")
    })

    it("tempLogPath joins tempPath and file name", () => {
        const fileIO = {
            tempPath: function () { return "C:\\Temp" }
        }
        assert.equal(
            Log.tempLogPath(fileIO, "plugin.log"),
            "C:\\Temp\\plugin.log"
        )
    })

    it("writeFile returns false without FileIO", () => {
        assert.equal(Log.writeFile(Log.create(), null), false)
    })
})
