# テスト方針

このリポジトリのテストは二層構成です。

| 層 | 目的 | 実行場所 |
|---|---|---|
| Node 単体テスト | `lib/*.js` のロジック回帰を防ぐ | ローカル / GitHub Actions（必須） |
| 実機スモーク | QML import・Settings・例プラグインの動作確認 | 開発者の MuseScore Studio |

## Node 単体テスト（主軸）

MuseScore を起動せず、QML 用 `.js` を Node の `vm` で読み込んで検証します。

```bash
npm test
```

`push` / `pull_request` では GitHub Actions（`.github/workflows/test.yml`）が同じコマンドを実行します。

カバー対象の目安:

- 純粋ロジック: `version.js` / `settings.js` / `notes.js` / `log.js`
- mock 付き: `elements.js` / `selection.js` / `score.js` / `cursor.js`

## 実機スモーク

例プラグインや `Settings` / `quit()` など、実環境依存の確認は [SMOKE.md](SMOKE.md) のチェックリストに従います。  
リリース前や設定永続化まわりの変更時に実施してください。

MuseScore 4 にはプラグイン用コンソール UI が無いため、スモークではダイアログ表示を確認します（`console.log` は使いません）。

## 対象外

- CI 上での MuseScore インストールと GUI 自動操作
- Qt Test / qmltestrunner による QML UI テスト
