const { describe, it } = require("node:test")
const assert = require("node:assert/strict")
const { loadQmlJs, assertSame } = require("./helpers/loadQmlJs")

const Element = { NOTE: 1, CHORD: 2, REST: 3 }
const Elements = loadQmlJs("lib/elements.js", { Element: Element })
const Selection = loadQmlJs("lib/selection.js")

describe("elements.js", () => {
    it("detects note / chord / rest", () => {
        assert.equal(Elements.isNote({ type: Element.NOTE }), true)
        assert.equal(Elements.isChord({ type: Element.CHORD }), true)
        assert.equal(Elements.isRest({ type: Element.REST }), true)
        assert.equal(Elements.isChordRest({ type: Element.CHORD }), true)
        assert.equal(Elements.isChordRest({ type: Element.NOTE }), false)
    })

    it("asNotes expands chords and wraps notes", () => {
        const n1 = { type: Element.NOTE, pitch: 60 }
        const n2 = { type: Element.NOTE, pitch: 64 }
        assert.equal(Elements.asNotes(n1)[0], n1)
        assertSame(
            Elements.asNotes({ type: Element.CHORD, notes: [n1, n2] }),
            [n1, n2]
        )
        assertSame(Elements.asNotes({ type: Element.REST }), [])
    })
})

describe("selection.js", () => {
    it("reports empty selection", () => {
        assert.equal(Selection.hasSelection(null), false)
        assert.equal(Selection.hasSelection({ selection: { elements: [] } }), false)
    })

    it("filters selected elements by type", () => {
        const score = {
            selection: {
                elements: [
                    { type: Element.NOTE, id: "a" },
                    { type: Element.REST, id: "b" },
                    { type: Element.NOTE, id: "c" }
                ]
            }
        }
        assert.equal(Selection.elements(score).length, 3)
        assertSame(
            Selection.ofType(score, Element.NOTE).map(function (e) { return e.id }),
            ["a", "c"]
        )

        const seen = []
        Selection.forEach(score, function (el, i) { seen.push(i + ":" + el.id) })
        assertSame(seen, ["0:a", "1:b", "2:c"])
    })
})
