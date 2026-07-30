/**
 * Copyright (c) 2026 yu1row
 * SPDX-License-Identifier: MIT
 *
 * Note / pitch-string helpers for MuseScore Studio plugins.
 * Import from QML: import "../lib/notes.js" as Notes
 */

var NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

/**
 * MIDI pitch → scientific name (e.g. 60 → "C4").
 * @param {number} pitch
 * @returns {string}
 */
function pitchName(pitch) {
    if (pitch === undefined || pitch === null)
        return "?"
    var pc = ((pitch % 12) + 12) % 12
    var octave = Math.floor(pitch / 12) - 1
    return NOTE_NAMES[pc] + octave
}

/**
 * Readable label for a Note element.
 * @param {Note} note
 * @returns {string}
 */
function label(note) {
    if (!note)
        return "?"
    if (note.pitch !== undefined)
        return pitchName(note.pitch)
    return "?"
}

/**
 * Collect unique MIDI pitches from a list of notes.
 * @param {Array} notes
 * @returns {Array<number>} sorted unique pitches
 */
function uniquePitches(notes) {
    var seen = {}
    var out = []
    for (var i = 0; i < notes.length; i++) {
        var n = notes[i]
        if (!n || n.pitch === undefined)
            continue
        if (!seen[n.pitch]) {
            seen[n.pitch] = true
            out.push(n.pitch)
        }
    }
    out.sort(function (a, b) { return a - b })
    return out
}
