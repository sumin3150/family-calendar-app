# PlanetScale セットアップガイド

## PlanetScaleとは
- サーバーレスMySQL
- 無料プランで10GB
- ブランチング機能（Git風データベース）
- Vercelとの連携が簡単

## セットアップ手順

### 1. PlanetScaleアカウント作成
1. https://planetscale.com/ にアクセス
2. GitHubアカウントでサインアップ

### 2. データベース作成
1. "Create database" をクリック
2. Name: `family-calendar`
3. Region: `Tokyo, Japan (ap-northeast-1)`
4. "Create database" をクリック

### 3. ブランチ作成とスキーマ設定
1. "main" ブランチに移動
2. "Connect" → "Connect with @planetscale/database"
3. 以下のスキーマを実行:

```sql
CREATE TABLE events (
  id VARCHAR(255) PRIMARY KEY,
  date VARCHAR(10) NOT NULL,
  time VARCHAR(5) NOT NULL,
  task VARCHAR(255) NOT NULL,
  member VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO events (id, date, time, task, member) VALUES 
('1', '2025-08-05', '09:00', '仕事', 'けんじ'),
('2', '2025-08-06', '18:00', 'サックス', 'あい'),
('3', '2025-08-09', '08:00', 'テニス', 'けんじ');

INSERT INTO tasks (task_name) VALUES 
('仕事'),
('サックス'),
('テニス');
```

### 4. 接続文字列取得
1. "Connect" をクリック
2. "Passwords" → "New password" でパスワード作成
3. 接続文字列をコピー

### 5. パッケージインストール
```bash
npm install @planetscale/database
```

## 利点
- MySQLベース
- Git風のブランチング
- 自動スケーリング
- Vercel連携が簡単