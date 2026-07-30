/**
 * Cursor helpers for MuseScore Studio plugins.
 * Import from QML: import "../lib/cursor.js" as CursorUtil
 */

/**
 * Create a cursor rewinded to the start of the score (or selection).
 * @param {Score} score
 * @param {number} [rewindMode=0]  0=start of score, 1=start of selection, 2=end of selection
 * @returns {Cursor|null}
 */
function create(score, rewindMode) {
    if (!score)
        return null
    var cursor = score.newCursor()
    cursor.rewind(rewindMode === undefined ? 0 : rewindMode)
    return cursor
}

/**
 * Walk the cursor until exhausted.
 * @param {Cursor} cursor
 * @param {Function} callback  function(cursor) — return false to stop
 */
function forEach(cursor, callback) {
    if (!cursor)
        return
    while (cursor.segment) {
        if (callback(cursor) === false)
            break
        cursor.next()
    }
}

/**
 * Walk only within the current selection (rewind mode 1 → until end).
 * Falls back to whole score when nothing is selected.
 * @param {Score} score
 * @param {Function} callback  function(cursor)
 */
function forEachInSelection(score, callback) {
    if (!score)
        return
    var cursor = score.newCursor()
    cursor.rewind(1)
    if (!cursor.segment) {
        cursor.rewind(0)
        forEach(cursor, callback)
        return
    }
    var endTick = null
    var endCursor = score.newCursor()
    endCursor.rewind(2)
    if (endCursor.tick !== undefined)
        endTick = endCursor.tick

    while (cursor.segment) {
        if (endTick !== null && cursor.tick >= endTick)
            break
        if (callback(cursor) === false)
            break
        cursor.next()
    }
}

/**
 * Advance cursor to the next ChordRest in the current track.
 * @param {Cursor} cursor
 * @returns {boolean} true if a ChordRest was found
 */
function nextChordRest(cursor) {
    if (!cursor)
        return false
    while (cursor.segment) {
        var e = cursor.element
        if (e && (e.type === Element.CHORD || e.type === Element.REST))
            return true
        cursor.next()
    }
    return false
}
