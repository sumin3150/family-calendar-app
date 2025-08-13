"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";

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

  const [date, setDate] = useState(getInitialDate());
  const [time, setTime] = useState(event?.time || "");
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">日付</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="time">時刻</Label>
        <Input
          id="time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task">タスク</Label>
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
        <Label htmlFor="member">担当者</Label>
        <Select value={member} onValueChange={setMember} required>
          <SelectTrigger>
            <SelectValue placeholder="担当者を選択" />
          </SelectTrigger>
          <SelectContent>
            {familyMembers.map((memberName) => (
              <SelectItem key={memberName} value={memberName}>
                {memberName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit">
          {event ? "更新" : "追加"}
        </Button>
      </div>
    </form>
  );
}