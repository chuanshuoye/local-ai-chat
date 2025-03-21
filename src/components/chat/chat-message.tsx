import React, { useState, useEffect, useRef } from 'react';
import { MessageRole } from '@/constants';
import { processStreamMessage } from '@/utils/message-helpers';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  attachment?: {
    type: string;
    name: string;
    url: string;
    size: number;
  };
  metadata?: {
    model?: string;
    isStreaming?: boolean;
    rawJsonContent?: boolean;
    [key: string]: any;
  };
}

interface ChatMessageProps {
  message: Message;
  onContentUpdate?: (messageId: string, content: string) => void;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === MessageRole.USER;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioSupported, setAudioSupported] = useState(true);
  const isStreaming = message.metadata?.isStreaming || false;
  const contentRef = useRef<HTMLDivElement>(null);
  const [parsedContent, setParsedContent] = useState<string>(message.content);
  
  // 检查浏览器是否支持语音合成
  useEffect(() => {
    setAudioSupported('speechSynthesis' in window);
  }, []);
  
  // 解析可能包含 JSON 的内容
  useEffect(() => {
    if (!message.content) {
      setParsedContent('');
      return;
    }

    // 处理消息并更新状态
    const processedContent = processStreamMessage(message.content);
    setParsedContent(processedContent);
  }, [message.content]);
  
  // 当流式内容更新时，滚动到最新内容
  useEffect(() => {
    if (isStreaming && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [parsedContent, isStreaming]);
  
  // 处理文字转语音
  const handleTextToSpeech = () => {
    if (!audioSupported) {
      alert('您的浏览器不支持语音合成功能');
      return;
    }
    
    // 如果正在播放，则停止
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    // 获取纯文本内容（去除代码块）
    const textContent = parsedContent.replace(/```(\w+)?\n([\s\S]*?)\n```/g, '代码块已省略');
    
    const utterance = new SpeechSynthesisUtterance(textContent);
    
    // 设置语音参数
    utterance.lang = 'zh-CN'; // 设置语言为中文
    utterance.rate = 1.0;     // 语速 (0.1 到 10)
    utterance.pitch = 1.0;    // 音调 (0 到 2)
    
    // 播放结束事件
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    // 错误事件
    utterance.onerror = () => {
      setIsSpeaking(false);
    };
    
    // 开始播放
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };
  
  // 处理消息内容，识别代码块
  const renderMessageContent = (content: string) => {
    // 如果内容为空或正在流式传输但尚未有内容，显示光标
    if (!content) {
      if (isStreaming) {
        return <span className="animate-pulse">▋</span>;
      }
      return <span>...</span>;
    }
    
    // 匹配 ```language\n code \n``` 格式的代码块
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)\n```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // 添加代码块前的文本
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
            {content.substring(lastIndex, match.index)}
          </span>
        );
      }
      
      // 获取语言类型和代码内容
      const language = match[1] || 'plaintext';
      const code = match[2];
      
      // 添加代码块
      parts.push(
        <div key={`code-${match.index}`} className="my-2 rounded-md overflow-hidden">
          <div className="bg-gray-800 text-white text-xs px-3 py-1 flex justify-between items-center">
            <span>{language}</span>
            <button
              onClick={() => navigator.clipboard.writeText(code)}
              className="text-gray-400 hover:text-white"
              title="复制代码"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
            </button>
          </div>
          <pre className="bg-gray-900 text-gray-100 p-3 overflow-x-auto text-sm">
            <code className={`language-${language}`}>{code}</code>
          </pre>
        </div>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // 添加剩余的文本
    if (lastIndex < content.length) {
      parts.push(
        <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {content.substring(lastIndex)}
          {isStreaming && <span className="animate-pulse">▋</span>}
        </span>
      );
    } else if (parts.length === 0) {
      // 如果没有匹配到代码块，直接显示全部内容
      parts.push(
        <span key="text-full" className="whitespace-pre-wrap">
          {content}
          {isStreaming && <span className="animate-pulse">▋</span>}
        </span>
      );
    }
    
    return parts;
  };
  
  return (
    <div className={`py-5 ${isUser ? 'bg-white' : 'bg-gray-50'}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex items-start">
          {/* Avatar */}
          <div className="flex-shrink-0 mr-4">
            {isUser ? (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                U
              </div>
            ) : (
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
            )}
          </div>
          
          {/* Message content */}
          <div className="flex-1 prose max-w-none">
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm font-medium text-gray-900">
                {isUser ? '你' : message.metadata?.assistantName ? message.metadata.assistantName : 'AI 助手'}
              </div>
              <div className="flex items-center space-x-2">
                {!isUser && !isStreaming && audioSupported && (
                  <button 
                    onClick={handleTextToSpeech}
                    className={`text-xs flex items-center space-x-1 px-2 py-0.5 rounded ${
                      isSpeaking 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={isSpeaking ? "停止朗读" : "朗读消息"}
                  >
                    {isSpeaking ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                        </svg>
                        <span>停止</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243a1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.415z" clipRule="evenodd" />
                        </svg>
                        <span>朗读</span>
                      </>
                    )}
                  </button>
                )}
                {isStreaming && (
                  <div className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    生成中...
                  </div>
                )}
                {!isUser && message.metadata?.model && (
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {message.metadata.model}
                  </div>
                )}
              </div>
            </div>
            <div className="text-gray-700" ref={contentRef}>
              {renderMessageContent(parsedContent)}
            </div>
          </div>
        </div>
      </div>
      {message.attachment && (
      <div className="flex items-start">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {message.attachment.type.startsWith('image/') ? (
            <div className="relative rounded-lg overflow-hidden max-w-md my-2">
              <img 
                src={message.attachment.url} 
                alt={message.attachment.name}
                className="max-w-full h-auto"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2">
                {message.attachment.name} ({(message.attachment.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            </div>
          ) : message.attachment.type.includes('video') ? (
            <div>
              <video 
                controls 
                className="max-w-full"
                src={message.attachment.url}
              >
                Your browser does not support the video tag.
              </video>
              <div className="p-2 text-xs text-gray-500">
                {message.attachment.name} ({(message.attachment.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            </div>
          ) : (
            <div className="flex items-center p-3">
              <div className="mr-3">
                {message.attachment.type.includes('pdf') ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                ) : message.attachment.type.includes('word') || message.attachment.type.includes('document') ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div>
                <div className="font-medium">{message.attachment.name}</div>
                <div className="text-xs text-gray-500">
                  {(message.attachment.size / 1024 / 1024).toFixed(2)} MB • 
                  <a 
                    href={message.attachment.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-1 text-blue-600 hover:underline"
                  >
                    下载
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
} 