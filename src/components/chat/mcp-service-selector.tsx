'use client';

import { useState, useEffect } from 'react';
import { Combobox } from '@/components/ui/combobox';
import { useMCPStore } from '@/store/mcp-store';

interface MCPServiceSelectorProps {
  selectedMCPId: string;
  onSelect: (mcpId: string) => void;
  disabled?: boolean;
  className?: string;
}

export function MCPServiceSelector({ 
  selectedMCPId, 
  onSelect, 
  disabled = false,
  className 
}: MCPServiceSelectorProps) {
  const { services, selectedServiceId, selectService } = useMCPStore();
  
  // 如果没有传入选定ID，则使用store中的选定ID
  const [value, setValue] = useState(selectedMCPId || selectedServiceId);
  
  // 当store中的选定ID变化时，更新本地状态
  useEffect(() => {
    if (!selectedMCPId && selectedServiceId !== value) {
      setValue(selectedServiceId);
    }
  }, [selectedServiceId, selectedMCPId, value]);

  // 将MCP服务转换为下拉框选项
  const mcpOptions = services.map(service => ({
    value: service.id,
    label: service.name,
    icon: service.icon
  }));

  const handleSelect = (mcpId: string) => {
    // 确保mcpId有效
    if (!mcpId) return;
    
    console.log('选择了MCP服务:', mcpId); // 添加日志便于调试
    
    setValue(mcpId);
    // 确保先调用外部的onSelect
    onSelect(mcpId);
    // 然后更新store
    selectService(mcpId);
  };
  
  return (
    <div className={className}>
      <Combobox
        items={mcpOptions}
        value={value}
        onChange={handleSelect}
        placeholder="选择MCP服务..."
        emptyText="未找到MCP服务"
        disabled={disabled}
        triggerClassName="w-full h-10"
      />
    </div>
  );
} 