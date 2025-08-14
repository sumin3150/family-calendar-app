# 🚀 Supabase デプロイメントチェックリスト

## ✅ 完了済みの作業

### 1. コード実装
- [x] **Supabaseクライアントライブラリ** インストール済み (`@supabase/supabase-js`)
- [x] **データベーススキーマファイル** 作成済み (`supabase/schema.sql`)
- [x] **Supabaseクライアント設定** 作成済み (`src/lib/supabase.ts`)
- [x] **データベース実装** 作成済み (`src/lib/database-supabase.ts`)
- [x] **APIルート切り替え** 完了済み
- [x] **ビルドテスト** 成功

### 2. データベース設計
- [x] **Events テーブル**: イベント管理
- [x] **Tasks テーブル**: タスク管理
- [x] **インデックス設計**: パフォーマンス最適化
- [x] **Row Level Security**: セキュリティ設定
- [x] **初期データ**: サンプルデータ準備済み

### 3. 機能実装
- [x] **CRUD操作**: 作成・読取・更新・削除
- [x] **エラーハンドリング**: 堅牢なエラー処理
- [x] **ログ機能**: デバッグ用ログ
- [x] **統計機能**: イベント数・メンバー別統計
- [x] **接続テスト**: データベース接続確認

## 📋 デプロイ前に必要な作業

### Step 1: Supabaseプロジェクト作成
1. [ ] https://supabase.com/ でアカウント作成
2. [ ] 新規プロジェクト作成
   - Name: `family-calendar-app`
   - Region: `Northeast Asia (Tokyo)`
   - Password: 強力なパスワード設定
3. [ ] プロジェクト作成完了まで待機（2-3分）

### Step 2: データベース初期化
1. [ ] SQL Editorで `supabase/schema.sql` の内容を実行
2. [ ] テーブル作成完了確認
3. [ ] 初期データ投入確認
4. [ ] RLSポリシー設定確認

### Step 3: 環境変数設定
1. [ ] Supabaseから接続情報取得
   - Project Settings → API
   - `Project URL` をコピー
   - `API Key (anon/public)` をコピー
2. [ ] `.env.local` ファイル更新
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...your-actual-key...
   ```
3. [ ] Vercel環境変数設定
   - Vercelダッシュボード → プロジェクト → Settings → Environment Variables
   - 上記2つの環境変数を追加

### Step 4: デプロイとテスト
1. [ ] Gitにコミット・プッシュ
   ```bash
   git add .
   git commit -m "Supabaseデータベースへ切り替え"
   git push
   ```
2. [ ] Vercel自動デプロイ完了まで待機
3. [ ] 本番アプリで動作テスト
   - [ ] タスク追加テスト
   - [ ] タスク削除テスト
   - [ ] イベント追加・編集・削除テスト
   - [ ] リロードでデータ保持確認

## 🔧 ローカル開発テスト（オプション）

実際のSupabase接続で開発環境テスト:
1. [ ] 実際の環境変数を`.env.local`に設定
2. [ ] `npm run dev` で開発サーバー起動
3. [ ] http://localhost:3000 でテスト
4. [ ] ブラウザのDevToolsでSupabaseログ確認

## 🚨 トラブルシューティング

### データベース接続エラー
- [ ] 環境変数が正確に設定されているか確認
- [ ] Supabaseプロジェクトが作成済みか確認
- [ ] Vercelの環境変数設定を確認

### RLSポリシーエラー
- [ ] `supabase/schema.sql`のRLSポリシーが実行済みか確認
- [ ] Supabaseダッシュボードの「Authentication」→「Policies」で確認

### ビルドエラー
- [ ] `npm install`でパッケージを再インストール
- [ ] `.next`フォルダを削除して再ビルド

## 📊 期待される結果

デプロイ成功後:
- ✅ タスクの追加・削除が即座に反映
- ✅ リロードしてもデータが保持
- ✅ 複数ユーザーでのリアルタイム同期
- ✅ 高速なデータベース操作
- ✅ 無料枠内での安定動作

## 📈 無料プラン制限

- **データベース**: 500MB
- **API呼び出し**: 月50万回
- **ストレージ**: 1GB
- **帯域幅**: 5GB

通常の家族利用では十分な制限です。

## 🔄 次のステップ

デプロイ完了後に検討する機能:
- [ ] ユーザー認証の追加
- [ ] リアルタイム同期の活用
- [ ] プッシュ通知
- [ ] データエクスポート機能
- [ ] より詳細な統計・分析

---

**このチェックリスト完了後、安定したSupabaseベースの**
**ファミリーカレンダーアプリが完成します！** 🎉