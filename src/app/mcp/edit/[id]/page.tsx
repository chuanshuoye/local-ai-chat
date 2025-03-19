'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMCPStore } from '@/store/mcp-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function EditMCPPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getService, updateService } = useMCPStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    endpoint: '',
    apiKey: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const service = getService(params.id);
    if (!service) {
      alert('服务不存在');
      router.push('/mcp');
      return;
    }
    
    if (service.isSystem) {
      alert('系统服务不能编辑');
      router.push('/mcp');
      return;
    }
    
    setFormData({
      name: service.name,
      description: service.description || '',
      endpoint: service.endpoint || '',
      apiKey: service.apiKey || '',
    });
  }, [params.id, getService, router]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      updateService(params.id, formData);
      alert('服务更新成功');
      router.push('/mcp');
    } catch (error) {
      alert('更新服务失败');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">编辑MCP服务</h1>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>编辑服务信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">服务名称</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
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
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.push('/mcp')}
            >
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '保存中...' : '保存更改'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 