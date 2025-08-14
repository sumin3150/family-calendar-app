# Supabase セットアップガイド

## Supabaseとは
- 無料のPostgreSQLデータベース
- Vercelと同じく、デプロイが簡単
- リアルタイム機能付き
- 月50万回のAPI呼び出しが無料

## セットアップ手順

### 1. Supabaseアカウント作成
1. https://supabase.com/ にアクセス
2. "Start your project" をクリック
3. GitHubアカウントでログイン

### 2. プロジェクト作成
1. "New project" をクリック
2. Organization: 個人アカウントを選択
3. Name: `family-calendar-app`
4. Database Password: 強力なパスワードを設定
5. Region: `Northeast Asia (Tokyo)` を選択
6. "Create new project" をクリック

### 3. データベーステーブル作成
SQL Editorで以下を実行:

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

-- 初期データ挿入
INSERT INTO events (id, date, time, task, member) VALUES 
('1', '2025-08-05', '09:00', '仕事', 'けんじ'),
('2', '2025-08-06', '18:00', 'サックス', 'あい'),
('3', '2025-08-09', '08:00', 'テニス', 'けんじ');

INSERT INTO tasks (task_name) VALUES 
('仕事'),
('サックス'),
('テニス');
```

### 4. 環境変数設定
Project Settings → API から以下をコピー:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Vercelの環境変数に設定

### 5. パッケージインストール
```bash
npm install @supabase/supabase-js
```

## 利点
- 無料で高性能
- リアルタイム更新
- SQLクエリが使える
- バックアップ機能付き