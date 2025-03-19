'use client';

import { useEffect, useState } from 'react';
import { useMCPStore } from '@/store/mcp-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';

// MCP服务管理页面
export default function MCPManagePage() {
  const { services, fetchServices, selectService, removeService } = useMCPStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      await fetchServices();
      setIsLoading(false);
    };

    loadServices();
  }, [fetchServices]);

  // 将服务分为系统服务和自定义服务
  const systemServices = services.filter(service => service.isSystem);
  const customServices = services.filter(service => !service.isSystem);

  return (
    <MainLayout>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">MCP服务管理</h1>
            <p className="text-gray-500 mt-2">管理您的MCP服务配置</p>
          </div>
          <Button onClick={() => window.location.href = '/mcp/create'}>
            添加新服务
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 系统服务列表 */}
            <div>
              <h2 className="text-xl font-semibold mb-4">系统服务</h2>
              <div className="space-y-4">
                {systemServices.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onSelect={() => selectService(service.id)}
                    onEdit={() => window.location.href = `/mcp/edit/${service.id}`}
                    onDelete={() => { }} // 系统服务不能删除
                    isSystem
                  />
                ))}
              </div>
            </div>

            {/* 自定义服务列表 */}
            <div>
              <h2 className="text-xl font-semibold mb-4">自定义服务</h2>
              <div className="space-y-4">
                {customServices.length > 0 ? (
                  customServices.map(service => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onSelect={() => selectService(service.id)}
                      onEdit={() => window.location.href = `/mcp/edit/${service.id}`}
                      onDelete={() => {
                        if (confirm(`确定要删除服务"${service.name}"吗？`)) {
                          removeService(service.id);
                        }
                      }}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">暂无自定义服务</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => window.location.href = '/mcp/create'}
                    >
                      创建服务
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </MainLayout>
  );
}

// 服务卡片组件
interface ServiceCardProps {
  service: any;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isSystem?: boolean;
}

function ServiceCard({ service, onSelect, onEdit, onDelete, isSystem = false }: ServiceCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          {service.icon && <span className="mr-2">{service.icon}</span>}
          {service.name}
        </CardTitle>
        <CardDescription>
          {service.description || '无描述'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500">
          <div className="mb-1">
            <span className="font-medium">端点：</span>
            {service.endpoint || '未设置'}
          </div>
          <div>
            <span className="font-medium">更新时间：</span>
            {new Date(service.updatedAt).toLocaleString()}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="default" size="sm" onClick={onSelect}>
          选择
        </Button>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            编辑
          </Button>
          {!isSystem && (
            <Button variant="destructive" size="sm" onClick={onDelete}>
              删除
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
} 