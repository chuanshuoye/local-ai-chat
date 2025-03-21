'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatMessage, Message } from '@/components/chat/chat-message';
import { useChatStore } from '@/store/chat-store';
import { API_PATHS, DEFAULT_MODEL_ID, MessageRole } from '@/constants';
import ChatPageLayout from './layout';
import { createInitialAiMessage } from '@/utils/stream-helpers';
import { 
  createRequestData, 
  handleNonStreamingResponse, 
  handleStreamingResponse 
} from '@/utils/api-helpers';

export default function ChatSessionPage() {
  const params = useParams();
  const chatId = params.id as string;
  const [isLoading, setIsLoading] = useState(false);

  // 从全局存储中获取模型和流式设置
  const selectedModel = useChatStore(state => state.selectedModel || DEFAULT_MODEL_ID);
  const streamingEnabled = useChatStore(state => state.streamingEnabled !== undefined ? state.streamingEnabled : true);

  const {
    addMessage,
    updateMessage,
    setCurrentSession,
    getAssistant,
    updateSessionContext
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
      role: MessageRole.USER,
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
      const requestData = createRequestData(
        content,
        history,
        selectedModel,
        streamingEnabled,
        session.context,
        assistant?.prompt
      );

      // 创建一个空的 AI 回复消息，用于流式更新
      const aiResponseId = `ai-${Date.now()}`;
      const aiResponse = createInitialAiMessage(selectedModel, assistant);
      aiResponse.id = aiResponseId;

      // 添加初始空消息到聊天记录
      if (streamingEnabled) {
        addMessage(chatId, aiResponse);
      }

      // 根据流式设置处理响应
      if (streamingEnabled) {
        await handleStreamingResponse(
          API_PATHS.OLLAMA,
          requestData,
          chatId,
          aiResponseId,
          selectedModel,
          { updateMessage, updateSessionContext }
        );
      } else {
        await handleNonStreamingResponse(
          API_PATHS.OLLAMA,
          requestData,
          chatId,
          assistant,
          { addMessage, updateSessionContext }
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);

      // 添加错误消息
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: MessageRole.SYSTEM,
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

  const handleImageUpload = (imageBase64: string) => {
    // 创建带附件的用户消息
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user' as MessageRole,
      content: `选择的图片: \n`,
      timestamp: new Date(),
      attachment: {
        type: 'image/png',
        name: 'image.png',
        url: imageBase64,
        size: imageBase64.length
      }
    };
    addMessage(chatId, userMessage);
  };

  // 获取当前助手信息
  const currentAssistant = session.assistantId ? getAssistant(session.assistantId) : undefined;

  return (
    <ChatPageLayout>
      <div className="flex flex-col h-full">
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">{session.title}</h1>
            {currentAssistant && (
              <div className="ml-3 flex items-center text-sm text-gray-500">
                <span className="mr-1">{currentAssistant.icon}</span>
                <span>{currentAssistant.name}</span>
              </div>
            )}
          </div>
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
          onImageUpload={handleImageUpload}
          isLoading={isLoading}
        />
      </div>
    </ChatPageLayout>
  );
} 