-- =====================================================
-- ファミリーカレンダー Supabase データベーススキーマ（簡略版）
-- =====================================================

-- 既存のテーブルを削除（初期化時のみ）
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;

-- =====================================================
-- Events テーブル（カレンダーイベント）
-- =====================================================
CREATE TABLE events (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    date DATE NOT NULL,
    time TIME NOT NULL,
    task TEXT NOT NULL,
    member TEXT NOT NULL CHECK (member IN ('けんじ', 'あい')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events テーブルのインデックス
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_member ON events(member);
CREATE INDEX idx_events_task ON events(task);

-- =====================================================
-- Tasks テーブル（利用可能なタスクリスト）
-- =====================================================
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    task_name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks テーブルのインデックス
CREATE INDEX idx_tasks_name ON tasks(task_name);

-- =====================================================
-- 自動更新トリガー関数
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Events テーブルのupdated_at自動更新トリガー
CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Row Level Security (RLS) 設定
-- =====================================================

-- RLS有効化
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 基本的なRLSポリシー（全ユーザーアクセス可能）
CREATE POLICY "Enable all access for events" ON events
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for tasks" ON tasks
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 初期データ投入
-- =====================================================

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
('洗濯'),
('勉強'),
('ヨガ'),
('ジム'),
('会議')
ON CONFLICT (task_name) DO NOTHING;

-- 初期イベントデータ
INSERT INTO events (id, date, time, task, member) VALUES 
('event-1', '2025-08-05', '09:00', '仕事', 'けんじ'),
('event-2', '2025-08-06', '18:00', 'サックス', 'あい'),
('event-3', '2025-08-09', '08:00', 'テニス', 'けんじ'),
('event-4', '2025-08-10', '14:00', 'ショッピング', 'あい'),
('event-5', '2025-08-12', '10:00', 'サックス', 'あい'),
('event-6', '2025-08-13', '19:00', '映画鑑賞', 'けんじ'),
('event-7', '2025-08-15', '07:00', 'ジム', 'あい'),
('event-8', '2025-08-16', '13:00', '散歩', 'けんじ')
ON CONFLICT (id) DO NOTHING;