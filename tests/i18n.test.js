const { describe, it } = require("node:test")
const assert = require("node:assert/strict")
const { loadQmlJs } = require("./helpers/loadQmlJs")

const I18n = loadQmlJs("lib/i18n.js")

describe("i18n.js", () => {
    const ja = {
        "Cancel": "キャンセル",
        "OK\x1ebutton": "了解"
    }

    it("isLanguage matches locale prefixes", () => {
        assert.equal(I18n.isLanguage("ja_JP", "ja"), true)
        assert.equal(I18n.isLanguage("ja", "ja"), true)
        assert.equal(I18n.isLanguage("en_US", "ja"), false)
        assert.equal(I18n.isLanguage(null, "ja"), false)
    })

    it("fallback uses dictionary only when untranslated and enabled", () => {
        assert.equal(I18n.fallback("Cancel", "Cancel", ja, true), "キャンセル")
        assert.equal(I18n.fallback("Abbrechen", "Cancel", ja, true), "Abbrechen")
        assert.equal(I18n.fallback("Cancel", "Cancel", ja, false), "Cancel")
        assert.equal(I18n.fallback("Cancel", "Cancel", {}, true), "Cancel")
    })

    it("tr wraps qsTrFn and supports disambiguation keys", () => {
        function qsTr(source, disambiguation) {
            if (disambiguation)
                return source
            return source
        }

        assert.equal(I18n.tr(qsTr, "Cancel", ja, true), "キャンセル")
        assert.equal(I18n.tr(qsTr, "OK", ja, true, "button"), "了解")
        assert.equal(I18n.tr(qsTr, "Hello", ja, true), "Hello")
    })
})
