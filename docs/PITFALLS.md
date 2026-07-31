# MuseScore Studio プラグイン開発の落とし穴

KalimbaNotation など実プラグイン改修で得た知見です。  
`musescore-plugin-lib` を使う・自作プラグインを書くときのチェックリストとして使ってください。

関連 API: [`fonts.js`](API.md#fontsjs) / [`i18n.js`](API.md#i18njs) / [`annotations.js`](API.md#annotationsjs) / [`settings.js`](API.md#settingsjs)

---

## 1. 多言語対応（`.qm` が読まれない）

MuseScore 3 は `translations/locale_XX.qm` を自動読み込みしていましたが、**MuseScore 4.x はプラグインの `.qm` を読み込みません**（[musescore/MuseScore#30833](https://github.com/musescore/MuseScore/issues/30833)）。

| 手段 | 4.x での扱い |
|---|---|
| `qsTr("…")` + `.qm` | 通常は原文のまま（qm が効かない） |
| 組み込み辞書へのフォールバック | 実用的な回避策 |
| 本体コンテキストの `qsTranslate` | 本体に存在する文言のみ有効 |

**推奨:** UI 文字列は `qsTr` を呼びつつ、未翻訳かつ対象言語のときは辞書を返す。  
ライブラリの [`i18n.js`](API.md#i18njs) がその判定を提供します。

```qml
import "../musescore-plugin-lib/lib/i18n.js" as I18n

property var ja: ({
    "OK": "OK",
    "Cancel": "キャンセル"
})

function tr(source) {
    return I18n.fallback(qsTr(source), source, ja, I18n.isLanguage(Qt.locale().name, "ja"))
}
```

表示言語は MuseScore 本体の設定に合わせてください。

---

## 2. フォントインストール済みチェック

独自フォントを楽譜に載せるプラグインは、**OS にフォントが無いと代替フォントで表示され、見た目が壊れます**。  
インストール直後は MuseScore の再起動が必要なことが多いです。

起動時（または実行前）に `Qt.fontFamilies()` で確認し、足りなければダイアログで案内してください。  
[`fonts.js`](API.md#fontsjs) の `isInstalled` / `missing` が使えます。

```qml
import "../musescore-plugin-lib/lib/fonts.js" as Fonts

var missing = Fonts.missing(["MyPluginFont"])
if (missing.length > 0) {
    // Label / Dialog で案内し、必要なら処理を止める
}
```

---

## 3. プラグインが追加した要素の削除

`STAFF_TEXT` などを追加したあとで「自分の分だけ」消すには、追加時に識別子を付けておく必要があります。

よく使う識別手段:

| 手段 | 内容 |
|---|---|
| 不可視プレフィックス | テキスト先頭に ZWSP（`\u200B`）などを付与 |
| `fontFace` | 独自フォント名で一致判定（レガシー分の救済にも有効） |
| 削除 API | `removeElement(el)`（`startCmd`/`endCmd` 内） |

走査は `segment.annotations` を見て、一致した要素だけ `removeElement` します。  
[`annotations.js`](API.md#annotationsjs) でタグ付け・所有判定・セグメントからの収集ができます。

```qml
import "../musescore-plugin-lib/lib/annotations.js" as Ann

var text = newElement(Element.STAFF_TEXT)
text.fontFace = "MyPluginFont"
text.text = Ann.tag("C")  // "\u200B" + "C"

// 後で削除するとき
if (Ann.isOwned(el, { fontFaces: ["MyPluginFont"] }))
    removeElement(el)
```

---

## 4. ダイアログを閉じると MuseScore が終了する

原因の多くは **`Qt.quit()`** です。プラグイン終了には **`quit()`** だけを使ってください。

```qml
// NG — アプリ全体が閉じる／クラッシュしうる
Qt.quit()

// OK — このプラグインだけ終了
quit()
```

ダイアログの Cancel / OK / × 相当も同様です。`Window.close()` はフォールバック程度に留め、まず `quit()` を試してください。

---

## 5. 分離した `.qml` が別プラグインとして検出される

Plugins 配下の **`.qml` に `MuseScore` という文字列が含まれると**、レガシー検出により Plugin Manager に別エントリとして出ることがあります（`import MuseScore` も対象）。

**対策:**

1. **エントリポイントだけ** `MuseScore { … }` / `import MuseScore` を書く
2. 分割ファイル（Helper / Settings UI など）は `Item` にし、`import MuseScore` を書かない
3. 必要な `Element` / `Cursor` / `Placement` などは **メイン側からプロパティで注入**する
4. コメントや文言でも `MuseScore` を一語で書かない（必要なら `"Mu" + "seScore"` のように実行時結合）

`.js` モジュールはこの検出対象外です。共有ロジックは本ライブラリのような `.js` に寄せると安全です。

---

## 6. `Qt.labs.settings` が Studio に入っていない

MuseScore Studio **4.4+** では `import Qt.labs.settings` が使えません（モジュール未インストール）。  
代わりに **`import MuseScore` の `Settings`** を使います。

```qml
import MuseScore  // Qt.labs.settings は書かない

Settings {
    id: backend
    category: "MyPlugin"
    property string payload: "{}"
}
```

スキーマ駆動の読込／保存は [`settings.js`](API.md#settingsjs) を参照してください。

---

## 7. 全スコア閉鎖中にプラグインを閉じるとアプリが終了する

ダイアログ型で **`requiresScore: true`** のとき、スコアが無い／すべて閉じた状態でプラグインを閉じると、**MuseScore 本体まで終了する**ことがあります。

**推奨:**

- ダイアログ型は原則 **`requiresScore: false`**
- スコア必須の処理は `onRun` / OK 時に `curScore`（または `Score.isValid`）を自分で確認する
- スコアが無いときは UI で案内し、ダイアログ自体は閉じられるようにする

```qml
MuseScore {
    pluginType: "dialog"
    requiresScore: false  // スコア全閉でアプリ終了しにくくする

    onRun: {
        if (!curScore) {
            // 警告を出して編集系 UI を無効化
            return
        }
        // …
    }
}
```
