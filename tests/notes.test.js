const { describe, it } = require("node:test")
const assert = require("node:assert/strict")
const { loadQmlJs, assertSame } = require("./helpers/loadQmlJs")

const Notes = loadQmlJs("lib/notes.js")

describe("notes.js", () => {
    it("pitchName converts MIDI pitches", () => {
        assert.equal(Notes.pitchName(60), "C4")
        assert.equal(Notes.pitchName(69), "A4")
        assert.equal(Notes.pitchName(0), "C-1")
    })

    it("pitchName / label handle invalid input", () => {
        assert.equal(Notes.pitchName(null), "?")
        assert.equal(Notes.label(null), "?")
        assert.equal(Notes.label({}), "?")
    })

    it("label reads note.pitch", () => {
        assert.equal(Notes.label({ pitch: 60 }), "C4")
    })

    it("uniquePitches returns sorted unique values", () => {
        const pitches = Notes.uniquePitches([
            { pitch: 64 },
            { pitch: 60 },
            { pitch: 64 },
            { pitch: 67 },
            null,
            {}
        ])
        assertSame(pitches, [60, 64, 67])
    })
})
