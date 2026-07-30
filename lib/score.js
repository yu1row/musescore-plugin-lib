/**
 * Score-level helpers for MuseScore Studio plugins.
 * Import from QML: import "../lib/score.js" as Score
 */

/**
 * Run work inside a single undoable command.
 * @param {Score} score
 * @param {string} name  Undo command name shown in MuseScore
 * @param {Function} fn
 * @returns {*} return value of fn
 */
function withCmd(score, name, fn) {
    if (!score)
        return undefined
    score.startCmd()
    try {
        return fn()
    } finally {
        score.endCmd()
    }
}

/**
 * True when a score is open and usable.
 * @param {Score} score
 */
function isValid(score) {
    return !!(score && score.nstaves > 0)
}

/**
 * Iterate every Measure in the score (main score timeline).
 * @param {Score} score
 * @param {Function} callback  function(measure, index)
 */
function forEachMeasure(score, callback) {
    if (!isValid(score))
        return
    var m = score.firstMeasure
    var i = 0
    while (m) {
        callback(m, i)
        m = m.nextMeasure
        i++
    }
}

/**
 * Iterate segments of a measure.
 * @param {Measure} measure
 * @param {Function} callback  function(segment, index)
 */
function forEachSegment(measure, callback) {
    if (!measure)
        return
    var seg = measure.firstSegment
    var i = 0
    while (seg) {
        callback(seg, i)
        seg = seg.nextInMeasure
        i++
    }
}
