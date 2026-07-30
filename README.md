# musescore-plugin-lib

MuseScore Studio（4.4+）プラグイン向けの共有ユーティリティライブラリです。  
QML から相対パスで `.js` を import して使います。

## 対象

- MuseScore Studio **4.4 以降**（`import MuseScore` / Qt 6）
- プラグイン開発で繰り返し出てくるスコア操作・カーソル・選択・要素判定の共通化

## 構成

```
musescore-plugin-lib/
├── lib/
│   ├── score.js       # startCmd/endCmd、小節・セグメント走査
│   ├── cursor.js      # Cursor 生成・走査
│   ├── selection.js   # 選択要素の取得・型フィルタ
│   ├── elements.js    # Note / Chord / Rest 判定
│   └── notes.js       # 音名変換・ユニーク pitch
└── examples/
    └── count-selection/
        └── CountSelection.qml
```

## インストール

1. このリポジトリを MuseScore の Plugins フォルダへ配置する（フォルダごと）。
2. 例（Windows）: `%USERPROFILE%\Documents\MuseScore4\Plugins\musescore-plugin-lib\`
3. MuseScore を起動し、Plugins → Plugin Manager で `Count Selection (MsLib example)` を有効化する。

自作プラグインから使う場合も、同じ Plugins 配下に置き、相対パスで import します。

```
Plugins/
├── musescore-plugin-lib/
│   └── lib/…
└── my-plugin/
    └── MyPlugin.qml
```

## 使い方

```qml
import MuseScore
import QtQuick

import "../musescore-plugin-lib/lib/score.js" as Score
import "../musescore-plugin-lib/lib/selection.js" as Selection
import "../musescore-plugin-lib/lib/elements.js" as Elements
import "../musescore-plugin-lib/lib/notes.js" as Notes

MuseScore {
    title: "My Plugin"
    pluginType: "action"
    requiresScore: true

    onRun: {
        Score.withCmd(curScore, "My edit", function () {
            Selection.forEach(curScore, function (el) {
                if (Elements.isNote(el))
                    console.log(Notes.label(el))
            })
        })
    }
}
```

各モジュールは QML 側の `import MuseScore` を継承するため、`Element.NOTE` などの定数をモジュール内で利用できます。`.pragma library` や JS 同士の `.import` は使っていません。

## API 概要

| モジュール | 主な関数 |
|---|---|
| `score.js` | `withCmd`, `isValid`, `forEachMeasure`, `forEachSegment` |
| `cursor.js` | `create`, `forEach`, `forEachInSelection`, `nextChordRest` |
| `selection.js` | `hasSelection`, `elements`, `ofType`, `forEach` |
| `elements.js` | `isNote`, `isChord`, `isRest`, `isChordRest`, `chordNotes`, `asNotes` |
| `notes.js` | `pitchName`, `label`, `uniquePitches` |

## ライセンス

[MIT](LICENSE) — Copyright (c) 2026 yu1row
