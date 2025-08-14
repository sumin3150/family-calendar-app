-- =====================================================
-- ファミリーカレンダー Supabase データベーススキーマ
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
-- 実際の運用では認証ベースのポリシーに変更することを推奨

-- Events テーブルポリシー
CREATE POLICY "Enable all access for events" ON events
    FOR ALL USING (true) WITH CHECK (true);

-- Tasks テーブルポリシー  
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

-- =====================================================
-- 便利なビューとファンクション
-- =====================================================

-- 今月のイベント一覧ビュー
CREATE OR REPLACE VIEW current_month_events AS
SELECT 
    id,
    date,
    time,
    task,
    member,
    EXTRACT(DOW FROM date) as day_of_week,
    created_at,
    updated_at
FROM events 
WHERE date >= DATE_TRUNC('month', CURRENT_DATE)
  AND date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
ORDER BY date, time;

-- メンバー別イベント統計
CREATE OR REPLACE VIEW member_event_stats AS
SELECT 
    member,
    COUNT(*) as total_events,
    COUNT(CASE WHEN date >= CURRENT_DATE THEN 1 END) as upcoming_events,
    MAX(date) as last_event_date
FROM events 
GROUP BY member;

-- =====================================================
-- データベース関数
-- =====================================================

-- 指定期間のイベント取得関数
CREATE OR REPLACE FUNCTION get_events_by_period(
    start_date DATE,
    end_date DATE
)
RETURNS TABLE (
    id TEXT,
    event_date DATE,
    event_time TIME,
    task TEXT,
    member TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE sql
AS $$
    SELECT id, date, "time", task, member, created_at, updated_at
    FROM events 
    WHERE date >= start_date AND date <= end_date
    ORDER BY date, "time";
$$;

-- タスク使用頻度取得関数
CREATE OR REPLACE FUNCTION get_task_usage_stats()
RETURNS TABLE (
    task_name TEXT,
    usage_count BIGINT,
    last_used TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
AS $$
    SELECT 
        t.task_name,
        COUNT(e.task) as usage_count,
        MAX(e.created_at) as last_used
    FROM tasks t
    LEFT JOIN events e ON t.task_name = e.task
    GROUP BY t.task_name
    ORDER BY usage_count DESC, t.task_name;
$$;

-- =====================================================
-- 完了確認
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'ファミリーカレンダー データベース初期化完了';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'テーブル数: %', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('events', 'tasks'));
    RAISE NOTICE 'イベント数: %', (SELECT COUNT(*) FROM events);
    RAISE NOTICE 'タスク数: %', (SELECT COUNT(*) FROM tasks);
    RAISE NOTICE '==============================================';
END $$;