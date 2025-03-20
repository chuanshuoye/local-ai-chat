'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Agent, useAgentStore } from '@/store/agent-store';

const AGENT_TYPES = [
  { value: 'text', label: '文本处理' },
  { value: 'code', label: '代码生成' },
  { value: 'data', label: '数据分析' },
  { value: 'chat', label: '对话聊天' },
  { value: 'custom', label: '自定义' },
];

// 为新创建的agent生成默认图标
const DEFAULT_ICONS = ['🤖', '🧠', '🔍', '💻', '📊', '🗣️', '📝'];

export default function AgentEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { agents, fetchAgents, updateAgent, addAgent, isLoading, error } = useAgentStore();
  
  const [formData, setFormData] = useState<Omit<Agent, 'id' | 'createdAt'>>({
    name: '',
    type: 'text',
    description: '',
    icon: DEFAULT_ICONS[0],
    prompt: '',
  });
  
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    description?: string;
    prompt?: string;
  }>({});
  
  const isNewAgent = id === 'new';
  
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);
  
  useEffect(() => {
    if (!isNewAgent && agents.length > 0) {
      const agent = agents.find(a => a.id === id);
      if (agent) {
        setFormData({
          name: agent.name,
          type: agent.type,
          description: agent.description,
          icon: agent.icon,
          prompt: agent.prompt,
          updatedAt: agent.updatedAt,
          workflowId: agent.workflowId,
        });
      } else {
        // Agent不存在，导航回列表页
        navigate('/agents');
      }
    }
  }, [id, agents, isNewAgent, navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 清除对应字段的错误
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleIconChange = (icon: string) => {
    setFormData(prev => ({ ...prev, icon }));
  };
  
  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};
    
    if (!formData.name.trim()) {
      errors.name = '请输入Agent名称';
    }
    
    if (!formData.description.trim()) {
      errors.description = '请输入Agent描述';
    }
    
    if (!formData.prompt.trim()) {
      errors.prompt = '请输入Agent提示词';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (isNewAgent) {
        await addAgent(formData);
        navigate('/agents');
      } else {
        await updateAgent(id!, formData);
        navigate('/agents');
      }
    } catch (err) {
      console.error('保存Agent失败:', err);
    }
  };
  
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto pb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{isNewAgent ? '创建新Agent' : '编辑Agent'}</h2>
          <Button variant="outline" onClick={() => navigate('/agents')}>
            返回列表
          </Button>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>
                设置Agent的基本信息和类型
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <div className="space-y-2">
                    <Label htmlFor="name">名称</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="输入Agent名称"
                      className={formErrors.name ? 'border-red-500' : ''}
                    />
                    {formErrors.name && (
                      <p className="text-sm text-red-500">{formErrors.name}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="space-y-2">
                    <Label>图标</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {DEFAULT_ICONS.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          className={`
                            h-10 w-10 flex items-center justify-center text-xl rounded-md 
                            ${formData.icon === icon 
                              ? 'bg-primary-100 border-2 border-primary-500' 
                              : 'bg-gray-100 hover:bg-gray-200'
                            }
                          `}
                          onClick={() => handleIconChange(icon)}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">类型</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择Agent类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {AGENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="输入Agent描述"
                  className={`min-h-[80px] ${formErrors.description ? 'border-red-500' : ''}`}
                />
                {formErrors.description && (
                  <p className="text-sm text-red-500">{formErrors.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>提示词配置</CardTitle>
              <CardDescription>
                编写Agent的提示词，指导AI生成特定风格和内容的回复
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="prompt">提示词</Label>
                <Textarea
                  id="prompt"
                  name="prompt"
                  value={formData.prompt}
                  onChange={handleInputChange}
                  placeholder="输入Agent提示词"
                  className={`min-h-[200px] ${formErrors.prompt ? 'border-red-500' : ''}`}
                />
                {formErrors.prompt && (
                  <p className="text-sm text-red-500">{formErrors.prompt}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-6 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/agents')}
              >
                取消
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? '保存中...' : '保存Agent'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
} 