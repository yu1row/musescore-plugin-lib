/**
 * Copyright (c) 2026 yu1row
 * SPDX-License-Identifier: MIT
 *
 * Selection helpers for MuseScore Studio plugins.
 * Import from QML: import "../lib/selection.js" as Selection
 */

/**
 * @param {Score} score
 * @returns {boolean}
 */
function hasSelection(score) {
    return !!(score && score.selection && score.selection.elements
              && score.selection.elements.length > 0)
}

/**
 * Selected elements as a plain array.
 * @param {Score} score
 * @returns {Array}
 */
function elements(score) {
    if (!hasSelection(score))
        return []
    var src = score.selection.elements
    var out = []
    for (var i = 0; i < src.length; i++)
        out.push(src[i])
    return out
}

/**
 * Filter selected elements by Element type (e.g. Element.NOTE).
 * @param {Score} score
 * @param {number} elementType
 * @returns {Array}
 */
function ofType(score, elementType) {
    var all = elements(score)
    var out = []
    for (var i = 0; i < all.length; i++) {
        if (all[i] && all[i].type === elementType)
            out.push(all[i])
    }
    return out
}

/**
 * Call callback for each selected element.
 * @param {Score} score
 * @param {Function} callback  function(element, index)
 */
function forEach(score, callback) {
    var all = elements(score)
    for (var i = 0; i < all.length; i++)
        callback(all[i], i)
}
