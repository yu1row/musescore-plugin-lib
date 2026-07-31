const { describe, it } = require("node:test")
const assert = require("node:assert/strict")
const { loadQmlJs, assertSame } = require("./helpers/loadQmlJs")

const SettingsUtil = loadQmlJs("lib/settings.js")

describe("settings.js", () => {
    const defaults = { modeIndex: 0, verbose: true }

    it("create initializes values from defaults", () => {
        const store = SettingsUtil.create(defaults)
        assertSame(store.defaults, defaults)
        assertSame(store.values, defaults)
        assert.notStrictEqual(store.values, store.defaults)
    })

    it("load merges payload onto defaults and drops unknown keys", () => {
        let store = SettingsUtil.create(defaults)
        store = SettingsUtil.load(store, JSON.stringify({
            modeIndex: 2,
            orphan: true
        }))
        assertSame(store.values, { modeIndex: 2, verbose: true })
        assert.equal(store.values.orphan, undefined)
    })

    it("loadFrom / saveTo round-trip through Settings-like object", () => {
        const backend = { payload: "{}" }
        let store = SettingsUtil.create(defaults)
        store = SettingsUtil.set(store, "modeIndex", 1)
        store = SettingsUtil.set(store, "verbose", false)
        SettingsUtil.saveTo(backend, store)

        let loaded = SettingsUtil.create(defaults)
        loaded = SettingsUtil.loadFrom(backend, loaded)
        assertSame(loaded.values, { modeIndex: 1, verbose: false })
    })

    it("reset restores defaults without touching backend until save", () => {
        const backend = { payload: "{\"modeIndex\":2,\"verbose\":false}" }
        let store = SettingsUtil.loadFrom(backend, SettingsUtil.create(defaults))
        store = SettingsUtil.reset(store)
        assertSame(store.values, defaults)
        assert.equal(backend.payload, "{\"modeIndex\":2,\"verbose\":false}")

        store = SettingsUtil.resetAndSave(backend, store)
        assertSame(JSON.parse(backend.payload), defaults)
    })

    it("applyTo and collectFrom sync UI binders", () => {
        const ui = { modeIndex: -1, verbose: false }
        let store = SettingsUtil.create(defaults)
        store = SettingsUtil.set(store, "modeIndex", 2)

        SettingsUtil.applyTo(store, {
            modeIndex: function (v) { ui.modeIndex = v },
            verbose: function (v) { ui.verbose = v }
        })
        assertSame(ui, { modeIndex: 2, verbose: true })

        ui.modeIndex = 1
        ui.verbose = false
        store = SettingsUtil.collectFrom(store, {
            modeIndex: function () { return ui.modeIndex },
            verbose: function () { return ui.verbose }
        })
        assertSame(store.values, { modeIndex: 1, verbose: false })
    })

    it("loadTo / saveFrom compose load+apply and collect+save", () => {
        const backend = { payload: JSON.stringify({ modeIndex: 2 }) }
        const ui = { modeIndex: 0, verbose: false }
        let store = SettingsUtil.create(defaults)

        store = SettingsUtil.loadTo(backend, store, {
            modeIndex: function (v) { ui.modeIndex = v },
            verbose: function (v) { ui.verbose = v }
        })
        assert.equal(ui.modeIndex, 2)
        assert.equal(ui.verbose, true)

        ui.modeIndex = 0
        ui.verbose = false
        store = SettingsUtil.saveFrom(backend, store, {
            modeIndex: function () { return ui.modeIndex },
            verbose: function () { return ui.verbose }
        })
        assertSame(JSON.parse(backend.payload), {
            modeIndex: 0,
            verbose: false
        })
    })

    it("parsePayload tolerates invalid JSON", () => {
        assertSame(SettingsUtil.parsePayload(""), {})
        assertSame(SettingsUtil.parsePayload("not-json"), {})
        assertSame(SettingsUtil.parsePayload("[]"), {})
    })
})
