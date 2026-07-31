/**
 * Copyright (c) 2026 yu1row
 * SPDX-License-Identifier: MIT
 *
 * Helpers for plugin-owned score annotations (typically STAFF_TEXT).
 * Import from QML: import "../lib/annotations.js" as Ann
 *
 * When a plugin adds text and later needs to remove only its own items,
 * tag the text (ZWSP prefix) and/or match by fontFace, then removeElement().
 *
 *   text.text = Ann.tag("C")
 *   if (Ann.isOwned(el, { fontFaces: ["MyFont"] }))
 *       removeElement(el)
 */

/** Default invisible ownership prefix (zero-width space). */
var TAG_PREFIX = "\u200B"

/**
 * Prefix visible text with an ownership tag.
 * @param {string} visibleText
 * @param {string} [prefix=TAG_PREFIX]
 * @returns {string}
 */
function tag(visibleText, prefix) {
    var p = prefix === undefined || prefix === null ? TAG_PREFIX : prefix
    return p + (visibleText === undefined || visibleText === null ? "" : visibleText)
}

/**
 * @param {string} text
 * @param {string} [prefix=TAG_PREFIX]
 * @returns {boolean}
 */
function hasTag(text, prefix) {
    if (text === undefined || text === null || text === "")
        return false
    var p = prefix === undefined || prefix === null ? TAG_PREFIX : prefix
    if (!p)
        return false
    return ("" + text).indexOf(p) === 0
}

/**
 * Remove the ownership prefix if present.
 * @param {string} text
 * @param {string} [prefix=TAG_PREFIX]
 * @returns {string}
 */
function stripTag(text, prefix) {
    if (text === undefined || text === null)
        return ""
    var p = prefix === undefined || prefix === null ? TAG_PREFIX : prefix
    var s = "" + text
    if (p && s.indexOf(p) === 0)
        return s.substring(p.length)
    return s
}

/**
 * Whether an element looks like one this plugin owns.
 *
 * options:
 *   - fontFaces: string[]   match el.fontFace (any)
 *   - tagPrefix: string     match text prefix (default ZWSP)
 *   - elementType: number   require el.type === elementType (e.g. Element.STAFF_TEXT)
 *   - requireTag: boolean   if true, fontFace alone is not enough
 *
 * @param {object} element
 * @param {object} [options]
 * @returns {boolean}
 */
function isOwned(element, options) {
    if (!element)
        return false

    var opts = options || {}
    if (opts.elementType !== undefined && opts.elementType !== null) {
        try {
            if (element.type !== opts.elementType)
                return false
        } catch (e0) {
            return false
        }
    }

    var face = ""
    try {
        face = element.fontFace
    } catch (e1) {}

    var faces = opts.fontFaces
    if (faces && faces.length) {
        for (var i = 0; i < faces.length; i++) {
            if (face === faces[i]) {
                if (!opts.requireTag)
                    return true
                break
            }
        }
    }

    var text = ""
    try {
        text = element.text
    } catch (e2) {}

    return hasTag(text, opts.tagPrefix)
}

/**
 * Collect owned annotations from segment.annotations.
 * @param {object} segment
 * @param {object} [options]  same as isOwned, plus staffIdx (>=0 filters by track/4)
 * @returns {Array}
 */
function collectFromSegment(segment, options) {
    var found = []
    if (!segment)
        return found

    var annotations = null
    try {
        annotations = segment.annotations
    } catch (e) {
        return found
    }
    if (!annotations)
        return found

    var opts = options || {}
    var staffIdx = opts.staffIdx
    for (var i = 0; i < annotations.length; i++) {
        var el = annotations[i]
        if (!isOwned(el, opts))
            continue
        if (typeof staffIdx === "number" && staffIdx >= 0) {
            try {
                var track = el.track
                if (typeof track === "number" && Math.floor(track / 4) !== staffIdx)
                    continue
            } catch (e2) {}
        }
        found.push(el)
    }
    return found
}

/**
 * Deduplicate element list using el.is() when available.
 * @param {Array} elements
 * @returns {Array}
 */
function unique(elements) {
    var out = []
    if (!elements)
        return out
    for (var a = 0; a < elements.length; a++) {
        var el = elements[a]
        var exists = false
        for (var b = 0; b < out.length; b++) {
            try {
                if (out[b].is(el)) {
                    exists = true
                    break
                }
            } catch (e) {
                if (out[b] === el) {
                    exists = true
                    break
                }
            }
        }
        if (!exists)
            out.push(el)
    }
    return out
}
