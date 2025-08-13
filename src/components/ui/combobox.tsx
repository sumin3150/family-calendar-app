"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxProps {
  value?: string
  onValueChange: (value: string) => void
  options: string[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  allowCustom?: boolean
}

export function Combobox({
  value,
  onValueChange,
  options,
  placeholder = "選択してください",
  searchPlaceholder = "検索...",
  emptyMessage = "見つかりません",
  allowCustom = true,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleSelect = (selectedValue: string) => {
    const newValue = selectedValue === value ? "" : selectedValue
    onValueChange(newValue)
    setOpen(false)
    setInputValue("")
  }

  const handleInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && allowCustom && inputValue.trim()) {
      event.preventDefault()
      onValueChange(inputValue.trim())
      setOpen(false)
      setInputValue("")
    }
  }

  const displayValue = value || placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {displayValue}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={handleInputKeyDown}
          />
          <CommandEmpty>
            {allowCustom && inputValue.trim() ? (
              <div
                className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
                onClick={() => {
                  onValueChange(inputValue.trim())
                  setOpen(false)
                  setInputValue("")
                }}
              >
                "{inputValue}" を追加
              </div>
            ) : (
              emptyMessage
            )}
          </CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option}
                value={option}
                onSelect={() => handleSelect(option)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option ? "opacity-100" : "opacity-0"
                  )}
                />
                {option}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}