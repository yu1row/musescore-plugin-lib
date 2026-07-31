# 実機スモークチェックリスト

MuseScore Studio **4.4 以降**で、例プラグインが実環境で動くことを確認します。  
単体テストではカバーしきれない QML import / Settings / プラグイン終了を対象とします。

## 前提

1. このリポジトリを Plugins フォルダへ配置する（フォルダ名は `musescore-plugin-lib`）。
   - Windows 例: `%USERPROFILE%\Documents\MuseScore4\Plugins\musescore-plugin-lib\`
2. MuseScore Studio を起動する。
3. **Plugins → Plugin Manager** を開く。

**補足:** MuseScore 4 に Plugin Creator／コンソール UI はありません。例プラグインの結果はダイアログ上の文言で確認します（`console.log` には依存しません）。

## チェックリスト

### 1. プラグインの認識

- [ ] `Count Selection (MsLib example)` が表示され、有効化できる
- [ ] `Settings Persist (MsLib example)` が表示され、有効化できる

### 2. Count Selection

- [ ] スコアを開き、1 つ以上の音符を選択する
- [ ] プラグインを実行すると、**ダイアログ**に選択音符数と音名が出る
- [ ] 選択が無い場合は、選択を促すメッセージがダイアログに出る
- [ ] **OK** でプラグインが終わり、MuseScore 本体は閉じない

### 3. Settings Persist

- [ ] プラグインを開き、Mode / Verbose を初期値から変更して **OK** する
- [ ] プラグインを再度開くと、変更後の値が復元されている
- [ ] **Default** で初期値（Mode=Simple、Verbose=on）に戻る
- [ ] **Cancel** で終了でき、MuseScore 本体は閉じない

### 4. 終了 API（目視）

- [ ] 例プラグインに `Qt.quit()` が無い（`quit()` のみ）

### 5. バージョンゲート（任意）

不足バージョンでの実機確認ができる場合:

- [ ] 要求未満だとダイアログ（またはステータス表示）に理由が出て、MuseScore 本体は落ちない

古い版を用意できない場合は、`examples/**/*.qml` の `Version.requirePluginAtLeast` → UI 表示 → `quit()` の流れをコードレビューで確認すれば十分です。

## 記録（任意）

| 項目 | 値 |
|---|---|
| 確認日 | |
| MuseScore バージョン | |
| OS | |
| 結果 | OK / NG（詳細） |
