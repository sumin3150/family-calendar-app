"use client";

import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EventForm from "@/components/EventForm";

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
  { name: "あい", color: "bg-pink-200" },
  { name: "ゆうか", color: "bg-green-200" },
  { name: "しょうま", color: "bg-yellow-200" },
  { name: "しゅんすけ", color: "bg-purple-200" }
];

const sampleEvents: Event[] = [
  { id: "1", date: "2025-08-05", time: "09:00", task: "仕事", member: "けんじ" },
  { id: "2", date: "2025-08-06", time: "18:00", task: "サックス", member: "あい" },
  { id: "3", date: "2025-08-09", time: "08:00", task: "テニス", member: "けんじ" }
];

export default function CalendarApp() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 7));
  const [visibleMembers, setVisibleMembers] = useState(familyMembers.map(m => m.name));
  const [events, setEvents] = useState<Event[]>(sampleEvents);
  const [tasks, setTasks] = useState<string[]>(initialTasks);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleEventSave = (eventData: Omit<Event, 'id'>) => {
    // 新しいタスクの場合、タスクリストに追加
    if (!tasks.includes(eventData.task)) {
      setTasks([...tasks, eventData.task]);
    }

    if (editingEvent) {
      setEvents(events.map(e => e.id === editingEvent.id ? { ...eventData, id: editingEvent.id } : e));
    } else {
      const newEvent: Event = {
        ...eventData,
        id: Date.now().toString()
      };
      setEvents([...events, newEvent]);
    }
    setIsDialogOpen(false);
    setSelectedDate(null);
    setEditingEvent(null);
  };

  const handleEventDelete = () => {
    if (editingEvent) {
      setEvents(events.filter(e => e.id !== editingEvent.id));
      setIsDialogOpen(false);
      setSelectedDate(null);
      setEditingEvent(null);
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

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">家族カレンダー</h1>
      
      <div className="flex justify-between items-center mb-4">
        <Button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>←</Button>
        <h2 className="text-xl font-bold">{format(currentMonth, "yyyy年M月")}</h2>
        <Button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>→</Button>
      </div>

      <div className="flex gap-4 mb-4">
        {familyMembers.map((member) => (
          <label key={member.name} className="flex items-center gap-2">
            <Checkbox
              checked={visibleMembers.includes(member.name)}
              onCheckedChange={() => toggleMember(member.name)}
            />
            <span className={`px-2 py-1 rounded ${member.color}`}>
              {member.name}
            </span>
          </label>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
          <div key={day} className="text-center font-bold p-2">
            {day}
          </div>
        ))}
        
        {days.map((day, idx) => (
          <Card 
            key={idx} 
            className={`min-h-[100px] p-2 cursor-pointer hover:bg-gray-50 ${!isSameMonth(day, currentMonth) ? "opacity-30" : ""}`}
            onClick={() => handleDateClick(day)}
          >
            <CardContent className="p-2">
              <div className="text-sm font-bold">{format(day, "d")}</div>
              {getEvents(day).map((event) => (
                <div
                  key={event.id}
                  className={`text-xs mt-1 p-1 rounded cursor-pointer hover:opacity-80 ${getMemberColor(event.member)}`}
                  onClick={(e) => handleEventClick(event, e)}
                >
                  {event.time} {event.task}（{event.member}）
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
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