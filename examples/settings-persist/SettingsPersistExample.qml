/*
 * Copyright (c) 2026 yu1row
 * SPDX-License-Identifier: MIT
 *
 * Example: persist plugin options with settings.js (MuseScore 4.4+).
 * Feedback uses on-screen labels — MuseScore 4 has no plugin console.
 */
import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import MuseScore

import "../../lib/settings.js" as SettingsUtil
import "../../lib/version.js" as Version
import "../../lib/log.js" as Log

MuseScore {
    id: plugin
    version: "0.1.0"
    description: "Example: schema-driven settings persistence (musescore-plugin-lib)"
    title: "Settings Persist (MsLib example)"
    categoryCode: "devtools"
    pluginType: "dialog"
    requiresScore: false
    width: 360
    height: 260

    readonly property string minMuseScoreVersion: "4.4.0"

    property var logger: Log.create({ prefix: "MsLib settings: " })
    property string statusText: ""
    property bool blocked: false

    Settings {
        id: backend
        category: "MsLibSettingsExample"
        property string payload: "{}"
    }

    property var store: SettingsUtil.create({
        modeIndex: 0,
        verbose: true
    })

    function setStatus(message) {
        Log.clear(logger)
        Log.info(logger, message)
        statusText = Log.dump(logger)
    }

    function uiBinders() {
        return {
            modeIndex: function (v) { modeBox.currentIndex = v },
            verbose: function (v) { verboseBox.checked = v }
        }
    }

    function uiCollectors() {
        return {
            modeIndex: function () { return modeBox.currentIndex },
            verbose: function () { return verboseBox.checked }
        }
    }

    onRun: {
        var gate = Version.requirePluginAtLeast(plugin, minMuseScoreVersion)
        if (!gate.ok) {
            blocked = true
            setStatus(gate.message)
            return
        }
        blocked = false
        store = SettingsUtil.loadTo(backend, store, uiBinders())
        setStatus("設定を読み込みました")
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 12
        spacing: 10

        Label {
            text: qsTr("Schema-driven settings (settings.js)")
            font.bold: true
            Layout.fillWidth: true
        }

        Label {
            text: qsTr("Mode")
            Layout.fillWidth: true
            enabled: !blocked
        }

        ComboBox {
            id: modeBox
            Layout.fillWidth: true
            enabled: !blocked
            model: [qsTr("Simple"), qsTr("Advanced"), qsTr("Debug")]
        }

        CheckBox {
            id: verboseBox
            text: qsTr("Verbose logging")
            Layout.fillWidth: true
            enabled: !blocked
        }

        Label {
            text: statusText
            wrapMode: Text.Wrap
            Layout.fillWidth: true
        }

        Item { Layout.fillHeight: true }

        RowLayout {
            Layout.fillWidth: true
            spacing: 8

            Button {
                text: qsTr("Default")
                enabled: !blocked
                onClicked: {
                    store = SettingsUtil.reset(store)
                    SettingsUtil.applyTo(store, uiBinders())
                    setStatus("初期値に戻しました（未保存）")
                }
            }

            Item { Layout.fillWidth: true }

            Button {
                text: qsTr("Cancel")
                onClicked: quit()
            }

            Button {
                text: qsTr("OK")
                enabled: !blocked
                onClicked: {
                    store = SettingsUtil.saveFrom(backend, store, uiCollectors())
                    setStatus("保存しました: " + JSON.stringify(store.values))
                    quit()
                }
            }
        }
    }
}
