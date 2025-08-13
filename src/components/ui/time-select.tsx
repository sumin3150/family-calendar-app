"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function TimeSelect({ value, onValueChange, className }: TimeSelectProps) {
  // 30分間隔で時刻オプションを生成
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push({
          value: timeString,
          label: displayString
        });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="時刻を選択" />
      </SelectTrigger>
      <SelectContent className="max-h-[200px]">
        {timeOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}