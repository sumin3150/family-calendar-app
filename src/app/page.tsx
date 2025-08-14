"use client";

import { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EventForm from "@/components/EventForm";
import TaskManagement from "@/components/TaskManagement";
import { fetchEvents, fetchTasks, saveEvent, deleteEvent, saveTask, deleteTask } from "@/lib/api";

interface Event {
  id: string;
  date: string;
  time: string;
  task: string;
  member: string;
}

const initialTasks = [
  "仕事",
  "サックス",
  "テニス"
];

const familyMembers = [
  { name: "けんじ", color: "bg-blue-200" },
  { name: "あい", color: "bg-pink-200" }
];

const sampleEvents: Event[] = [
  { id: "1", date: "2025-08-05", time: "09:00", task: "仕事", member: "けんじ" },
  { id: "2", date: "2025-08-06", time: "18:00", task: "サックス", member: "あい" },
  { id: "3", date: "2025-08-09", time: "08:00", task: "テニス", member: "けんじ" }
];

export default function CalendarApp() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 7));
  const [visibleMembers, setVisibleMembers] = useState(familyMembers.map(m => m.name));
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [storageStatus, setStorageStatus] = useState<'kv' | 'local' | 'loading'>('loading');
  const [showTaskManagement, setShowTaskManagement] = useState(false);

  // APIからデータを読み込む
  useEffect(() => {
    const loadData = async () => {
      try {
        setStorageStatus('loading');
        const [eventsData, tasksData] = await Promise.all([
          fetchEvents(),
          fetchTasks()
        ]);
        setEvents(eventsData);
        setTasks(tasksData);
        
        // ストレージの状態を確認
        const isKVWorking = eventsData.length > 0 || tasksData.length > 0;
        setStorageStatus(isKVWorking ? 'kv' : 'local');
      } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
        // エラーが発生した場合は空の配列を設定
        setEvents([]);
        setTasks(['仕事', 'サックス', 'テニス']); // 最低限のタスクを提供
        setStorageStatus('local');
      }
    };

    loadData();
  }, []);

  const startDate = startOfWeek(startOfMonth(currentMonth));
  const endDate = endOfWeek(endOfMonth(currentMonth));

  const days = [];
  let day = startDate;

  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const toggleMember = (memberName: string) => {
    setVisibleMembers(prev =>
      prev.includes(memberName) ? prev.filter(m => m !== memberName) : [...prev, memberName]
    );
  };

  const getEvents = (day: Date) => {
    return events.filter(
      (e) => isSameDay(new Date(e.date), day) && visibleMembers.includes(e.member)
    );
  };

  const handleDateClick = (day: Date) => {
    if (isSameMonth(day, currentMonth)) {
      setSelectedDate(day);
      setEditingEvent(null);
      setIsDialogOpen(true);
    }
  };

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(new Date(event.date));
    setEditingEvent(event);
    setIsDialogOpen(true);
  };

  const handleEventSave = async (eventData: Omit<Event, 'id'>) => {
    try {
      // 新しいタスクの場合、タスクリストに追加
      if (!tasks.includes(eventData.task)) {
        await saveTask(eventData.task);
        setTasks([...tasks, eventData.task]);
      }

      let savedEvent: Event;
      if (editingEvent) {
        // 既存イベントの更新
        savedEvent = await saveEvent({ ...eventData, id: editingEvent.id });
        setEvents(events.map(e => e.id === editingEvent.id ? savedEvent : e));
      } else {
        // 新規イベントの追加
        savedEvent = await saveEvent(eventData);
        setEvents([...events, savedEvent]);
      }

      setIsDialogOpen(false);
      setSelectedDate(null);
      setEditingEvent(null);
    } catch (error) {
      console.error('イベントの保存に失敗しました:', error);
      alert('予定の保存に失敗しました。再度お試しください。');
    }
  };

  const handleEventDelete = async () => {
    if (editingEvent) {
      try {
        const success = await deleteEvent(editingEvent.id);
        if (success) {
          setEvents(events.filter(e => e.id !== editingEvent.id));
          setIsDialogOpen(false);
          setSelectedDate(null);
          setEditingEvent(null);
        } else {
          alert('予定の削除に失敗しました。');
        }
      } catch (error) {
        console.error('イベントの削除に失敗しました:', error);
        alert('予定の削除に失敗しました。再度お試しください。');
      }
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedDate(null);
    setEditingEvent(null);
  };

  const getMemberColor = (memberName: string) => {
    return familyMembers.find(m => m.name === memberName)?.color || "bg-gray-200";
  };

  // データをリセット（データベース操作は行わず、フロントエンドのみリフレッシュ）
  const handleResetData = async () => {
    if (confirm('データを再読み込みしますか？')) {
      try {
        setStorageStatus('loading');
        const [eventsData, tasksData] = await Promise.all([
          fetchEvents(),
          fetchTasks()
        ]);
        setEvents(eventsData);
        setTasks(tasksData);
        setStorageStatus('kv'); // リロード後は通常KVまたはローカルデータが利用可能
      } catch (error) {
        console.error('データの再読み込みに失敗しました:', error);
        alert('データの再読み込みに失敗しました。');
        setStorageStatus('local');
      }
    }
  };

  // タスク管理機能
  const handleAddTask = async (taskName: string) => {
    try {
      await saveTask(taskName);
      const updatedTasks = await fetchTasks();
      setTasks(updatedTasks);
    } catch (error) {
      console.error('タスク追加エラー:', error);
      throw error;
    }
  };

  const handleDeleteTask = async (taskName: string) => {
    try {
      const success = await deleteTask(taskName);
      if (success) {
        // タスクリストから削除
        const updatedTasks = await fetchTasks();
        setTasks(updatedTasks);
        
        // そのタスクを使用しているイベントも削除するか確認
        const eventsUsingTask = events.filter(e => e.task === taskName);
        if (eventsUsingTask.length > 0) {
          const deleteRelatedEvents = confirm(
            `タスク「${taskName}」を使用している${eventsUsingTask.length}件の予定も削除しますか？`
          );
          
          if (deleteRelatedEvents) {
            // 関連するイベントを削除
            const deletePromises = eventsUsingTask.map(e => deleteEvent(e.id));
            await Promise.all(deletePromises);
            
            // 画面からも削除
            const updatedEvents = events.filter(e => e.task !== taskName);
            setEvents(updatedEvents);
          }
        }
      } else {
        throw new Error('タスクの削除に失敗しました');
      }
    } catch (error) {
      console.error('タスク削除エラー:', error);
      throw error;
    }
  };

  // データをエクスポート
  const handleExportData = () => {
    const data = {
      events,
      tasks,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `family-calendar-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // タスク管理画面を表示
  if (showTaskManagement) {
    return (
      <TaskManagement
        tasks={tasks}
        onAddTask={handleAddTask}
        onDeleteTask={handleDeleteTask}
        onClose={() => setShowTaskManagement(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        <div className="p-4 pb-2 bg-white sticky top-0 z-10 border-b">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">家族カレンダー</h1>
              <div className="text-xs text-gray-500 mt-1">
                {storageStatus === 'loading' && '⏳ 読み込み中...'}
                {storageStatus === 'kv' && '☁️ クラウド同期'}
                {storageStatus === 'local' && '📱 ローカル保存（KV未設定）'}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setShowTaskManagement(true)}
                className="text-xs"
              >
                📝 タスク
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={handleResetData}
                className="text-xs"
              >
                🔄 リロード
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={handleExportData}
                className="text-xs"
              >
                📥 エクスポート
              </Button>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="px-3"
            >
              ←
            </Button>
            <h2 className="text-lg font-bold text-gray-700">{format(currentMonth, "yyyy年M月")}</h2>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="px-3"
            >
              →
            </Button>
          </div>

          <div className="grid grid-cols-5 gap-1 mb-3">
            {familyMembers.map((member) => (
              <label key={member.name} className="flex flex-col items-center gap-1">
                <Checkbox
                  checked={visibleMembers.includes(member.name)}
                  onCheckedChange={() => toggleMember(member.name)}
                  className="w-4 h-4"
                />
                <span className={`px-1 py-0.5 rounded text-xs ${member.color}`}>
                  {member.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="p-2">
          <div className="grid grid-cols-7 gap-1">
            {["日", "月", "火", "水", "木", "金", "土"].map((day, idx) => (
              <div key={day} className={`text-center font-bold p-2 text-xs ${
                idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-gray-600'
              }`}>
                {day}
              </div>
            ))}
            
            {days.map((day, idx) => (
              <Card 
                key={idx} 
                className={`min-h-[80px] cursor-pointer hover:bg-gray-50 border transition-colors ${
                  !isSameMonth(day, currentMonth) ? "opacity-30" : ""
                }`}
                onClick={() => handleDateClick(day)}
              >
                <CardContent className="p-1">
                  <div className={`text-sm font-bold mb-1 ${
                    isSameDay(day, new Date()) ? 'text-blue-600 bg-blue-100 rounded px-1' : 
                    idx % 7 === 0 ? 'text-red-500' : 
                    idx % 7 === 6 ? 'text-blue-500' : 'text-gray-700'
                  }`}>
                    {format(day, "d")}
                  </div>
                  <div className="space-y-0.5">
                    {getEvents(day).slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs p-0.5 rounded cursor-pointer hover:opacity-80 leading-tight ${getMemberColor(event.member)}`}
                        onClick={(e) => handleEventClick(event, e)}
                      >
                        <div className="font-medium">{event.time}</div>
                        <div className="truncate">{event.task}</div>
                      </div>
                    ))}
                    {getEvents(day).length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{getEvents(day).length - 2}件
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] w-full mx-2 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {editingEvent ? "予定を編集" : "予定を追加"}
            </DialogTitle>
          </DialogHeader>
          {selectedDate && (
            <>
              <EventForm
                selectedDate={selectedDate}
                event={editingEvent}
                onSave={handleEventSave}
                onCancel={handleDialogClose}
                familyMembers={familyMembers.map(m => m.name)}
                tasks={tasks}
              />
              {editingEvent && (
                <div className="flex justify-start pt-2 border-t">
                  <Button
                    variant="destructive"
                    onClick={handleEventDelete}
                    size="sm"
                  >
                    削除
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}