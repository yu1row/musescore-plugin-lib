/**
 * Copyright (c) 2026 yu1row
 * SPDX-License-Identifier: MIT
 *
 * Lightweight i18n helpers for MuseScore Studio plugins (4.4+).
 * Import from QML: import "../lib/i18n.js" as I18n
 *
 * MuseScore 4.x does not load plugin translations/locale_XX.qm
 * (upstream issue #30833). Use qsTr() plus an embedded dictionary
 * fallback for languages you care about.
 *
 *   function tr(source) {
 *       return I18n.fallback(
 *           qsTr(source), source, jaDict,
 *           I18n.isLanguage(Qt.locale().name, "ja"))
 *   }
 */

/**
 * True when localeName starts with lang (case-insensitive), e.g. "ja", "ja_JP".
 * @param {string} localeName
 * @param {string} lang
 * @returns {boolean}
 */
function isLanguage(localeName, lang) {
    if (localeName === undefined || localeName === null || !lang)
        return false
    return ("" + localeName).toLowerCase().indexOf(("" + lang).toLowerCase()) === 0
}

/**
 * If qsTr left the string untranslated and the locale matches, use dictionary.
 * @param {string} translated  result of qsTr(source) or qsTr(source, disambiguation)
 * @param {string} source
 * @param {object} dictionary  { source: localized, ... }
 * @param {boolean} useDictionary
 * @returns {string}
 */
function fallback(translated, source, dictionary, useDictionary) {
    if (useDictionary && translated === source && dictionary
            && Object.prototype.hasOwnProperty.call(dictionary, source))
        return dictionary[source]
    return translated
}

/**
 * Convenience: qsTr-style lookup with optional disambiguation key in dictionary.
 * Dictionary keys are either source, or source + "\x1e" + disambiguation.
 * @param {Function} qsTrFn  function(source) or function(source, disambiguation)
 * @param {string} source
 * @param {object} dictionary
 * @param {boolean} useDictionary
 * @param {string} [disambiguation]
 * @returns {string}
 */
function tr(qsTrFn, source, dictionary, useDictionary, disambiguation) {
    var translated
    if (disambiguation !== undefined && disambiguation !== null && disambiguation !== "")
        translated = qsTrFn(source, disambiguation)
    else
        translated = qsTrFn(source)

    if (!useDictionary || !dictionary)
        return translated

    var key = source
    if (disambiguation !== undefined && disambiguation !== null && disambiguation !== "")
        key = source + "\x1e" + disambiguation

    if (translated === source && Object.prototype.hasOwnProperty.call(dictionary, key))
        return dictionary[key]
    if (translated === source && key !== source
            && Object.prototype.hasOwnProperty.call(dictionary, source))
        return dictionary[source]
    return translated
}
