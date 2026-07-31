/**
 * Copyright (c) 2026 yu1row
 * SPDX-License-Identifier: MIT
 *
 * MuseScore version gating for plugins.
 * Import from QML: import "../lib/version.js" as Version
 *
 * Typical use in onRun:
 *   var gate = Version.requireAtLeast(...)
 *   if (!gate.ok) { show gate.message in a Label via Log.dump; then quit(); return }
 *
 * Or with a root id:
 *   var gate = Version.requirePluginAtLeast(plugin, "4.4.0")
 *   if (!gate.ok) { show gate.message in UI; then quit(); return }
 *
 * Use quit() to end the plugin. Do not call Qt.quit() — it closes MuseScore.
 * MuseScore 4 has no plugin console; prefer dialog / Log helpers over console.log.
 */

/**
 * Parse "4.4.0", "v4.4", or { major, minor, update }.
 * Missing minor/update become 0.
 * @returns {{ major: number, minor: number, update: number }|null}
 */
function parse(version) {
    if (version === undefined || version === null)
        return null

    if (typeof version === "object") {
        return {
            major: _toInt(version.major),
            minor: _toInt(version.minor),
            update: _toInt(version.update)
        }
    }

    if (typeof version !== "string")
        return null

    var text = version.replace(/^\s*v/i, "").replace(/\s+/g, "")
    if (!text)
        return null

    var parts = text.split(".")
    var major = _parsePart(parts[0], true)
    if (isNaN(major))
        return null
    var minor = _parsePart(parts[1], false)
    var update = _parsePart(parts[2], false)
    if (isNaN(minor) || isNaN(update))
        return null
    return {
        major: major,
        minor: minor,
        update: update
    }
}

/**
 * @returns {string} e.g. "4.4.0"
 */
function format(major, minor, update) {
    return _toInt(major) + "." + _toInt(minor) + "." + _toInt(update)
}

/**
 * Compare two versions.
 * @param {string|object} a
 * @param {string|object} b
 * @returns {number} -1 if a < b, 0 if equal, 1 if a > b; NaN if either is invalid
 */
function compare(a, b) {
    var left = parse(a)
    var right = parse(b)
    if (!left || !right)
        return NaN
    if (left.major !== right.major)
        return left.major < right.major ? -1 : 1
    if (left.minor !== right.minor)
        return left.minor < right.minor ? -1 : 1
    if (left.update !== right.update)
        return left.update < right.update ? -1 : 1
    return 0
}

/**
 * True when running MuseScore version >= minimum.
 * @param {number} major  mscoreMajorVersion
 * @param {number} minor  mscoreMinorVersion
 * @param {number} update mscoreUpdateVersion
 * @param {string|object} minimum  e.g. "4.4.0"
 */
function isAtLeast(major, minor, update, minimum) {
    var current = { major: major, minor: minor, update: update }
    var cmp = compare(current, minimum)
    return !isNaN(cmp) && cmp >= 0
}

/**
 * Gate helper: allow run only when version >= minimum.
 * @returns {{ ok: boolean, current: string, required: string, message: string }}
 */
function requireAtLeast(major, minor, update, minimum) {
    var min = parse(minimum)
    var currentText = format(major, minor, update)
    var requiredText = min ? format(min.major, min.minor, min.update) : String(minimum)
    var ok = !!min && isAtLeast(major, minor, update, min)

    return {
        ok: ok,
        current: currentText,
        required: requiredText,
        message: ok
            ? ("MuseScore " + currentText + " meets required " + requiredText + "+")
            : ("This plugin requires MuseScore " + requiredText
               + " or later (current: " + currentText + ")")
    }
}

/**
 * Same as requireAtLeast, reading version fields from a MuseScore root object.
 * @param {object} plugin  MuseScore { id: plugin ... }
 * @param {string|object} minimum
 */
function requirePluginAtLeast(plugin, minimum) {
    if (!plugin) {
        return {
            ok: false,
            current: "unknown",
            required: String(minimum),
            message: "MuseScore plugin context is missing; cannot verify version"
        }
    }
    return requireAtLeast(
        plugin.mscoreMajorVersion,
        plugin.mscoreMinorVersion,
        plugin.mscoreUpdateVersion,
        minimum
    )
}

/**
 * Current version string from a MuseScore root object.
 */
function pluginVersionString(plugin) {
    if (!plugin)
        return "unknown"
    return format(
        plugin.mscoreMajorVersion,
        plugin.mscoreMinorVersion,
        plugin.mscoreUpdateVersion
    )
}

function _toInt(value) {
    var n = parseInt(value, 10)
    return isNaN(n) ? 0 : n
}

function _parsePart(value, required) {
    if (value === undefined || value === null || value === "")
        return required ? NaN : 0
    if (!/^\d+$/.test(String(value)))
        return NaN
    return parseInt(value, 10)
}
