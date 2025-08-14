# データベース切り替えガイド

## 概要
ファミリーカレンダーアプリを Vercel KV から **Vercel Postgres** に切り替えました。

## なぜ切り替えたのか
1. **データ整合性**: PostgresはACID準拠でデータの一貫性が保証される
2. **安定性**: KVよりもリレーショナルデータベースの方が安定
3. **デバッグ性**: SQL クエリでデータの状態を正確に把握できる

## 実装された変更

### 1. API Routes
- `src/app/api/tasks/route.ts`: `database-kv.ts` → `database.ts`
- `src/app/api/events/route.ts`: `database-kv.ts` → `database.ts`

### 2. データベース機能
- `src/lib/database.ts`に`deleteTask`関数を追加
- エラーハンドリングとロギング機能を強化
- データベース初期化処理の改善

### 3. テーブル構造
```sql
-- Events テーブル
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  task TEXT NOT NULL,
  member TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks テーブル
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  task_name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## セットアップ手順

### 1. Vercel Postgres の有効化
1. Vercelダッシュボード (https://vercel.com/dashboard) にアクセス
2. `family-calendar-app` プロジェクトを選択
3. **Storage** タブをクリック
4. **Create Database** → **Postgres** を選択
5. データベース名を設定（例：`family-calendar-db`）
6. **Create** をクリック

### 2. 環境変数の自動設定
Vercel Postgres を作成すると、以下の環境変数が自動的に設定されます：
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- その他の関連環境変数

### 3. デプロイ
```bash
git add .
git commit -m "Switch to Vercel Postgres database"
git push
```

## 動作テスト

デプロイ後、以下の機能をテストしてください：

1. **タスク追加**: 新しいタスクを追加できるか
2. **タスク削除**: タスクを削除できるか
3. **リロード**: リロード後も変更が保持されるか
4. **イベント**: カレンダーイベントの追加・削除・編集

## ログ確認

Vercel Function のログで以下のメッセージが表示されることを確認：
- `データベース初期化開始...`
- `初期イベントデータを挿入中...`
- `初期タスクデータを挿入中...`
- `データベース初期化完了`
- `タスク「○○」を保存中...`
- `タスク「○○」の保存完了`

## トラブルシューティング

### データベース接続エラー
- Vercel Postgres が正しく作成されているか確認
- 環境変数が正しく設定されているか確認

### データが表示されない
- Vercel Function ログでエラーがないか確認
- 初期データが正しく挿入されているか確認

### タスクが削除されない
- `deleteTask` 関数のログを確認
- PostgreSQLのrowCountが正しく返されているか確認

## パフォーマンス

PostgreSQLはKVよりもわずかに遅い場合がありますが、以下の利点があります：
- データの永続性保証
- トランザクション対応
- 複雑なクエリ対応
- より良いエラーハンドリング

データ量が少ない（100件未満のタスク・イベント）場合、パフォーマンスの違いは体感できません。