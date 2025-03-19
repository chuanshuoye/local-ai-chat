import React from 'react';
import { useNodeStore } from '@/store/node-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multiselect';

export function NodeDrawer() {
  const { 
    isDrawerOpen, 
    selectedNodeData, 
    formConfig, 
    formData,
    closeDrawer, 
    updateFormData,
    applyChanges
  } = useNodeStore();

  // 处理字段变更
  const handleFieldChange = (fieldId: string, value: any) => {
    updateFormData(fieldId, value);
  };

  // 渲染表单字段
  const renderField = (field: any) => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
          />
        );
      
      case 'select':
        return (
          <Select
            value={formData[field.id] || ''}
            onValueChange={(value) => handleFieldChange(field.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'multiselect':
        return (
          <MultiSelect
            options={field.options || []}
            value={formData[field.id] || []}
            onChange={(value) => handleFieldChange(field.id, value)}
            placeholder={field.placeholder}
          />
        );
      
      case 'checkbox':
        return (
          <Checkbox
            id={field.id}
            checked={!!formData[field.id]}
            onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
          />
        );
      
      case 'number':
        return (
          <Input
            id={field.id}
            type="number"
            value={formData[field.id] || field.defaultValue || ''}
            onChange={(e) => handleFieldChange(field.id, Number(e.target.value))}
            min={field.min}
            max={field.max}
            step={field.step}
            required={field.required}
          />
        );
      
      default:
        return null;
    }
  };

  if (!isDrawerOpen || !formConfig) {
    return null;
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-xl border-l border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-800">{formConfig.title}</h3>
          {formConfig.description && (
            <p className="mt-1 text-sm text-gray-500">
              {formConfig.description}
            </p>
          )}
        </div>
        <button 
          onClick={closeDrawer}
          className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <form className="space-y-4">
          {formConfig.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(field)}
              {field.helpText && (
                <p className="text-xs text-gray-500">{field.helpText}</p>
              )}
            </div>
          ))}
        </form>
      </div>

      <div className="p-4 border-t border-gray-200 flex justify-end space-x-2 bg-gray-50">
        <Button 
          variant="outline" 
          size="sm"
          onClick={closeDrawer}
          className="border-gray-300"
        >
          取消
        </Button>
        <Button 
          size="sm"
          onClick={applyChanges}
          className="bg-blue-600 hover:bg-blue-700"
        >
          应用
        </Button>
      </div>
    </div>
  );
} 