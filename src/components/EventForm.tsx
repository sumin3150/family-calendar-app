"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { TimeSelect } from "@/components/ui/time-select";

interface Event {
  id: string;
  date: string;
  time: string;
  task: string;
  member: string;
}

interface EventFormProps {
  selectedDate: Date;
  event?: Event | null;
  onSave: (event: Omit<Event, 'id'>) => void;
  onCancel: () => void;
  familyMembers: string[];
  tasks: string[];
}

export default function EventForm({ 
  selectedDate, 
  event, 
  onSave, 
  onCancel, 
  familyMembers, 
  tasks 
}: EventFormProps) {
  // 初期日付を設定（既存イベントの場合はその日付、新規の場合は選択された日付）
  const getInitialDate = () => {
    if (event?.date) {
      return event.date;
    }
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 時刻を30分単位に調整する関数
  const roundToNearestHalfHour = (timeString: string) => {
    if (!timeString) return "09:00"; // デフォルト時刻
    const [hours, minutes] = timeString.split(':').map(Number);
    const roundedMinutes = Math.round(minutes / 30) * 30;
    const adjustedHours = roundedMinutes >= 60 ? hours + 1 : hours;
    const finalMinutes = roundedMinutes >= 60 ? 0 : roundedMinutes;
    return `${adjustedHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
  };

  const [date, setDate] = useState(getInitialDate());
  const [time, setTime] = useState(event?.time ? roundToNearestHalfHour(event.time) : "09:00");
  const [task, setTask] = useState(event?.task || "");
  const [member, setMember] = useState(event?.member || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time || !task || !member) {
      alert("すべての項目を入力してください");
      return;
    }

    onSave({
      date,
      time,
      task,
      member
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="date" className="text-sm font-medium">日付</Label>
          {event ? (
            // 編集時は日付変更可能
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="text-sm"
            />
          ) : (
            // 新規追加時は日付表示のみ（カレンダーピッカーを開かない）
            <div className="flex items-center h-10 px-3 py-2 border rounded-md bg-gray-50 text-sm">
              {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="time" className="text-sm font-medium">時刻</Label>
          <TimeSelect
            value={time}
            onValueChange={setTime}
            className="text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="task" className="text-sm font-medium">タスク</Label>
        <Combobox
          value={task}
          onValueChange={setTask}
          options={tasks}
          placeholder="タスクを選択または入力"
          searchPlaceholder="タスクを検索または入力..."
          emptyMessage="タスクが見つかりません"
          allowCustom={true}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="member" className="text-sm font-medium">担当者</Label>
        <Select value={member} onValueChange={setMember} required>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="担当者を選択" />
          </SelectTrigger>
          <SelectContent>
            {familyMembers.map((memberName) => (
              <SelectItem key={memberName} value={memberName} className="text-sm">
                {memberName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2 pt-3 border-t">
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1 text-sm">
            キャンセル
          </Button>
          <Button type="submit" className="flex-1 text-sm">
            {event ? "更新" : "追加"}
          </Button>
        </div>
      </div>
    </form>
  );
}