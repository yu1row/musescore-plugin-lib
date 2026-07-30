/**
 * Copyright (c) 2026 yu1row
 * SPDX-License-Identifier: MIT
 *
 * Element type / tree helpers for MuseScore Studio plugins.
 * Import from QML: import "../lib/elements.js" as Elements
 */

function isType(element, elementType) {
    return !!(element && element.type === elementType)
}

function isNote(element) {
    return isType(element, Element.NOTE)
}

function isChord(element) {
    return isType(element, Element.CHORD)
}

function isRest(element) {
    return isType(element, Element.REST)
}

function isChordRest(element) {
    return isChord(element) || isRest(element)
}

/**
 * Notes belonging to a chord (empty if not a chord).
 * @param {Element} element
 * @returns {Array}
 */
function chordNotes(element) {
    if (!isChord(element) || !element.notes)
        return []
    var notes = element.notes
    var out = []
    for (var i = 0; i < notes.length; i++)
        out.push(notes[i])
    return out
}

/**
 * If element is a Note, return it; if Chord, return its notes; else [].
 * @param {Element} element
 * @returns {Array}
 */
function asNotes(element) {
    if (isNote(element))
        return [element]
    return chordNotes(element)
}
