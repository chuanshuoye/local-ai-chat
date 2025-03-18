import React, { useRef, useCallback, useState } from 'react';
import ReactFlow, { 
  MiniMap,
  Controls,
  Background,
  ReactFlowProvider,
  useReactFlow,
  Node
} from 'react-flow-renderer';
import { useFlowStore, nodeTemplates } from '@/store/flow-store';
import { useNodeStore } from '@/store/node-store';
import { useAgentStore } from '@/store/agent-store';
import { FlowNode } from './FlowNode';
import { NodeToolbar } from './NodeToolbar';
import { NodeDrawer } from './NodeDrawer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const nodeTypes = {
  custom: FlowNode,
};

interface DragAndDropWrapperProps {
  children: React.ReactNode;
}

function DragAndDropWrapper({ children }: DragAndDropWrapperProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  const { addNode } = useFlowStore();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const templateId = event.dataTransfer.getData('application/reactflow');
      
      // 检查是否是有效的拖放
      if (!reactFlowBounds || !templateId || !reactFlowInstance) {
        return;
      }

      const template = nodeTemplates.find(t => t.id === templateId);
      if (!template) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      addNode(template, position);
    },
    [addNode, reactFlowInstance]
  );

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="flex h-full gap-4">
      <div className="h-full w-64 flex-shrink-0">
        <NodeToolbar onDragStart={onDragStart} />
      </div>
      <div 
        className="flex-1 rounded-lg border border-gray-200 bg-slate-50 shadow-inner" 
        ref={reactFlowWrapper}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {children}
      </div>
    </div>
  );
}

export function WorkflowEditor() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    resetFlow,
    setEdges,
  } = useFlowStore();
  
  const { openDrawer } = useNodeStore();
  const { agents, saveAgentWorkflow, loadAgentWorkflow, isLoading } = useAgentStore();
  
  // 保存工作流对话框状态
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  
  // 加载工作流对话框状态
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  
  // 处理节点点击，打开抽屉
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    event.stopPropagation();
    
    // 获取完整的节点数据
    const nodeData = node.data;
    openDrawer(node.id, nodeData);
  }, [openDrawer]);
  
  // 处理保存工作流
  const handleSaveWorkflow = async () => {
    if (!selectedAgentId) {
      alert('请选择一个Agent');
      return;
    }
    
    if (!workflowName) {
      alert('请输入工作流名称');
      return;
    }
    
    try {
      await saveAgentWorkflow(selectedAgentId, workflowName, workflowDescription);
      setSaveDialogOpen(false);
      alert('工作流保存成功');
    } catch (error) {
      alert(`保存失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };
  
  // 处理加载工作流
  const handleLoadWorkflow = (agentId: string) => {
    try {
      loadAgentWorkflow(agentId);
      setLoadDialogOpen(false);
      alert('工作流加载成功');
    } catch (error) {
      alert(`加载失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  return (
    <div className="h-[700px] rounded-lg overflow-hidden border border-gray-200 shadow-lg bg-white relative">
      <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 z-10 flex justify-between items-center">
        <h3 className="font-medium text-lg">工作流编辑器</h3>
        <div className="flex space-x-2">
          <Button 
            size="sm"
            variant="outline"
            onClick={resetFlow}
            className="text-gray-600 border-gray-300 hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            重置
          </Button>
          <Button 
            size="sm"
            variant="outline"
            onClick={() => setLoadDialogOpen(true)}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            加载
          </Button>
          <Button 
            size="sm"
            onClick={() => setSaveDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            保存
          </Button>
        </div>
      </div>
      
      <div className="pt-14 h-full">
        <ReactFlowProvider>
          <DragAndDropWrapper>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={handleNodeClick}
              nodeTypes={nodeTypes}
              fitView
              className="bg-slate-50"
              onEdgeClick={(_, edge) => {
                if (window.confirm('确定要删除这条连接线吗？')) {
                  setEdges(edges.filter(e => e.id !== edge.id));
                }
              }}
            >
              <Controls className="bg-white border border-gray-200 shadow-sm rounded-md" />
              <MiniMap 
                className="bg-white border border-gray-200 shadow-sm rounded-md" 
                nodeStrokeColor="#ddd"
                nodeColor="#f8fafc"
                nodeBorderRadius={4}
              />
              <Background 
                color="#94a3b8" 
                size={1.5} 
                gap={16} 
              />
            </ReactFlow>
          </DragAndDropWrapper>
          <NodeDrawer />
          
          {/* 保存工作流对话框 */}
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  保存工作流
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="agent" className="text-sm font-medium">选择Agent</Label>
                  <Select
                    value={selectedAgentId}
                    onValueChange={setSelectedAgentId}
                  >
                    <SelectTrigger className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="选择一个Agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map(agent => (
                        <SelectItem key={agent.id} value={agent.id} className="flex items-center">
                          <span className="mr-2">{agent.icon}</span>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">工作流名称</Label>
                  <Input
                    id="name"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    placeholder="输入工作流名称"
                    className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">工作流描述 (可选)</Label>
                  <Textarea
                    id="description"
                    value={workflowDescription}
                    onChange={(e) => setWorkflowDescription(e.target.value)}
                    placeholder="描述这个工作流的用途"
                    rows={3}
                    className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSaveDialogOpen(false)} className="border-gray-300">
                  取消
                </Button>
                <Button onClick={handleSaveWorkflow} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      保存中...
                    </>
                  ) : '保存'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* 加载工作流对话框 */}
          <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  加载工作流
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {agents.filter(a => a.workflow).length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      </svg>
                      <p>没有可用的工作流</p>
                      <p className="text-sm mt-1">保存一个工作流后会显示在这里</p>
                    </div>
                  ) : (
                    agents.filter(a => a.workflow).map(agent => (
                      <div 
                        key={agent.id} 
                        className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors"
                        onClick={() => handleLoadWorkflow(agent.id)}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl text-blue-600 mr-3 flex-shrink-0">
                            {agent.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-blue-600 truncate">{agent.workflow?.name}</h3>
                            <p className="text-sm text-gray-500 truncate">{agent.name}</p>
                            {agent.workflow?.description && (
                              <p className="text-sm mt-1 text-gray-600 line-clamp-2">{agent.workflow.description}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {new Date(agent.workflow?.updatedAt || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setLoadDialogOpen(false)} className="border-gray-300">
                  取消
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </ReactFlowProvider>
      </div>
    </div>
  );
} 