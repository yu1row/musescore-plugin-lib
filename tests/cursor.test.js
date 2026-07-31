const { describe, it } = require("node:test")
const assert = require("node:assert/strict")
const { loadQmlJs, assertSame } = require("./helpers/loadQmlJs")

const Element = { CHORD: 1, REST: 2, NOTE: 3 }
const CursorUtil = loadQmlJs("lib/cursor.js", { Element: Element })

function makeCursor(steps) {
    const state = {
        index: -1,
        rewindMode: null,
        steps: steps || []
    }

    function applyIndex(i) {
        state.index = i
        if (i < 0 || i >= state.steps.length) {
            cursor.segment = null
            cursor.element = null
            cursor.tick = undefined
            return
        }
        const step = state.steps[i]
        cursor.segment = step.segment || { id: "seg" + i }
        cursor.element = step.element || null
        cursor.tick = step.tick
    }

    const cursor = {
        segment: null,
        element: null,
        tick: undefined,
        rewind: function (mode) {
            state.rewindMode = mode
            if (mode === 1 && state.selectionStart === undefined) {
                applyIndex(-1)
                return
            }
            if (mode === 1)
                applyIndex(state.selectionStart)
            else if (mode === 2)
                applyIndex(state.selectionEnd)
            else
                applyIndex(0)
        },
        next: function () {
            applyIndex(state.index + 1)
        },
        _state: state
    }
    return cursor
}

function makeScore(cursors) {
    let i = 0
    return {
        newCursor: function () {
            const c = cursors[i] || makeCursor([])
            i++
            return c
        }
    }
}

describe("cursor.js", () => {
    describe("create", () => {
        it("returns null without score", () => {
            assert.equal(CursorUtil.create(null), null)
        })

        it("rewinds to 0 by default", () => {
            const cursor = makeCursor([{ tick: 0, element: { type: Element.CHORD } }])
            const score = makeScore([cursor])
            const created = CursorUtil.create(score)
            assert.equal(created, cursor)
            assert.equal(cursor._state.rewindMode, 0)
            assert.equal(cursor.tick, 0)
        })

        it("honors rewindMode", () => {
            const cursor = makeCursor([
                { tick: 0 },
                { tick: 480 }
            ])
            cursor._state.selectionStart = 1
            const score = makeScore([cursor])
            CursorUtil.create(score, 1)
            assert.equal(cursor._state.rewindMode, 1)
            assert.equal(cursor.tick, 480)
        })
    })

    describe("forEach", () => {
        it("walks until exhausted and can stop early", () => {
            const cursor = makeCursor([
                { tick: 0 },
                { tick: 100 },
                { tick: 200 }
            ])
            cursor.rewind(0)
            const seen = []
            CursorUtil.forEach(cursor, function (c) {
                seen.push(c.tick)
                if (c.tick === 100)
                    return false
            })
            assertSame(seen, [0, 100])
        })
    })

    describe("forEachInSelection", () => {
        it("falls back to whole score when selection start is empty", () => {
            const primary = makeCursor([
                { tick: 0 },
                { tick: 100 }
            ])
            // rewind(1) finds nothing
            primary._state.selectionStart = undefined
            const score = {
                newCursor: function () {
                    // always return same cursor mock that supports rewind 0/1
                    return primary
                }
            }
            const seen = []
            CursorUtil.forEachInSelection(score, function (c) {
                seen.push(c.tick)
            })
            assertSame(seen, [0, 100])
        })

        it("stops at selection end tick", () => {
            const startCursor = makeCursor([
                { tick: 0 },
                { tick: 100 },
                { tick: 200 },
                { tick: 300 }
            ])
            startCursor._state.selectionStart = 1
            startCursor._state.selectionEnd = 3

            const endCursor = makeCursor([
                { tick: 0 },
                { tick: 100 },
                { tick: 200 },
                { tick: 300 }
            ])
            endCursor._state.selectionStart = 1
            endCursor._state.selectionEnd = 3

            let call = 0
            const score = {
                newCursor: function () {
                    call++
                    return call === 1 ? startCursor : endCursor
                }
            }

            const seen = []
            CursorUtil.forEachInSelection(score, function (c) {
                seen.push(c.tick)
            })
            // start at tick 100, end when tick >= 300
            assertSame(seen, [100, 200])
        })
    })

    describe("nextChordRest", () => {
        it("advances to next chord or rest", () => {
            const cursor = makeCursor([
                { tick: 0, element: { type: Element.NOTE } },
                { tick: 100, element: null },
                { tick: 200, element: { type: Element.CHORD } }
            ])
            cursor.rewind(0)
            assert.equal(CursorUtil.nextChordRest(cursor), true)
            assert.equal(cursor.tick, 200)
            assert.equal(cursor.element.type, Element.CHORD)
        })

        it("returns false when none remain", () => {
            const cursor = makeCursor([
                { tick: 0, element: { type: Element.NOTE } }
            ])
            cursor.rewind(0)
            assert.equal(CursorUtil.nextChordRest(cursor), false)
        })

        it("returns false for null cursor", () => {
            assert.equal(CursorUtil.nextChordRest(null), false)
        })
    })
})
