/**
 * Copyright (c) 2026 yu1row
 * SPDX-License-Identifier: MIT
 *
 * Font-family helpers for MuseScore Studio plugins (4.4+).
 * Import from QML: import "../lib/fonts.js" as Fonts
 *
 * Custom fonts used on the score must be installed in the OS.
 * Check before writing STAFF_TEXT / similar, and ask the user to
 * restart MuseScore after installing fonts.
 *
 *   var missing = Fonts.missing(["MyPluginFont"])
 *   if (missing.length)
 *       showWarning(Fonts.missingMessage(missing))
 */

/**
 * Case-insensitive match of a family against an installed list.
 * @param {string} family
 * @param {Array<string>} [families]  defaults to Qt.fontFamilies()
 * @returns {boolean}
 */
function isInstalled(family, families) {
    var list = families
    if (!list) {
        try {
            list = Qt.fontFamilies()
        } catch (e) {
            return false
        }
    }
    if (!list || family === undefined || family === null || family === "")
        return false

    var target = _norm(family)
    for (var i = 0; i < list.length; i++) {
        if (_norm(list[i]) === target)
            return true
    }
    return false
}

/**
 * Required families that are not installed.
 * @param {Array<string>} required
 * @param {Array<string>} [families]
 * @returns {Array<string>}
 */
function missing(required, families) {
    var out = []
    if (!required)
        return out
    for (var i = 0; i < required.length; i++) {
        if (!isInstalled(required[i], families))
            out.push(required[i])
    }
    return out
}

/**
 * Build a simple missing-font message (English template).
 * Pass a custom template with %1 for the bullet list if needed.
 * @param {Array<string>} missingFamilies
 * @param {string} [template]
 * @returns {string} empty string when nothing is missing
 */
function missingMessage(missingFamilies, template) {
    if (!missingFamilies || missingFamilies.length === 0)
        return ""

    var list = ""
    for (var i = 0; i < missingFamilies.length; i++)
        list += "• " + missingFamilies[i] + "\n"

    var tpl = template || (
        "The following fonts are not installed:\n\n%1\n" +
        "Install them from the plugin package, then restart the host application."
    )
    return tpl.replace("%1", list)
}

function _norm(value) {
    return ("" + value).toLowerCase()
}
