'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMCPStore } from '@/store/mcp-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateMCPPage() {
  const navigate = useNavigate();
  const { addService } = useMCPStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    endpoint: '',
    apiKey: '',
    icon: '🔌', // 默认图标
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      addService(formData);
      alert('服务创建成功');
      navigate('/mcp');
    } catch (error) {
      alert('创建服务失败');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">创建新MCP服务</h1>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>添加新服务</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">服务名称</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="例如：Custom OpenAI"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">服务描述</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="服务的简短描述"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endpoint">服务端点</Label>
              <Input
                id="endpoint"
                name="endpoint"
                value={formData.endpoint}
                onChange={handleChange}
                placeholder="例如：https://api.example.com/v1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiKey">API密钥</Label>
              <Input
                id="apiKey"
                name="apiKey"
                type="password"
                value={formData.apiKey}
                onChange={handleChange}
                placeholder="API密钥"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="icon">图标（可使用Emoji）</Label>
              <Input
                id="icon"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                placeholder="例如：🤖"
                maxLength={2}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate('/mcp')}
            >
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '创建中...' : '创建服务'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 