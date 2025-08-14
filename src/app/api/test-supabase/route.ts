import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Supabase接続テスト開始');
    
    // 環境変数チェック
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('URL設定:', url ? 'OK' : 'NG');
    console.log('Key設定:', key ? 'OK' : 'NG');
    
    // 環境変数がない場合はテストをスキップ
    if (!url || !key) {
      console.log('Supabase環境変数未設定 - テストスキップ');
      return NextResponse.json({
        success: true,
        message: 'Supabase not configured - using LocalStorage',
        url: url ? 'Set' : 'Missing',
        key: key ? 'Set' : 'Missing'
      });
    }
    
    // 環境変数が設定されている場合のみSupabaseテスト実行
    const { supabase } = await import('@/lib/supabase');
    const { data, error } = await supabase
      .from('tasks')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase接続エラー:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        url: url ? 'Set' : 'Missing',
        key: key ? 'Set' : 'Missing'
      });
    }
    
    console.log('Supabase接続成功');
    return NextResponse.json({
      success: true,
      message: 'Supabase connection OK',
      url: url ? 'Set' : 'Missing',
      key: key ? 'Set' : 'Missing'
    });
    
  } catch (error) {
    console.error('テスト実行エラー:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}