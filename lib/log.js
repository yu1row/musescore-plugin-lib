/**
 * Copyright (c) 2026 yu1row
 * SPDX-License-Identifier: MIT
 *
 * User-visible / file-backed logging helpers for MuseScore Studio 4.4+.
 * Import from QML: import "../lib/log.js" as Log
 *
 * MuseScore 4 has no Plugin Creator console. console.log is usually invisible
 * in the GUI (may appear only when MuseScore is started from a terminal with -d).
 * Prefer:
 *   - Log.dump(logger) shown in a dialog Label
 *   - Log.writeFile(logger, fileIO) via MuseScore FileIO
 */

/**
 * @param {object} [options]
 * @param {string} [options.prefix]
 * @param {boolean} [options.mirrorConsole]  also call console.log (for -d terminals)
 * @returns {{ lines: Array<string>, prefix: string, mirrorConsole: boolean }}
 */
function create(options) {
    var opts = options || {}
    return {
        lines: [],
        prefix: opts.prefix ? String(opts.prefix) : "",
        mirrorConsole: !!opts.mirrorConsole
    }
}

/**
 * Append a line. Returns the formatted line.
 * @param {object} logger
 * @param {string} level  e.g. "INFO", "WARN", "ERROR"
 * @param {string} message
 * @returns {string}
 */
function write(logger, level, message) {
    var text = _format(logger, level, message)
    if (!logger.lines)
        logger.lines = []
    logger.lines.push(text)
    if (logger.mirrorConsole)
        console.log(text)
    return text
}

function info(logger, message) {
    return write(logger, "INFO", message)
}

function warn(logger, message) {
    return write(logger, "WARN", message)
}

function error(logger, message) {
    return write(logger, "ERROR", message)
}

/**
 * All lines joined by newlines (for dialog Label / TextArea).
 * @param {object} logger
 * @returns {string}
 */
function dump(logger) {
    if (!logger || !logger.lines || logger.lines.length === 0)
        return ""
    return logger.lines.join("\n")
}

/**
 * Clear buffered lines. Returns logger.
 */
function clear(logger) {
    if (logger)
        logger.lines = []
    return logger
}

/**
 * Write buffer to a MuseScore FileIO object (overwrites source).
 * FileIO must already have `source` set.
 * @param {object} logger
 * @param {object} fileIO  FileIO { write(string): bool }
 * @returns {boolean}
 */
function writeFile(logger, fileIO) {
    if (!fileIO || typeof fileIO.write !== "function")
        return false
    return !!fileIO.write(dump(logger) + (logger.lines && logger.lines.length ? "\n" : ""))
}

/**
 * Append buffer to an existing FileIO file (read + write).
 * @param {object} logger
 * @param {object} fileIO  FileIO { read(): string, write(string): bool }
 * @returns {boolean}
 */
function appendFile(logger, fileIO) {
    if (!fileIO || typeof fileIO.write !== "function")
        return false
    var prev = ""
    if (typeof fileIO.read === "function") {
        try {
            prev = fileIO.read() || ""
        } catch (e) {
            prev = ""
        }
    }
    var next = prev
    if (next && next.charAt(next.length - 1) !== "\n")
        next += "\n"
    next += dump(logger)
    if (logger.lines && logger.lines.length)
        next += "\n"
    return !!fileIO.write(next)
}

/**
 * Build a log file path under FileIO.tempPath() (no hardcoded drive letters).
 * @param {object} fileIO  FileIO with tempPath()
 * @param {string} [fileName="musescore-plugin-lib.log"]
 * @returns {string}
 */
function tempLogPath(fileIO, fileName) {
    var name = fileName || "musescore-plugin-lib.log"
    if (!fileIO || typeof fileIO.tempPath !== "function")
        return name
    var dir = fileIO.tempPath()
    if (!dir)
        return name
    var sep = dir.indexOf("\\") >= 0 ? "\\" : "/"
    if (dir.charAt(dir.length - 1) === "/" || dir.charAt(dir.length - 1) === "\\")
        return dir + name
    return dir + sep + name
}

function _format(logger, level, message) {
    var prefix = logger && logger.prefix ? logger.prefix : ""
    var body = message === undefined || message === null ? "" : String(message)
    if (prefix)
        body = prefix + body
    return "[" + String(level || "INFO") + "] " + body
}
