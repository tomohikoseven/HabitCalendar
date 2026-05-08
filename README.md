# Astro Habit Calendar 📅

Google カレンダーの予定から学習時間や習慣のログを自動集計し、GitHubのコントリビューション風（草）に表示する Astro コンポーネントです。

![Example Image](https://github.com/your-username/HabitCalendar/raw/main/example.png) *(実際に公開する際は画像を差し替えてください)*

## 特徴

- ⚡ **爆速表示**: ビルド時に Google API からデータを取得し、静的なHTMLとして出力します（SSG）。
- 🔒 **セキュア**: APIキーはサーバーサイド（ビルド時）でのみ使用され、クライアント側には公開されません。
- 🌓 **ダークモード対応**: OS設定や `data-theme="dark"` に自動で対応します。
- 📱 **レスポンシブ**: 横スクロールに対応し、スマホでも閲覧可能です。

## 導入方法

### 1. ファイルの配置

`src/components/HabitCalendar.astro` と `src/utils/googleCalendar.ts` をあなたのプロジェクトにコピーします。

### 2. Google API の準備

このコンポーネントを使用するには、Google カレンダーのデータを取得するための設定が必要です。

1. **Google Cloud Console**:
   - プロジェクトを作成し、「Google Calendar API」を有効化します。
   - 「認証情報」から **APIキー** を作成します。
2. **Google カレンダー**:
   - 表示したいカレンダーの「設定と共有」を開きます。
   - 「予定のアクセス権」で **「一般公開して誰でも利用できるようにする」** にチェックを入れます。
   - 「カレンダーの統合」セクションにある **カレンダー ID** をコピーします。

### 3. 環境変数の設定

プロジェクトのルートにある `.env` ファイルに取得した値を設定します。

```properties
# サーバーサイド用（ビルド時に使用）
GOOGLE_CALENDAR_API_KEY="あなたのAPIキー"

# 公開用（カレンダーID）
PUBLIC_GOOGLE_CALENDAR_ID="あなたのカレンダーID"
```

### 4. コンポーネントの使用

MDX や Astro ファイルで以下のように呼び出します。

```astro
---
import HabitCalendar from './components/HabitCalendar.astro';
---

<HabitCalendar year={2026} />
```

## プロパティ

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `year` | `number` | `currentYear` | 表示したい年 |
| `apiKey` | `string` | `process.env...` | Google APIキー（環境変数推奨） |
| `calendarId` | `string` | `process.env...` | GoogleカレンダーID |
| `label` | `string` | `"合計時間"` | ヘッダーに表示するラベル |

## 自動更新の設定 (GitHub Actions)

毎日カレンダーを最新の状態にするには、GitHub Actions で定期ビルドを設定するのがおすすめです。

```yaml
name: Daily Deploy
on:
  schedule:
    - cron: '0 15 * * *' # 日本時間 0:00
  workflow_dispatch: # 手動実行用

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      # ... 通常のデプロイステップ ...
      env:
        GOOGLE_CALENDAR_API_KEY: ${{ secrets.GOOGLE_CALENDAR_API_KEY }}
        PUBLIC_GOOGLE_CALENDAR_ID: ${{ secrets.PUBLIC_GOOGLE_CALENDAR_ID }}
```

## ライセンス

MIT License
