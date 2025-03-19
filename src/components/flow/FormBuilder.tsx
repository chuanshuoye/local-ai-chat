import React from 'react';
import { FormConfig, FormField } from '@/store/node-store';

interface FormBuilderProps {
  config: FormConfig;
  data: Record<string, any>;
  onChange: (fieldId: string, value: any) => void;
}

export function FormBuilder({ config, data, onChange }: FormBuilderProps) {
  const renderField = (field: FormField) => {
    const value = data[field.id] !== undefined ? data[field.id] : field.defaultValue;
    
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            id={field.id}
            value={value || ''}
            placeholder={field.placeholder}
            onChange={(e) => onChange(field.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required={field.required}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={value || ''}
            placeholder={field.placeholder}
            onChange={(e) => onChange(field.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            required={field.required}
          />
        );
      
      case 'select':
        return (
          <select
            id={field.id}
            value={value || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required={field.required}
          >
            <option value="">请选择</option>
            {field.options?.map((option: { label: string; value: string }) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <input
            type="checkbox"
            id={field.id}
            checked={!!value}
            onChange={(e) => onChange(field.id, e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            id={field.id}
            value={value !== undefined ? value : ''}
            onChange={(e) => onChange(field.id, parseFloat(e.target.value))}
            min={field.min}
            max={field.max}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required={field.required}
          />
        );
      
      case 'color':
        return (
          <input
            type="color"
            id={field.id}
            value={value || '#000000'}
            onChange={(e) => onChange(field.id, e.target.value)}
            className="w-12 h-8 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-4">
      {config.fields.map((field: FormField) => (
        <div key={field.id} className="space-y-2">
          <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
            {field.label}
            {field.required && <span className="ml-1 text-red-500">*</span>}
          </label>
          
          {renderField(field)}
          
          {field.helpText && (
            <p className="mt-1 text-xs text-gray-500">{field.helpText}</p>
          )}
        </div>
      ))}
    </div>
  );
} 