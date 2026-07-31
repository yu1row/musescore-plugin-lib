const { describe, it } = require("node:test")
const assert = require("node:assert/strict")
const { loadQmlJs } = require("./helpers/loadQmlJs")

const Ann = loadQmlJs("lib/annotations.js")

describe("annotations.js", () => {
    it("tag / hasTag / stripTag round-trip with default ZWSP", () => {
        const tagged = Ann.tag("C4")
        assert.equal(tagged.charCodeAt(0), 0x200B)
        assert.equal(Ann.hasTag(tagged), true)
        assert.equal(Ann.stripTag(tagged), "C4")
        assert.equal(Ann.hasTag("C4"), false)
    })

    it("isOwned matches fontFace or tag", () => {
        const byFace = { type: 1, fontFace: "MyFont", text: "x" }
        assert.equal(Ann.isOwned(byFace, { fontFaces: ["MyFont"], elementType: 1 }), true)
        assert.equal(Ann.isOwned(byFace, { fontFaces: ["Other"], elementType: 1 }), false)

        const byTag = { type: 1, fontFace: "Arial", text: Ann.tag("x") }
        assert.equal(Ann.isOwned(byTag, { fontFaces: ["MyFont"], elementType: 1 }), true)

        const requireTag = { type: 1, fontFace: "MyFont", text: "plain" }
        assert.equal(Ann.isOwned(requireTag, {
            fontFaces: ["MyFont"],
            requireTag: true,
            elementType: 1
        }), false)
    })

    it("collectFromSegment filters by ownership and staff", () => {
        const owned = { type: 1, fontFace: "MyFont", text: Ann.tag("a"), track: 4 }
        const other = { type: 1, fontFace: "Arial", text: "x", track: 4 }
        const wrongStaff = { type: 1, fontFace: "MyFont", text: Ann.tag("b"), track: 8 }
        const segment = { annotations: [owned, other, wrongStaff] }

        const all = Ann.collectFromSegment(segment, { fontFaces: ["MyFont"], elementType: 1 })
        assert.equal(all.length, 2)

        const staff1 = Ann.collectFromSegment(segment, {
            fontFaces: ["MyFont"],
            elementType: 1,
            staffIdx: 1
        })
        assert.equal(staff1.length, 1)
        assert.strictEqual(staff1[0], owned)
    })

    it("unique deduplicates with is()", () => {
        const a = {
            id: 1,
            is: function (other) { return other && other.id === this.id }
        }
        const a2 = {
            id: 1,
            is: function (other) { return other && other.id === this.id }
        }
        const b = {
            id: 2,
            is: function (other) { return other && other.id === this.id }
        }
        assert.equal(Ann.unique([a, a2, b]).length, 2)
    })
})
