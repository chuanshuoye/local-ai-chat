'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useChatStore } from '@/store/chat-store';
import { formatDate } from '@/lib/utils';
import { useState } from 'react';
import { AVAILABLE_ICONS } from '@/constants';

export function ChatSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    sessions, 
    showAssistantsPanel,
    createSession, 
    deleteSession,
    toggleAssistantsPanel,
    addAssistant,
    deleteAssistant
  } = useChatStore();
  
  const [showAddAssistant, setShowAddAssistant] = useState(false);
  const [newAssistant, setNewAssistant] = useState<{
    name: string;
    description: string;
    icon: string;
    prompt: string;
  }>({
    name: '',
    description: '',
    icon: '🤖',
    prompt: ''
  });
  
  // 格式化日期的辅助函数
  const formatSessionDate = (date: Date) => {
    return formatDate(date);
  };
  
  // 截断描述文本，超过指定长度显示省略号
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };
  
  const handleNewChat = () => {
    const newSessionId = createSession();
    router.push(`/chat/${newSessionId}`);
  };
  
  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm('确定要删除这个对话吗？')) {
      deleteSession(sessionId);
      
      // 如果删除的是当前正在查看的会话，返回到聊天主页
      if (pathname === `/chat/${sessionId}`) {
        router.push('/chat');
      }
    }
  };
  
  const handleSelectAssistant = (assistantId: string) => {
    const newSessionId = createSession(undefined, assistantId);
    router.push(`/chat/${newSessionId}`);
  };
  
  const handleAddAssistant = () => {
    if (newAssistant.name && newAssistant.prompt) {
      const assistantId = addAssistant({
        name: newAssistant.name,
        description: newAssistant.description || '自定义助手',
        icon: newAssistant.icon || '🤖',
        prompt: newAssistant.prompt
      });
      
      // 重置表单
      setNewAssistant({
        name: '',
        description: '',
        icon: '🤖',
        prompt: ''
      });
      
      // 关闭添加助手表单
      setShowAddAssistant(false);
      
      // 可选：创建一个使用新助手的会话
      const newSessionId = createSession(undefined, assistantId);
      router.push(`/chat/${newSessionId}`);
    }
  };
  
  const handleDeleteAssistant = (e: React.MouseEvent, assistantId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm('确定要删除这个助手吗？')) {
      deleteAssistant(assistantId);
    }
  };
  
  const assistants = useChatStore(state => state.assistants);
  
  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={handleNewChat}
          className="w-full bg-white text-gray-900 rounded-md py-2 px-4 flex items-center justify-center font-medium hover:bg-gray-100 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          新建对话
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {/* 助手市场板块 */}
        <div className="p-2 border-b border-gray-700">
          <div 
            className="flex justify-between items-center text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 px-2 cursor-pointer"
            onClick={toggleAssistantsPanel}
          >
            <h2>助手市场</h2>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 transition-transform ${showAssistantsPanel ? 'rotate-180' : ''}`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          
          {showAssistantsPanel && (
            <>
              <ul className="space-y-1">
                {assistants.map((assistant) => (
                  <li key={assistant.id}>
                    <button
                      onClick={() => handleSelectAssistant(assistant.id)}
                      className="w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-800 transition-colors group"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-lg mr-3">
                        {assistant.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{assistant.name}</div>
                        <div className="text-xs text-gray-400 truncate">
                          {truncateText(assistant.description, 10)}
                        </div>
                      </div>
                      {!assistant.isSystem && (
                        <button
                          onClick={(e) => handleDeleteAssistant(e, assistant.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              
              {/* 添加助手按钮 */}
              {!showAddAssistant ? (
                <button
                  onClick={() => setShowAddAssistant(true)}
                  className="w-full mt-2 flex items-center justify-center px-3 py-2 text-sm rounded-md bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  添加自定义助手
                </button>
              ) : (
                <div className="mt-2 p-3 bg-gray-800 rounded-md">
                  <h3 className="text-sm font-medium mb-2">创建自定义助手</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">图标</label>
                      <div className="flex flex-wrap gap-1">
                        {AVAILABLE_ICONS.map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setNewAssistant({...newAssistant, icon})}
                            className={`w-7 h-7 flex items-center justify-center rounded ${
                              newAssistant.icon === icon ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">名称 *</label>
                      <input
                        type="text"
                        value={newAssistant.name}
                        onChange={(e) => setNewAssistant({...newAssistant, name: e.target.value})}
                        className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm"
                        placeholder="助手名称"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">描述</label>
                      <input
                        type="text"
                        value={newAssistant.description}
                        onChange={(e) => setNewAssistant({...newAssistant, description: e.target.value})}
                        className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm"
                        placeholder="简短描述"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">角色提示词 *</label>
                      <textarea
                        value={newAssistant.prompt}
                        onChange={(e) => setNewAssistant({...newAssistant, prompt: e.target.value})}
                        className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm"
                        placeholder="详细描述助手的角色、能力和行为方式..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowAddAssistant(false)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-sm py-1 rounded"
                      >
                        取消
                      </button>
                      <button
                        type="button"
                        onClick={handleAddAssistant}
                        disabled={!newAssistant.name || !newAssistant.prompt}
                        className={`flex-1 text-sm py-1 rounded ${
                          !newAssistant.name || !newAssistant.prompt
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500'
                        }`}
                      >
                        创建
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* 历史对话板块 */}
        <div className="p-2">
          <h2 className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 px-2">
            历史对话
          </h2>
          {sessions.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-4">
              没有历史对话
            </div>
          ) : (
            <ul className="space-y-1">
              {sessions.map((session) => (
                <li key={session.id}>
                  <Link
                    href={`/chat/${session.id}`}
                    className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-800 transition-colors group ${
                      pathname === `/chat/${session.id}` ? 'bg-gray-800' : ''
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-3 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1 truncate">{session.title}</div>
                    <div className="text-xs text-gray-500 mr-2">
                      {formatSessionDate(session.updatedAt)}
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(e, session.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
            U
          </div>
          <div className="ml-2">
            <div className="text-sm font-medium">用户</div>
            <div className="text-xs text-gray-400">免费版</div>
          </div>
        </div>
      </div>
    </div>
  );
} 