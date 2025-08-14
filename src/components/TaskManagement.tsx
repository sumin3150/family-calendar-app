"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TaskManagementProps {
  tasks: string[];
  onAddTask: (taskName: string) => Promise<void>;
  onDeleteTask: (taskName: string) => Promise<void>;
  onClose: () => void;
}

export default function TaskManagement({ 
  tasks, 
  onAddTask, 
  onDeleteTask, 
  onClose 
}: TaskManagementProps) {
  const [newTaskName, setNewTaskName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTaskName.trim()) {
      alert("タスク名を入力してください");
      return;
    }

    if (tasks.includes(newTaskName.trim())) {
      alert("このタスクは既に存在します");
      return;
    }

    setIsAdding(true);
    try {
      await onAddTask(newTaskName.trim());
      setNewTaskName("");
    } catch (error) {
      console.error("タスク追加エラー:", error);
      alert("タスクの追加に失敗しました");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteTask = async (taskName: string) => {
    if (confirm(`タスク「${taskName}」を削除しますか？`)) {
      try {
        await onDeleteTask(taskName);
      } catch (error) {
        console.error("タスク削除エラー:", error);
        alert("タスクの削除に失敗しました");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        <div className="p-4 pb-2 bg-white sticky top-0 z-10 border-b">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">タスク管理</h1>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={onClose}
              className="text-xs"
            >
              ← 戻る
            </Button>
          </div>
        </div>

        <div className="p-2">
          {/* 新しいタスクの追加 */}
          <div className="mb-4 p-4 bg-white border rounded-lg">
            <div className="mb-3">
              <h2 className="text-lg font-bold text-gray-700">新しいタスクを追加</h2>
            </div>
            <form onSubmit={handleAddTask} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="taskName" className="text-sm font-medium">
                  タスク名
                </Label>
                <Input
                  id="taskName"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="タスク名を入力"
                  disabled={isAdding}
                  className="text-sm"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full text-sm" 
                disabled={isAdding}
              >
                {isAdding ? "追加中..." : "タスクを追加"}
              </Button>
            </form>
          </div>

          {/* 既存のタスク一覧 */}
          <div className="p-4 bg-white border rounded-lg">
            <div className="mb-3">
              <h2 className="text-lg font-bold text-gray-700">
                タスク一覧 ({tasks.length}個)
              </h2>
            </div>
            {tasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">
                タスクがありません
              </p>
            ) : (
              <div className="space-y-2">
                {tasks.map((task, index) => (
                  <div 
                    key={task}
                    className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <span className="flex-1 text-sm font-medium">
                      {task}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTask(task)}
                      className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 h-8 px-2"
                    >
                      🗑️
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}