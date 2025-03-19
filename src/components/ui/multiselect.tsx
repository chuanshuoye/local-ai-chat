import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from './badge';
import { Button } from './button';

// 替换 lucide-react 图标为内联 SVG 组件
const CheckIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="h-4 w-4 text-blue-600"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const ChevronDownIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="h-4 w-4 opacity-50"
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const XIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

interface MultiSelectProps {
  options: Array<{ label: string; value: string }>;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder = '请选择...',
  disabled = false,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 处理选项点击
  const handleOptionClick = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  // 移除已选项
  const removeItem = (e: React.MouseEvent, itemValue: string) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== itemValue));
  };

  // 清空所有选择
  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  // 获取选中项的标签
  const getSelectedLabels = () => {
    return value.map(v => {
      const option = options.find(o => o.value === v);
      return option ? option.label : v;
    });
  };

  return (
    <div className={cn("relative", className)} ref={ref}>
      <div
        className={cn(
          "flex min-h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus:ring-gray-300",
          open && "border-blue-500",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-wrap gap-1 items-center">
          {value.length > 0 ? (
            getSelectedLabels().map((label, i) => (
              <Badge key={i} variant="secondary" className="mr-1 mb-1">
                {label}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-4 w-4 p-0 rounded-full"
                  onClick={(e) => removeItem(e, value[i])}
                >
                  <XIcon />
                  <span className="sr-only">删除</span>
                </Button>
              </Badge>
            ))
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {value.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-gray-400 hover:text-gray-600"
              onClick={clearAll}
            >
              <XIcon />
              <span className="sr-only">清空</span>
            </Button>
          )}
          <ChevronDownIcon />
        </div>
      </div>

      {open && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-950">
          <div className="max-h-60 overflow-auto p-1">
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-gray-100 dark:hover:bg-gray-800",
                  value.includes(option.value) && "bg-gray-100 dark:bg-gray-800"
                )}
                onClick={() => handleOptionClick(option.value)}
              >
                <span className="flex-1">{option.label}</span>
                {value.includes(option.value) && (
                  <CheckIcon />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 