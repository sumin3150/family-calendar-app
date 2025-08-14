# Supabase 完全セットアップガイド

## 📋 概要

Supabaseは無料のPostgreSQLデータベースサービスです。ファミリーカレンダーアプリで以下の利点があります：

- ✅ **無料**: 月500MB、50万API呼び出しまで無料
- ✅ **高性能**: PostgreSQL基盤で高速
- ✅ **リアルタイム**: データ変更の即座同期
- ✅ **スケーラブル**: 自動スケーリング対応
- ✅ **セキュア**: Row Level Security (RLS) 対応

## 🚀 ステップ1: Supabaseプロジェクト作成

### 1.1 アカウント作成
1. https://supabase.com/ にアクセス
2. 「Start your project」をクリック
3. GitHubアカウントでサインアップ

### 1.2 新規プロジェクト作成
1. ダッシュボードで「New project」をクリック
2. 以下の情報を入力：
   - **Name**: `family-calendar-app`
   - **Database Password**: 強力なパスワード（大文字・小文字・数字・記号）
   - **Region**: `Northeast Asia (Tokyo)` または `Asia Pacific (Tokyo)`
   - **Pricing Plan**: Free (0円/月)
3. 「Create new project」をクリック
4. プロジェクト作成完了まで2-3分待機

## 🗄️ ステップ2: データベース設計

### 2.1 テーブル設計

#### Events テーブル
```sql
-- イベント（カレンダーの予定）
CREATE TABLE events (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    date DATE NOT NULL,
    time TIME NOT NULL,
    task TEXT NOT NULL,
    member TEXT NOT NULL CHECK (member IN ('けんじ', 'あい')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tasks テーブル
```sql
-- タスク（利用可能なタスクリスト）
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    task_name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.2 インデックス設計
```sql
-- パフォーマンス向上のためのインデックス
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_member ON events(member);
CREATE INDEX idx_tasks_name ON tasks(task_name);
```

### 2.3 トリガー（自動更新時刻）
```sql
-- updated_at自動更新のトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 📊 ステップ3: 初期データ投入

```sql
-- 初期イベントデータ
INSERT INTO events (id, date, time, task, member) VALUES 
('event-1', '2025-08-05', '09:00', '仕事', 'けんじ'),
('event-2', '2025-08-06', '18:00', 'サックス', 'あい'),
('event-3', '2025-08-09', '08:00', 'テニス', 'けんじ'),
('event-4', '2025-08-10', '14:00', 'ショッピング', 'あい'),
('event-5', '2025-08-12', '10:00', 'サックス', 'あい');

-- 初期タスクデータ
INSERT INTO tasks (task_name) VALUES 
('仕事'),
('サックス'),
('テニス'),
('ショッピング'),
('読書'),
('映画鑑賞'),
('散歩'),
('料理'),
('掃除'),
('洗濯');
```

## 🔐 ステップ4: セキュリティ設定（Row Level Security）

```sql
-- RLS有効化
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 全員が読み取り・書き込み可能な基本ポリシー
-- 実際の運用では適切な認証ベースのポリシーを設定
CREATE POLICY "Enable read access for all users" ON events FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON events FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON events FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON tasks FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON tasks FOR DELETE USING (true);
```

## 🔧 ステップ5: API設定取得

### 5.1 接続情報の取得
1. Supabaseプロジェクトダッシュボードへ
2. 左メニュー「Settings」→「API」をクリック
3. 以下の情報をコピー：
   - **Project URL**: `https://your-project-id.supabase.co`
   - **API Key (anon/public)**: `eyJhbGc...` (長い文字列)

### 5.2 環境変数設定
`.env.local` に追加：
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key...
```

## 📱 ステップ6: Vercel環境変数設定

1. Vercelダッシュボード → プロジェクト選択
2. 「Settings」→「Environment Variables」
3. 以下を追加：
   - `NEXT_PUBLIC_SUPABASE_URL`: プロジェクトURL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 匿名キー

## ✅ 完成後の確認項目

- [ ] Supabaseプロジェクトが作成済み
- [ ] データベーステーブル（events, tasks）が作成済み
- [ ] 初期データが投入済み
- [ ] 環境変数が設定済み
- [ ] RLSポリシーが設定済み

## 🚨 注意事項

1. **パスワード管理**: データベースパスワードは安全に保管
2. **API Key**: anon keyは公開されても安全（RLSで保護）
3. **使用量監視**: 無料枠の使用量を定期的に確認
4. **バックアップ**: 重要なデータは定期的にエクスポート

## 🔄 次のステップ

このガイド完了後：
1. アプリケーションコードでSupabaseクライアント実装
2. API routeの切り替え
3. 動作テスト
4. 本番デプロイ

---

**問題が発生した場合**
- Supabaseコンソールの「Logs」でエラー確認
- APIキーが正しく設定されているか確認
- ネットワーク接続を確認