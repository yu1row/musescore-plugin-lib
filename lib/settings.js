/**
 * Copyright (c) 2026 yu1row
 * SPDX-License-Identifier: MIT
 *
 * Schema-driven settings helpers for MuseScore Studio plugins (4.4+).
 * Import from QML: import "../lib/settings.js" as SettingsUtil
 *
 * defaults is the single source of truth for keys and initial values.
 * Persist via MuseScore Settings (import MuseScore only — no Qt.labs.settings):
 *
 *   Settings {
 *       id: backend
 *       category: "MyPlugin"
 *       property string payload: "{}"
 *   }
 *   property var store: SettingsUtil.create({ modeIndex: 0, verbose: true })
 *
 *   store = SettingsUtil.loadTo(backend, store, binders)
 *   store = SettingsUtil.saveFrom(backend, store, collectors)
 */

/**
 * Create an in-memory store from a defaults schema.
 * @param {object} defaults  { key: defaultValue, ... }
 * @returns {{ defaults: object, values: object }}
 */
function create(defaults) {
    var schema = clone(defaults)
    return {
        defaults: schema,
        values: clone(schema)
    }
}

/**
 * @param {object} store
 * @returns {Array<string>}
 */
function keys(store) {
    return _keys(store ? store.defaults : null)
}

/**
 * Replace values from a JSON payload (Settings.payload).
 * @returns {object} new store
 */
function load(store, payload) {
    return _withValues(store, merge(parsePayload(payload), store.defaults))
}

/**
 * Serialize store.values for Settings.payload.
 * @returns {string}
 */
function savePayload(store) {
    return stringify(store.values, store.defaults)
}

/**
 * Read payload from a Settings object into a new store.
 * @param {object} settings  Settings { property string payload }
 * @param {object} store
 * @param {string} [propertyName="payload"]
 * @returns {object} new store
 */
function loadFrom(settings, store, propertyName) {
    var prop = propertyName || "payload"
    var payload = settings ? settings[prop] : "{}"
    return load(store, payload)
}

/**
 * Write store.values into a Settings object payload property.
 * @returns {object} same store (unchanged)
 */
function saveTo(settings, store, propertyName) {
    var prop = propertyName || "payload"
    if (settings)
        settings[prop] = savePayload(store)
    return store
}

/**
 * Reset values to defaults (memory only).
 * @returns {object} new store
 */
function reset(store) {
    return _withValues(store, clone(store.defaults))
}

/**
 * reset() then saveTo().
 * @returns {object} new store
 */
function resetAndSave(settings, store, propertyName) {
    var next = reset(store)
    saveTo(settings, next, propertyName)
    return next
}

function get(store, key) {
    return _get(store.values, store.defaults, key)
}

/**
 * @returns {object} new store
 */
function set(store, key, value) {
    return _withValues(store, _set(store.values, key, value))
}

/**
 * Push values to UI. binders: { key: function (value) { ... } }
 */
function applyTo(store, binders) {
    _apply(store.values, binders)
    return store
}

/**
 * Pull values from UI. binders: { key: function () { return ... } }
 * @returns {object} new store
 */
function collectFrom(store, binders) {
    return _withValues(store, _collect(binders, store.defaults))
}

/**
 * loadFrom(settings) then applyTo(binders).
 * @returns {object} new store
 */
function loadTo(settings, store, binders, propertyName) {
    var next = loadFrom(settings, store, propertyName)
    applyTo(next, binders)
    return next
}

/**
 * collectFrom(binders) then saveTo(settings).
 * @returns {object} new store
 */
function saveFrom(settings, store, binders, propertyName) {
    var next = collectFrom(store, binders)
    saveTo(settings, next, propertyName)
    return next
}

// --- low-level helpers (also usable directly) ---

function clone(obj) {
    var out = {}
    if (!obj)
        return out
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key))
            out[key] = obj[key]
    }
    return out
}

function merge(stored, defaults) {
    var out = clone(defaults)
    if (!stored)
        return out
    for (var key in defaults) {
        if (!Object.prototype.hasOwnProperty.call(defaults, key))
            continue
        if (stored[key] !== undefined)
            out[key] = stored[key]
    }
    return out
}

function parsePayload(payload) {
    if (payload === undefined || payload === null || payload === "")
        return {}
    try {
        var data = JSON.parse(payload)
        if (!data || typeof data !== "object" || data instanceof Array)
            return {}
        return data
    } catch (e) {
        return {}
    }
}

function stringify(values, defaults) {
    return JSON.stringify(merge(values, defaults))
}

function _withValues(store, values) {
    return {
        defaults: store.defaults,
        values: merge(values, store.defaults)
    }
}

function _keys(defaults) {
    var out = []
    if (!defaults)
        return out
    for (var key in defaults) {
        if (Object.prototype.hasOwnProperty.call(defaults, key))
            out.push(key)
    }
    return out
}

function _get(values, defaults, key) {
    if (values && values[key] !== undefined)
        return values[key]
    if (defaults && defaults[key] !== undefined)
        return defaults[key]
    return undefined
}

function _set(values, key, value) {
    var out = clone(values)
    out[key] = value
    return out
}

function _apply(values, binders) {
    if (!binders)
        return
    for (var key in binders) {
        if (!Object.prototype.hasOwnProperty.call(binders, key))
            continue
        var fn = binders[key]
        if (typeof fn === "function")
            fn(values ? values[key] : undefined)
    }
}

function _collect(binders, defaults) {
    var collected = {}
    if (binders) {
        for (var key in binders) {
            if (!Object.prototype.hasOwnProperty.call(binders, key))
                continue
            var fn = binders[key]
            if (typeof fn === "function")
                collected[key] = fn()
        }
    }
    return merge(collected, defaults)
}
