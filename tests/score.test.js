const { describe, it } = require("node:test")
const assert = require("node:assert/strict")
const { loadQmlJs, assertSame } = require("./helpers/loadQmlJs")

const Score = loadQmlJs("lib/score.js")

function makeScore(options) {
    const opts = options || {}
    const log = []
    return {
        nstaves: opts.nstaves === undefined ? 1 : opts.nstaves,
        firstMeasure: opts.firstMeasure || null,
        startCmd: function () { log.push("start") },
        endCmd: function () { log.push("end") },
        _log: log
    }
}

describe("score.js", () => {
    describe("withCmd", () => {
        it("returns undefined when score is missing", () => {
            assert.equal(Score.withCmd(null, "x", function () { return 1 }), undefined)
        })

        it("runs fn between startCmd and endCmd", () => {
            const score = makeScore()
            const result = Score.withCmd(score, "edit", function () {
                score._log.push("work")
                return 42
            })
            assert.equal(result, 42)
            assertSame(score._log, ["start", "work", "end"])
        })

        it("still calls endCmd when fn throws", () => {
            const score = makeScore()
            assert.throws(function () {
                Score.withCmd(score, "edit", function () {
                    throw new Error("boom")
                })
            }, /boom/)
            assertSame(score._log, ["start", "end"])
        })
    })

    describe("isValid", () => {
        it("requires score with nstaves > 0", () => {
            assert.equal(Score.isValid(null), false)
            assert.equal(Score.isValid(makeScore({ nstaves: 0 })), false)
            assert.equal(Score.isValid(makeScore({ nstaves: 2 })), true)
        })
    })

    describe("forEachMeasure / forEachSegment", () => {
        it("walks measure chain with indexes", () => {
            const m2 = { id: "m2", nextMeasure: null }
            const m1 = { id: "m1", nextMeasure: m2 }
            const score = makeScore({ firstMeasure: m1 })
            const seen = []
            Score.forEachMeasure(score, function (m, i) {
                seen.push(i + ":" + m.id)
            })
            assertSame(seen, ["0:m1", "1:m2"])
        })

        it("skips invalid scores", () => {
            const seen = []
            Score.forEachMeasure(makeScore({ nstaves: 0, firstMeasure: { id: "x" } }),
                function (m) { seen.push(m.id) })
            assertSame(seen, [])
        })

        it("walks segments in a measure", () => {
            const s2 = { id: "s2", nextInMeasure: null }
            const s1 = { id: "s1", nextInMeasure: s2 }
            const measure = { firstSegment: s1 }
            const seen = []
            Score.forEachSegment(measure, function (seg, i) {
                seen.push(i + ":" + seg.id)
            })
            assertSame(seen, ["0:s1", "1:s2"])
        })

        it("no-ops for null measure", () => {
            const seen = []
            Score.forEachSegment(null, function () { seen.push(1) })
            assertSame(seen, [])
        })
    })
})
