/*
 * Copyright (c) 2026 yu1row
 * SPDX-License-Identifier: MIT
 *
 * Example plugin: count selected notes and show the result in a dialog.
 * MuseScore 4 has no plugin console — do not rely on console.log for UI feedback.
 */
import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import MuseScore

import "../../lib/score.js" as Score
import "../../lib/selection.js" as Selection
import "../../lib/notes.js" as Notes
import "../../lib/version.js" as Version
import "../../lib/log.js" as Log

MuseScore {
    id: plugin
    version: "0.1.0"
    description: "Example: count selected notes using musescore-plugin-lib"
    title: "Count Selection (MsLib example)"
    categoryCode: "devtools"
    pluginType: "dialog"
    requiresScore: true
    width: 420
    height: 200

    readonly property string minMuseScoreVersion: "4.4.0"

    property var logger: Log.create({ prefix: "MsLib example: " })
    property string feedback: ""

    function showFeedback(message) {
        Log.clear(logger)
        Log.info(logger, message)
        feedback = Log.dump(logger)
    }

    onRun: {
        var gate = Version.requirePluginAtLeast(plugin, minMuseScoreVersion)
        if (!gate.ok) {
            showFeedback(gate.message)
            return
        }

        if (!Score.isValid(curScore)) {
            showFeedback("スコアが開かれていません")
            return
        }

        var notes = Selection.ofType(curScore, Element.NOTE)
        if (notes.length === 0) {
            showFeedback("音符を1つ以上選択してください")
            return
        }

        var pitches = Notes.uniquePitches(notes)
        var labels = []
        for (var i = 0; i < pitches.length; i++)
            labels.push(Notes.pitchName(pitches[i]))

        showFeedback(notes.length + " note(s), pitches: " + labels.join(", "))
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 12
        spacing: 12

        Label {
            text: qsTr("Count Selection")
            font.bold: true
            Layout.fillWidth: true
        }

        ScrollView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            clip: true

            Label {
                text: feedback
                wrapMode: Text.Wrap
                width: plugin.width - 48
            }
        }

        Button {
            text: qsTr("OK")
            Layout.alignment: Qt.AlignRight
            onClicked: quit()
        }
    }
}
