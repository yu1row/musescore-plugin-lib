/*
 * Copyright (c) 2026 yu1row
 * SPDX-License-Identifier: MIT
 *
 * Example plugin: count selected notes and print pitch names to the console.
 * Install by placing the whole `musescore-plugin-lib` folder under MuseScore's Plugins directory.
 */
import QtQuick
import MuseScore

import "../../lib/score.js" as Score
import "../../lib/selection.js" as Selection
import "../../lib/elements.js" as Elements
import "../../lib/notes.js" as Notes
import "../../lib/version.js" as Version

MuseScore {
    id: plugin
    version: "0.1.0"
    description: "Example: count selected notes using musescore-plugin-lib"
    title: "Count Selection (MsLib example)"
    categoryCode: "devtools"
    pluginType: "action"
    requiresScore: true

    // Minimum MuseScore Studio version for this example
    readonly property string minMuseScoreVersion: "4.4.0"

    onRun: {
        var gate = Version.requirePluginAtLeast(plugin, minMuseScoreVersion)
        if (!gate.ok) {
            console.log("MsLib example: " + gate.message)
            // Qt.quit() closes MuseScore itself — use quit() to end only this plugin
            quit()
            return
        }

        if (!Score.isValid(curScore)) {
            console.log("MsLib example: no score open")
            return
        }

        var notes = Selection.ofType(curScore, Element.NOTE)
        if (notes.length === 0) {
            console.log("MsLib example: select one or more notes first")
            return
        }

        var pitches = Notes.uniquePitches(notes)
        var labels = []
        for (var i = 0; i < pitches.length; i++)
            labels.push(Notes.pitchName(pitches[i]))

        console.log("MsLib example: " + notes.length + " note(s), pitches: "
                    + labels.join(", "))
    }
}
