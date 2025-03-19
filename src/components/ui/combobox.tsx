"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxItem {
  value: string
  label: string
  icon?: string
}

interface ComboboxProps {
  items: ComboboxItem[]
  value: string
  placeholder?: string
  emptyText?: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  triggerClassName?: string
}

export function Combobox({
  items,
  value,
  placeholder = "选择选项...",
  emptyText = "未找到结果",
  onChange,
  disabled = false,
  className,
  triggerClassName,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  
  const selectedItem = React.useMemo(() => {
    return items.find((item) => item.value === value)
  }, [items, value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", triggerClassName)}
          disabled={disabled}
        >
          {selectedItem ? (
            <span className="flex items-center">
              {selectedItem.icon && (
                <span className="mr-2">{selectedItem.icon}</span>
              )}
              {selectedItem.label}
            </span>
          ) : (
            placeholder
          )}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="ml-2 h-4 w-4 shrink-0 opacity-50"
          >
            <path d="m7 15 5 5 5-5"/>
            <path d="m7 9 5-5 5 5"/>
          </svg>
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0", className)}>
        <Command>
          <CommandInput placeholder="搜索..." />
          <CommandEmpty>{emptyText}</CommandEmpty>
          <CommandList>
            {items.map((item) => (
              <CommandItem
                key={item.value}
                value={item.value}
                onSelect={(currentValue) => {
                  console.log("CommandItem onSelect 被触发:", currentValue);
                  onChange(currentValue);
                  setOpen(false);
                }}
              >
                <span className="flex items-center">
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === item.value ? "opacity-100" : "opacity-0"
                  )}
                >
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 