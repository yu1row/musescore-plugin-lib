const { describe, it } = require("node:test")
const assert = require("node:assert/strict")
const { loadQmlJs, assertSame } = require("./helpers/loadQmlJs")

const Version = loadQmlJs("lib/version.js")

describe("version.js", () => {
    describe("parse", () => {
        it("parses dotted versions", () => {
            assertSame(Version.parse("4.4.2"), {
                major: 4,
                minor: 4,
                update: 2
            })
        })

        it("fills missing parts with 0 and strips v prefix", () => {
            assertSame(Version.parse("v4.5"), {
                major: 4,
                minor: 5,
                update: 0
            })
        })

        it("accepts objects", () => {
            assertSame(Version.parse({ major: 4, minor: 4 }), {
                major: 4,
                minor: 4,
                update: 0
            })
        })

        it("returns null for invalid input", () => {
            assert.equal(Version.parse(null), null)
            assert.equal(Version.parse(""), null)
            assert.equal(Version.parse(12), null)
            assert.equal(Version.parse("bad"), null)
        })
    })

    describe("format / compare", () => {
        it("formats triples", () => {
            assert.equal(Version.format(4, 4, 0), "4.4.0")
        })

        it("compares versions", () => {
            assert.equal(Version.compare("4.3.2", "4.4.0"), -1)
            assert.equal(Version.compare("4.4.0", "4.4.0"), 0)
            assert.equal(Version.compare("4.5.0", "4.4.0"), 1)
            assert.ok(Number.isNaN(Version.compare("bad", "4.4.0")))
        })
    })

    describe("isAtLeast / requireAtLeast", () => {
        it("gates inclusive minimum", () => {
            assert.equal(Version.isAtLeast(4, 4, 0, "4.4.0"), true)
            assert.equal(Version.isAtLeast(4, 3, 9, "4.4.0"), false)
            assert.equal(Version.isAtLeast(5, 0, 0, "4.4.0"), true)
        })

        it("returns gate object", () => {
            const ok = Version.requireAtLeast(4, 4, 1, "4.4.0")
            assert.equal(ok.ok, true)
            assert.equal(ok.current, "4.4.1")
            assert.equal(ok.required, "4.4.0")

            const ng = Version.requireAtLeast(4, 3, 0, "4.4.0")
            assert.equal(ng.ok, false)
            assert.match(ng.message, /requires MuseScore 4\.4\.0/)
        })
    })

    describe("requirePluginAtLeast", () => {
        it("reads plugin version fields", () => {
            const plugin = {
                mscoreMajorVersion: 4,
                mscoreMinorVersion: 5,
                mscoreUpdateVersion: 2
            }
            const gate = Version.requirePluginAtLeast(plugin, "4.4.0")
            assert.equal(gate.ok, true)
            assert.equal(Version.pluginVersionString(plugin), "4.5.2")
        })

        it("fails when plugin is missing", () => {
            const gate = Version.requirePluginAtLeast(null, "4.4.0")
            assert.equal(gate.ok, false)
            assert.equal(gate.current, "unknown")
        })
    })
})
