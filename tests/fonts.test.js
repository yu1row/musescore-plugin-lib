const { describe, it } = require("node:test")
const assert = require("node:assert/strict")
const { loadQmlJs, assertSame } = require("./helpers/loadQmlJs")

const Fonts = loadQmlJs("lib/fonts.js")

describe("fonts.js", () => {
    const families = ["Arial", "KalimbaNotationJ", "Segoe UI"]

    it("isInstalled matches case-insensitively", () => {
        assert.equal(Fonts.isInstalled("kalimbanotationj", families), true)
        assert.equal(Fonts.isInstalled("Arial", families), true)
        assert.equal(Fonts.isInstalled("MissingFont", families), false)
    })

    it("missing returns only absent families", () => {
        assertSame(
            Fonts.missing(["KalimbaNotationJ", "KalimbaNotationE", "Arial"], families),
            ["KalimbaNotationE"]
        )
        assertSame(Fonts.missing(["Arial"], families), [])
    })

    it("missingMessage is empty when nothing missing", () => {
        assert.equal(Fonts.missingMessage([]), "")
        assert.equal(Fonts.missingMessage(null), "")
    })

    it("missingMessage lists families and supports custom template", () => {
        const msg = Fonts.missingMessage(["A", "B"])
        assert.match(msg, /• A/)
        assert.match(msg, /• B/)

        const custom = Fonts.missingMessage(["X"], "gone:\n%1")
        assert.match(custom, /gone:/)
        assert.match(custom, /• X/)
    })
})
