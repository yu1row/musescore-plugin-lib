# musescore-plugin-lib

MuseScore Studio（**4.4 以降専用**）プラグイン向けの共有ユーティリティライブラリです。  
QML から相対パスで `.js` を import して使います。

## 対象

- MuseScore Studio **4.4 以降のみ**（`import MuseScore` / Qt 6）
- **4.3.x 以前は対象外**です（一覧に出ない／Settings の import 要件が異なるため、同一ファイルでの共存は行いません）
- スコア操作・選択・バージョンゲート・設定の永続化・ログ（コンソール代替）・フォント確認・i18n フォールバック・追加注釈の所有判定など、プラグインで繰り返し出る処理の共通化

## 構成

```
musescore-plugin-lib/
├── lib/
│   ├── score.js       # startCmd/endCmd、小節・セグメント走査
│   ├── cursor.js      # Cursor 生成・走査
│   ├── selection.js   # 選択要素の取得・型フィルタ
│   ├── elements.js    # Note / Chord / Rest 判定
│   ├── notes.js       # 音名変換・ユニーク pitch
│   ├── version.js     # MuseScore バージョン判定・起動ゲート
│   ├── settings.js    # 設定スキーマ / 読込・保存・UI 同期
│   ├── log.js         # ダイアログ／ファイル向けログ（console 代替）
│   ├── fonts.js       # フォントインストール済みチェック
│   ├── i18n.js        # qsTr + 辞書フォールバック（4.x の qm 非対応対策）
│   └── annotations.js # プラグイン所有 STAFF_TEXT のタグ付け・収集
├── examples/
│   ├── count-selection/
│   └── settings-persist/
├── tests/             # Node 単体テスト
└── docs/
    ├── API.md
    ├── PITFALLS.md    # 実プラグイン改修で得た落とし穴
    ├── TESTING.md
    └── SMOKE.md
```

## インストール

1. このリポジトリを MuseScore の Plugins フォルダへ配置する（フォルダごと）。
2. 例（Windows）: `%USERPROFILE%\Documents\MuseScore4\Plugins\musescore-plugin-lib\`
3. MuseScore を起動し、Plugin Manager で例プラグインを有効化する。

自作プラグインから使う場合も、同じ Plugins 配下に置き、相対パスで import します。

```
Plugins/
├── musescore-plugin-lib/
│   └── lib/…
└── my-plugin/
    └── MyPlugin.qml
```

## 使い方

### 設定の永続化（settings.js）

プラグイン設定を永続化するための 4.4+ 向け API です。

- **初期値とキー**は `defaults` オブジェクトに集約
- **UI との同期**は binder マップ（コントロール ID を Settings に書かない）
- **`Qt.labs.settings` は不要**（`import MuseScore` のみ）

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
        modeIndex: 0,
        verbose: true
    })

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

    onRun: { store = SettingsUtil.loadTo(backend, store, uiBinders()) }
    // OK: store = SettingsUtil.saveFrom(backend, store, uiCollectors()); quit()
    // Default: store = SettingsUtil.reset(store); SettingsUtil.applyTo(store, uiBinders())
}
```

詳細は [API 詳細 — settings.js](docs/API.md#settingsjs) を参照してください。

### バージョンゲート + スコア操作

```qml
import MuseScore
import QtQuick

import "../musescore-plugin-lib/lib/score.js" as Score
import "../musescore-plugin-lib/lib/selection.js" as Selection
import "../musescore-plugin-lib/lib/elements.js" as Elements
import "../musescore-plugin-lib/lib/notes.js" as Notes
import "../musescore-plugin-lib/lib/version.js" as Version

MuseScore {
    id: plugin
    title: "My Plugin"
    pluginType: "action"
    requiresScore: true

    onRun: {
        var gate = Version.requirePluginAtLeast(plugin, "4.4.0")
        if (!gate.ok) {
            console.log(gate.message)
            quit()  // end this plugin (do not use Qt.quit())
            return
        }

        Score.withCmd(curScore, "My edit", function () {
            Selection.forEach(curScore, function (el) {
                if (Elements.isNote(el))
                    console.log(Notes.label(el))
            })
        })
    }
}
```

各 JS モジュールは QML 側の `import MuseScore` を継承するため、`Element.NOTE` などの定数をモジュール内で利用できます。`.pragma library` や JS 同士の `.import` は使っていません。

## テスト

方針の詳細は [TESTING.md](docs/TESTING.md) を参照してください。

### 単体テスト（CI）

MuseScore に依存しない `lib/*.js` のロジックは Node.js で検証します。

```bash
npm test
```

`push` / `pull_request` 時に GitHub Actions でも実行されます。

### 実機スモーク

例プラグインや Settings の動作確認は [SMOKE.md](docs/SMOKE.md) のチェックリストに従ってください。

## 注意点

- MuseScore 4 には Plugin Creator／デバッグコンソール UI がありません。**`console.log` の出力は GUI 上では通常見えません**（端末から `-d` 起動時のみ見える場合があります）。ユーザー向けメッセージはダイアログの `Label` などへ出してください。デバッグの蓄積には [`log.js`](docs/API.md#logjs)（バッファ／FileIO）を使えます。
- プラグインを終了するときは **`quit()`** を使ってください。
- **`Qt.quit()` は使わないでください。** MuseScore 本体まで閉じたり、クラッシュの原因になります。
- ダイアログ型は原則 **`requiresScore: false`** にし、スコア有無は `onRun` で確認してください。`true` のまま全スコアを閉じると、プラグイン終了時にアプリごと終了することがあります。
- バージョンゲートはメニュー表示を防げません。必ず `onRun` 内で判定し、不足時は UI に理由を出してから `quit()` してください。
- 設定永続化では **`import Qt.labs.settings` を書かないでください。** 4.4+ ではモジュール未インストールエラーになります。
- 分割した `.qml` に `MuseScore` という文字列（`import MuseScore` 含む）があると、別プラグインとして一覧に出ることがあります。詳細は [PITFALLS.md](docs/PITFALLS.md) を参照してください。

実プラグイン改修で得た落とし穴（多言語・フォント・追加要素の削除など）は [PITFALLS.md](docs/PITFALLS.md) にまとめています。

## API 概要

詳細は [API 詳細](docs/API.md) を参照してください。

| モジュール | 主な関数 |
|---|---|
| [`score.js`](docs/API.md#scorejs) | `withCmd`, `isValid`, `forEachMeasure`, `forEachSegment` |
| [`cursor.js`](docs/API.md#cursorjs) | `create`, `forEach`, `forEachInSelection`, `nextChordRest` |
| [`selection.js`](docs/API.md#selectionjs) | `hasSelection`, `elements`, `ofType`, `forEach` |
| [`elements.js`](docs/API.md#elementsjs) | `isNote`, `isChord`, `isRest`, `isChordRest`, `chordNotes`, `asNotes` |
| [`notes.js`](docs/API.md#notesjs) | `pitchName`, `label`, `uniquePitches` |
| [`version.js`](docs/API.md#versionjs) | `parse`, `format`, `compare`, `isAtLeast`, `requireAtLeast`, `requirePluginAtLeast` |
| [`settings.js`](docs/API.md#settingsjs) | `create`, `loadTo`, `saveFrom`, `reset`, `applyTo`, `collectFrom` |
| [`log.js`](docs/API.md#logjs) | `create`, `info`, `dump`, `writeFile`, `appendFile`, `tempLogPath` |
| [`fonts.js`](docs/API.md#fontsjs) | `isInstalled`, `missing`, `missingMessage` |
| [`i18n.js`](docs/API.md#i18njs) | `isLanguage`, `fallback`, `tr` |
| [`annotations.js`](docs/API.md#annotationsjs) | `tag`, `hasTag`, `isOwned`, `collectFromSegment`, `unique` |

## ライセンス

[MIT](LICENSE) — Copyright (c) 2026 yu1row

関連ドキュメント（サイト）: [yu1row.com/musescore/ — 共有ライブラリ](https://yu1row.com/musescore/plugin-lib.html)
