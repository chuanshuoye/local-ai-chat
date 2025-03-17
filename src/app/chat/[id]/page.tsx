'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatMessage, Message } from '@/components/chat/chat-message';
import { useChatStore } from '@/store/chat-store';
import { ModelSelector } from '@/components/chat/model-selector';
import { API_PATHS, DEFAULT_MODEL_ID, MessageRole } from '@/constants';

export default function ChatSessionPage() {
  const params = useParams();
  const chatId = params.id as string;
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL_ID);
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  
  const { 
    addMessage,
    updateMessage,
    setCurrentSession,
    getAssistant
  } = useChatStore();
  
  // 获取当前会话
  const session = useChatStore(state => state.getSession(chatId));
  
  // 设置当前会话
  useEffect(() => {
    setCurrentSession(chatId);
  }, [chatId, setCurrentSession]);
  
  // 如果会话不存在，显示错误信息
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-red-500 font-medium">会话不存在或已被删除</div>
      </div>
    );
  }
  
  const handleSendMessage = async (content: string) => {
    // 创建用户消息
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user" as MessageRole,
      content,
      timestamp: new Date(),
    };

    // 添加用户消息到聊天记录
    addMessage(chatId, userMessage);
    
    // 设置加载状态
    setIsLoading(true);

    try {
      // 获取当前会话的历史消息（最多获取10条，避免上下文过长）
      const history = session.messages
        .slice(-10)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // 获取助手信息（如果有）
      const assistant = session.assistantId ? getAssistant(session.assistantId) : undefined;
      
      // 准备请求数据
      const requestData: {
        message: string;
        history: { role: string; content: string }[];
        model: string;
        systemPrompt?: string;
        stream: boolean;
      } = {
        message: content,
        history: history,
        model: selectedModel,
        stream: streamingEnabled // 使用状态控制是否启用流式响应
      };
      
      // 如果有助手，添加系统提示词
      if (assistant && assistant.prompt) {
        requestData.systemPrompt = assistant.prompt;
      }

      // 创建一个空的 AI 回复消息，用于流式更新
      const aiResponseId = `ai-${Date.now()}`;
      const aiResponse: Message = {
        id: aiResponseId,
        role: "assistant" as MessageRole,
        content: '',
        timestamp: new Date(),
        metadata: {
          model: selectedModel,
          isStreaming: true,
          ...(assistant?.id && { assistantId: assistant.id }),
          ...(assistant?.name && { assistantName: assistant.name })
        }
      };

      // 添加初始空消息到聊天记录
      if (streamingEnabled) {
        addMessage(chatId, aiResponse);
      }

      if (!streamingEnabled) {
        // 非流式响应处理
        const response = await fetch('/api/ai/ollama', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...requestData,
            stream: false
          }),
        });

        if (!response.ok) {
          throw new Error('API request failed');
        }

        const data = await response.json();

        // 创建 AI 回复
        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant' as MessageRole,
          content: data.response,
          timestamp: new Date(),
          metadata: {
            model: data.model,
            ...(assistant?.id && { assistantId: assistant.id }),
            ...(assistant?.name && { assistantName: assistant.name })
          }
        };

        // 添加 AI 回复到聊天记录
        addMessage(chatId, aiResponse);
      } else {
        // 流式响应处理
        const response = await fetch(API_PATHS.OLLAMA, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw new Error('API request failed');
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        // 处理流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // 解码二进制数据
          const chunk = decoder.decode(value, { stream: true });
          
          try {
            // 处理每个 JSON 块
            const lines = chunk.split('\n').filter(line => line.trim());
            
            for (const line of lines) {
              const data = JSON.parse(line);
              
              if (data.error) {
                console.error('Stream error:', data.error);
                continue;
              }
              
              if (data.chunk) {
                // 更新累积内容
                accumulatedContent += data.chunk;
                
                // 更新消息内容
                updateMessage(chatId, aiResponseId, accumulatedContent);
              }
              
              if (data.done) {
                // 流式传输完成，更新最终内容和元数据
                updateMessage(
                  chatId, 
                  aiResponseId, 
                  data.fullResponse || accumulatedContent,
                  {
                    isStreaming: false,
                    model: data.model || selectedModel
                  }
                );
              }
            }
          } catch (e) {
            console.error('Error parsing stream chunk:', e, chunk);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // 添加错误消息
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'system' as MessageRole,
        content: '抱歉，连接本地 Ollama 服务时发生错误。请确保 Ollama 服务正在运行，并且可以访问。',
        timestamp: new Date(),
      };
      
      addMessage(chatId, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    // 创建临时 URL（实际应用中应上传到服务器）
    const fileUrl = URL.createObjectURL(file);
    
    // 创建带附件的用户消息
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user' as MessageRole,
      content: `上传文件: ${file.name}`,
      timestamp: new Date(),
      attachment: {
        type: file.type,
        name: file.name,
        url: fileUrl,
        size: file.size
      }
    };

    // 添加用户消息到聊天记录
    addMessage(chatId, userMessage);
    
    // 设置加载状态
    setIsLoading(true);
    
    try {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 获取助手信息（如果有）
      const assistant = session.assistantId ? getAssistant(session.assistantId) : undefined;
      
      // 创建 AI 回复
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant' as MessageRole,
        content: `我已收到你的文件 "${file.name}"。这是一个 ${file.type} 类型的文件，大小为 ${(file.size / 1024 / 1024).toFixed(2)} MB。`,
        timestamp: new Date(),
        metadata: {
          assistantId: assistant?.id,
          assistantName: assistant?.name
        }
      };
      
      // 添加 AI 回复到聊天记录
      addMessage(chatId, aiResponse);
    } catch (error) {
      console.error('Error handling file upload:', error);
      
      // 添加错误消息
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'system' as MessageRole,
        content: '抱歉，处理文件时发生错误。',
        timestamp: new Date(),
      };
      
      addMessage(chatId, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取当前助手信息
  const currentAssistant = session.assistantId ? getAssistant(session.assistantId) : undefined;

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 bg-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-900">{session.title}</h1>
          {currentAssistant && (
            <div className="ml-3 flex items-center text-sm text-gray-500">
              <span className="mr-1">{currentAssistant.icon}</span>
              <span>{currentAssistant.name}</span>
            </div>
          )}
        </div>
        <ModelSelector 
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          streamingEnabled={streamingEnabled}
          onStreamingToggle={setStreamingEnabled}
        />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {session.messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isLoading && (
          <div className="py-5 bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="text-gray-500">AI 正在思考...</div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <ChatInput 
        onSendMessage={handleSendMessage} 
        onFileUpload={handleFileUpload}
        isLoading={isLoading} 
      />
    </div>
  );
} 