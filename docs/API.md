# API 詳細

`musescore-plugin-lib` の公開 API です。いずれも QML から相対パスで import して使います。

```qml
import "../musescore-plugin-lib/lib/score.js" as Score
```

モジュール内で `Element.*` を使うものは、呼び出し側 QML で `import MuseScore` が必要です。

---

## score.js

スコア全体の操作ヘルパー。

**Import:** `import ".../lib/score.js" as Score`

### `withCmd(score, name, fn)`

`startCmd` / `endCmd` で囲んで `fn` を実行します。例外時も `endCmd` を呼びます。

| 引数 | 型 | 説明 |
|---|---|---|
| `score` | Score | 対象スコア（通常は `curScore`） |
| `name` | string | 呼び出し側向けの操作名（現状 API には渡されない） |
| `fn` | Function | 編集処理 |

**戻り値:** `fn` の戻り値。`score` が無い場合は `undefined`。

**使用例:**

```qml
Score.withCmd(curScore, "Color selected notes", function () {
    var notes = curScore.selection.elements
    for (var i = 0; i < notes.length; i++) {
        if (notes[i].type === Element.NOTE)
            notes[i].color = "#ff0000"
    }
})
```

### `isValid(score)`

スコアが開き、少なくとも 1 譜表あるか。

**戻り値:** `boolean`

**使用例:**

```qml
if (!Score.isValid(curScore)) {
    console.log("スコアが開かれていません")
    quit()
    return
}
```

### `forEachMeasure(score, callback)`

主タイムラインの各 `Measure` を順に処理します。

| 引数 | 説明 |
|---|---|
| `callback` | `function(measure, index)` |

**使用例:**

```qml
Score.forEachMeasure(curScore, function (measure, index) {
    console.log("measure " + index + " tick=" + measure.firstSegment.tick)
})
```

### `forEachSegment(measure, callback)`

小節内の各 `Segment` を順に処理します。

| 引数 | 説明 |
|---|---|
| `callback` | `function(segment, index)` |

**使用例:**

```qml
Score.forEachMeasure(curScore, function (measure) {
    Score.forEachSegment(measure, function (segment, index) {
        console.log("segment " + index + " tick=" + segment.tick)
    })
})
```

---

## cursor.js

Cursor の生成・走査。

**Import:** `import ".../lib/cursor.js" as CursorUtil`

### `create(score, rewindMode)`

新しい Cursor を作り、`rewind` します。

| 引数 | 型 | 説明 |
|---|---|---|
| `score` | Score | 対象スコア |
| `rewindMode` | number | 省略時 `0`。`0`=スコア先頭、`1`=選択開始、`2`=選択終了 |

**戻り値:** `Cursor`、または `score` が無い場合 `null`

**使用例:**

```qml
var cursor = CursorUtil.create(curScore, 0)  // スコア先頭
if (cursor && cursor.element)
    console.log("first element type=" + cursor.element.type)
```

### `forEach(cursor, callback)`

Cursor が尽きるまで進みながら `callback(cursor)` を呼びます。`false` を返すと中断します。

**使用例:**

```qml
var cursor = CursorUtil.create(curScore, 0)
var count = 0
CursorUtil.forEach(cursor, function (c) {
    if (c.element && c.element.type === Element.CHORD)
        count++
    if (count >= 10)
        return false  // 10 個で打ち切り
})
console.log("chords seen: " + count)
```

### `forEachInSelection(score, callback)`

選択範囲内を走査します。選択が無い場合はスコア全体を走査します。`callback` が `false` を返すと中断します。

**使用例:**

```qml
CursorUtil.forEachInSelection(curScore, function (cursor) {
    var el = cursor.element
    if (!el)
        return
    if (el.type === Element.REST)
        console.log("rest at tick " + cursor.tick)
})
```

### `nextChordRest(cursor)`

現在位置から次の Chord / Rest まで進めます。既に ChordRest 上ならその場で `true`。

**戻り値:** 見つかれば `true`、無ければ `false`

**使用例:**

```qml
var cursor = CursorUtil.create(curScore, 0)
while (CursorUtil.nextChordRest(cursor)) {
    console.log("chord/rest at tick " + cursor.tick)
    cursor.next()
}
```

---

## selection.js

選択要素の取得・フィルタ。

**Import:** `import ".../lib/selection.js" as Selection`

### `hasSelection(score)`

選択要素が 1 つ以上あるか。

**戻り値:** `boolean`

**使用例:**

```qml
if (!Selection.hasSelection(curScore)) {
    console.log("要素を選択してください")
    quit()
    return
}
```

### `elements(score)`

選択要素をプレーンな配列で返します。無ければ `[]`。

**使用例:**

```qml
var selected = Selection.elements(curScore)
console.log("selected count: " + selected.length)
```

### `ofType(score, elementType)`

選択のうち、指定型（例: `Element.NOTE`）だけを返します。

**使用例:**

```qml
var notes = Selection.ofType(curScore, Element.NOTE)
console.log("selected notes: " + notes.length)
```

### `forEach(score, callback)`

各選択要素に対して `callback(element, index)` を呼びます。

**使用例:**

```qml
Selection.forEach(curScore, function (el, index) {
    console.log("#" + index + " type=" + el.type)
})
```

---

## elements.js

要素型の判定と Note の取り出し。

**Import:** `import ".../lib/elements.js" as Elements`

呼び出し側で `import MuseScore` が必要です（`Element.NOTE` 等を参照するため）。

### `isType(element, elementType)`

`element.type === elementType` かどうか。

**使用例:**

```qml
var el = curScore.selection.elements[0]
if (Elements.isType(el, Element.NOTE))
    console.log("これは Note です")
```

### `isNote(element)` / `isChord(element)` / `isRest(element)` / `isChordRest(element)`

それぞれ Note / Chord / Rest / Chord または Rest かどうか。

**使用例:**

```qml
Selection.forEach(curScore, function (el) {
    if (Elements.isNote(el))
        console.log("note")
    else if (Elements.isChord(el))
        console.log("chord")
    else if (Elements.isRest(el))
        console.log("rest")
})
```

### `chordNotes(element)`

Chord ならその中の Note 配列。それ以外は `[]`。

**使用例:**

```qml
var el = curScore.selection.elements[0]
var notes = Elements.chordNotes(el)
for (var i = 0; i < notes.length; i++)
    console.log("chord tone pitch=" + notes[i].pitch)
```

### `asNotes(element)`

Note なら `[element]`、Chord なら構成音、それ以外は `[]`。

**使用例:**

```qml
Selection.forEach(curScore, function (el) {
    var notes = Elements.asNotes(el)
    for (var i = 0; i < notes.length; i++)
        console.log(notes[i].pitch)
})
```

---

## notes.js

音高の表示・集約。

**Import:** `import ".../lib/notes.js" as Notes`

### `pitchName(pitch)`

MIDI ピッチを科学的音名に変換します（例: `60` → `"C4"`）。無効値は `"?"`。

**使用例:**

```qml
console.log(Notes.pitchName(60))  // "C4"
console.log(Notes.pitchName(69))  // "A4"
```

### `label(note)`

Note 要素の表示用ラベル（`pitchName(note.pitch)`）。無効時は `"?"`。

**使用例:**

```qml
var notes = Selection.ofType(curScore, Element.NOTE)
for (var i = 0; i < notes.length; i++)
    console.log(Notes.label(notes[i]))
```

### `uniquePitches(notes)`

Note 配列からユニークな MIDI ピッチを昇順で返します。

**使用例:**

```qml
var notes = Selection.ofType(curScore, Element.NOTE)
var pitches = Notes.uniquePitches(notes)
for (var i = 0; i < pitches.length; i++)
    console.log(Notes.pitchName(pitches[i]))
```

---

## version.js

実行中の MuseScore バージョンによる起動ゲート。

**Import:** `import ".../lib/version.js" as Version`

### バージョン表記

次のいずれかを受け付けます。

- 文字列: `"4.4.0"`, `"v4.4"`（欠けた桁は `0`）
- オブジェクト: `{ major, minor, update }`

### `parse(version)`

正規化した `{ major, minor, update }` を返します。解釈できない場合は `null`。

**使用例:**

```qml
var v = Version.parse("4.4.2")
console.log(v.major + "." + v.minor + "." + v.update)  // 4.4.2

var w = Version.parse("v4.5")
console.log(w.update)  // 0
```

### `format(major, minor, update)`

`"x.y.z"` 文字列を返します。

**使用例:**

```qml
console.log(Version.format(4, 4, 0))  // "4.4.0"
```

### `compare(a, b)`

| 戻り値 | 意味 |
|---|---|
| `-1` | `a < b` |
| `0` | 等しい |
| `1` | `a > b` |
| `NaN` | どちらかが不正 |

**使用例:**

```qml
console.log(Version.compare("4.3.2", "4.4.0"))  // -1
console.log(Version.compare("4.4.0", "4.4.0"))  // 0
console.log(Version.compare("4.5.0", "4.4.0"))  // 1
```

### `isAtLeast(major, minor, update, minimum)`

実行バージョン（3 引数）が `minimum` 以上なら `true`。

通常は `mscoreMajorVersion` / `mscoreMinorVersion` / `mscoreUpdateVersion` を渡します。

**使用例:**

```qml
if (!Version.isAtLeast(
        mscoreMajorVersion, mscoreMinorVersion, mscoreUpdateVersion, "4.4.0")) {
    console.log("4.4.0 未満です")
    quit()
    return
}
```

### `requireAtLeast(major, minor, update, minimum)`

ゲート用オブジェクトを返します。

| フィールド | 型 | 説明 |
|---|---|---|
| `ok` | boolean | 要求バージョン以上なら `true` |
| `current` | string | 実行中バージョン |
| `required` | string | 要求バージョン |
| `message` | string | ログ向けメッセージ |

**使用例:**

```qml
var gate = Version.requireAtLeast(
    mscoreMajorVersion, mscoreMinorVersion, mscoreUpdateVersion, "4.4.0")
if (!gate.ok) {
    console.log(gate.message)
    quit()
    return
}
```

### `requirePluginAtLeast(plugin, minimum)`

`MuseScore { id: plugin ... }` からバージョンを読んで `requireAtLeast` と同じ結果を返します。

**使用例:**

```qml
MuseScore {
    id: plugin
    onRun: {
        var gate = Version.requirePluginAtLeast(plugin, "4.4.0")
        if (!gate.ok) {
            console.log(gate.message)
            quit()  // Qt.quit() は使わない
            return
        }
        // 本処理
    }
}
```

### `pluginVersionString(plugin)`

プラグイン root から `"x.y.z"` を返します。

**使用例:**

```qml
console.log("running on MuseScore " + Version.pluginVersionString(plugin))
```

不足時は必ず `quit()` でプラグインを終了してください。詳細は [README の注意点](../README.md#注意点) を参照してください。

---

## settings.js

設定のキー／初期値／読込／保存／UI 反映をスキーマ駆動で扱うヘルパーです。

**Import:** `import ".../lib/settings.js" as SettingsUtil`

永続化先は MuseScore 組み込みの `Settings` です（`import MuseScore` のみ。`Qt.labs.settings` は不要）。

```qml
Settings {
    id: backend
    category: "MyPlugin"
    property string payload: "{}"
}
property var store: SettingsUtil.create({ modeIndex: 0, verbose: true })
```

### 設計方針

| よくある課題 | このライブラリでの対応 |
|---|---|
| 初期値がプロパティ定義と `reset()` で二重管理 | `defaults` オブジェクトが唯一の定義 |
| キーがプロパティ名に暗黙依存 | `defaults` のキーがスキーマ |
| `save`/`load` が UI コントロール ID に密結合 | binder マップで UI と分離 |
| `import Qt.labs.settings` が 4.4+ で不可 | MuseScore 組み込み `Settings` + JSON `payload` |

`create` 以降の関数は、原則として新しい `store` オブジェクトを返します（QML の `property var store` へ再代入してください）。

### `create(defaults)`

スキーマからストア `{ defaults, values }` を作ります。

**使用例:**

```qml
property var store: SettingsUtil.create({
    modeIndex: 0,
    verbose: true
})
```

### `keys(store)`

スキーマのキー配列を返します。

**使用例:**

```qml
console.log(SettingsUtil.keys(store))  // ["modeIndex", "verbose"]
```

### `load(store, payload)` / `savePayload(store)`

JSON 文字列 ↔ ストア。

**使用例:**

```qml
store = SettingsUtil.load(store, backend.payload)
backend.payload = SettingsUtil.savePayload(store)
```

### `loadFrom(settings, store)` / `saveTo(settings, store)`

`Settings` オブジェクトの `payload` プロパティと同期します（プロパティ名は第 3 引数で変更可）。

**使用例:**

```qml
store = SettingsUtil.loadFrom(backend, store)
SettingsUtil.saveTo(backend, store)
```

### `reset(store)` / `resetAndSave(settings, store)`

初期値へ戻します。`resetAndSave` は永続化まで行います。

**使用例:**

```qml
store = SettingsUtil.reset(store)
SettingsUtil.applyTo(store, uiBinders())

// または
store = SettingsUtil.resetAndSave(backend, store)
SettingsUtil.applyTo(store, uiBinders())
```

### `get(store, key)` / `set(store, key, value)`

1 キーの取得・更新。

**使用例:**

```qml
console.log(SettingsUtil.get(store, "verbose"))
store = SettingsUtil.set(store, "verbose", false)
```

### `applyTo(store, binders)` / `collectFrom(store, binders)`

UI との同期。`binders` は `{ key: function ... }`。

**使用例:**

```qml
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

SettingsUtil.applyTo(store, uiBinders())
store = SettingsUtil.collectFrom(store, uiCollectors())
```

### `loadTo(settings, store, binders)` / `saveFrom(settings, store, binders)`

読込→反映、収集→保存のショートカット。

**使用例:**

```qml
onRun: {
    store = SettingsUtil.loadTo(backend, store, uiBinders())
}

// OK ボタン
onClicked: {
    store = SettingsUtil.saveFrom(backend, store, uiCollectors())
    quit()
}
```

### 全体の使用例

```qml
import MuseScore
import QtQuick
import "../musescore-plugin-lib/lib/settings.js" as SettingsUtil

MuseScore {
    pluginType: "dialog"
    width: 360
    height: 200

    Settings {
        id: backend
        category: "MyPlugin"
        property string payload: "{}"
    }

    property var store: SettingsUtil.create({
        execModeIndex: 0,
        keysIndex: 0,
        isCheckVoiceRange: true
    })

    function uiBinders() {
        return {
            execModeIndex: function (v) { cmbExecMode.currentIndex = v },
            keysIndex: function (v) { cmbKeys.currentIndex = v },
            isCheckVoiceRange: function (v) { cbCheckVoiceRange.checked = v }
        }
    }

    function uiCollectors() {
        return {
            execModeIndex: function () { return cmbExecMode.currentIndex },
            keysIndex: function () { return cmbKeys.currentIndex },
            isCheckVoiceRange: function () { return cbCheckVoiceRange.checked }
        }
    }

    onRun: { store = SettingsUtil.loadTo(backend, store, uiBinders()) }

    // Default: store = SettingsUtil.reset(store); SettingsUtil.applyTo(store, uiBinders())
    // OK:      store = SettingsUtil.saveFrom(backend, store, uiCollectors()); quit()
}
```

実動サンプルは `examples/settings-persist/SettingsPersistExample.qml` を参照してください。

### 低レベル API

必要なら `clone` / `merge` / `parsePayload` / `stringify` も同じモジュールから利用できます。

---

## log.js

MuseScore 4 向けのログ／メッセージ補助です。

**事実:** MuseScore 4 には MU3 のような Plugin Creator／コンソールウィンドウがありません。`console.log` は GUI では通常見えず、端末から `-d` で起動したときだけ見える場合があります。アプリの `%LOCALAPPDATA%\MuseScore\MuseScore4\logs\` にもプラグインの `console.log` は出ないことが多いです。

**Import:** `import ".../lib/log.js" as Log`

### 推奨パターン

1. **ユーザー向け** — `Log.dump(logger)` をダイアログの `Label` に出す（例: Count Selection）
2. **開発向けファイル** — MuseScore `FileIO` に `Log.writeFile` / `Log.appendFile`

### `create(options)` / `info` / `warn` / `error` / `dump` / `clear`

**使用例（ダイアログ表示）:**

```qml
import "../musescore-plugin-lib/lib/log.js" as Log

property var logger: Log.create({ prefix: "MyPlugin: " })
property string feedback: ""

function showFeedback(message) {
    Log.clear(logger)
    Log.info(logger, message)
    feedback = Log.dump(logger)
}

// Label { text: feedback; wrapMode: Text.Wrap }
```

### `writeFile` / `appendFile` / `tempLogPath`

**使用例（ファイル出力）:**

```qml
import FileIO 3.0
import "../musescore-plugin-lib/lib/log.js" as Log

FileIO { id: logFile }

property var logger: Log.create({ prefix: "MyPlugin: " })

onRun: {
    Log.info(logger, "started")
    logFile.source = Log.tempLogPath(logFile, "my-plugin.log")
    Log.writeFile(logger, logFile)   // 上書き
    // Log.appendFile(logger, logFile) // 追記
}
```

`mirrorConsole: true` を付けると、バッファに加えて `console.log` も呼びます（`-d` 起動時用）。

---

## fonts.js

独自フォントが OS に入っているかの確認ヘルパーです。

**Import:** `import ".../lib/fonts.js" as Fonts`

背景・運用上の注意は [PITFALLS.md §2](PITFALLS.md#2-フォントインストール済みチェック) を参照してください。

### `isInstalled(family, families?)`

`families` 省略時は `Qt.fontFamilies()` を使います（単体テストでは配列を渡してください）。大文字小文字は無視します。

**使用例:**

```qml
if (!Fonts.isInstalled("KalimbaNotationJ")) {
    // 警告ダイアログなど
}
```

### `missing(required, families?)`

未インストールのファミリー名配列を返します。

**使用例:**

```qml
var missing = Fonts.missing(["KalimbaNotationJ", "KalimbaNotationE"])
```

### `missingMessage(missingFamilies, template?)`

箇条書き付きの案内文を返します。不足が無ければ `""`。`template` 内の `%1` がリストに置換されます。

---

## i18n.js

MuseScore 4.x でプラグイン `.qm` が読まれないことへのフォールバック補助です。

**Import:** `import ".../lib/i18n.js" as I18n`

詳細は [PITFALLS.md §1](PITFALLS.md#1-多言語対応qm-が読まれない) と [musescore/MuseScore#30833](https://github.com/musescore/MuseScore/issues/30833) を参照してください。

### `isLanguage(localeName, lang)`

`localeName` が `lang` で始まるか（例: `"ja_JP"` と `"ja"`）。

### `fallback(translated, source, dictionary, useDictionary)`

`qsTr` の結果が原文のまま、かつ `useDictionary` が真なら辞書を返します。

**使用例:**

```qml
property var ja: ({ "Cancel": "キャンセル" })

function tr(source) {
    return I18n.fallback(
        qsTr(source), source, ja,
        I18n.isLanguage(Qt.locale().name, "ja"))
}
```

### `tr(qsTrFn, source, dictionary, useDictionary, disambiguation?)`

`qsTr` 相当の関数を渡して辞書解決まで行うショートカット。曖昧性付きキーは `source + "\x1e" + disambiguation` です。

---

## annotations.js

プラグインが追加した楽譜上の注釈（主に `STAFF_TEXT`）を後から自分の分だけ消すためのヘルパーです。

**Import:** `import ".../lib/annotations.js" as Ann`

背景は [PITFALLS.md §3](PITFALLS.md#3-プラグインが追加した要素の削除) を参照してください。

### `tag(visibleText, prefix?)` / `hasTag(text, prefix?)` / `stripTag(text, prefix?)`

既定プレフィックスは ZWSP（`\u200B`）です。

**使用例:**

```qml
var text = newElement(Element.STAFF_TEXT)
text.fontFace = "MyPluginFont"
text.text = Ann.tag(noteLabel)
```

### `isOwned(element, options?)`

所有判定。`options` の主なキー:

| キー | 説明 |
|---|---|
| `fontFaces` | 一致する `fontFace` があれば所有（`requireTag` が真ならタグも必要） |
| `tagPrefix` | テキスト先頭タグ（省略時 ZWSP） |
| `elementType` | `Element.STAFF_TEXT` など型の一致 |
| `requireTag` | `true` なら fontFace だけでは不十分 |

### `collectFromSegment(segment, options?)`

`segment.annotations` から所有要素を集めます。`staffIdx`（0 始まり）を付けると `track / 4` で譜表フィルタします。

### `unique(elements)`

`el.is()` があればそれで、無ければ参照同一性で重複を除きます。削除前のまとめに使います。

**削除の流れ（概念）:**

```qml
Score.withCmd(curScore, "Remove my texts", function () {
    var cursor = CursorUtil.create(curScore, 0)
    var found = []
    CursorUtil.forEach(cursor, function (c) {
        if (!c.segment)
            return
        var hit = Ann.collectFromSegment(c.segment, {
            elementType: Element.STAFF_TEXT,
            fontFaces: ["MyPluginFont"]
        })
        for (var i = 0; i < hit.length; i++)
            found.push(hit[i])
    })
    found = Ann.unique(found)
    for (var j = 0; j < found.length; j++)
        removeElement(found[j])
})
```
