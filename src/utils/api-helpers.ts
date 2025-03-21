import { Message } from '@/components/chat/chat-message';
import { MessageRole } from '@/constants';
import { extractValidJsonLines, processResponseData, parseOllamaFinalResponse } from './stream-helpers';

/**
 * 创建请求数据对象
 * @param content 消息内容
 * @param history 历史消息
 * @param modelId 模型ID
 * @param streamEnabled 是否启用流式响应
 * @param context 上下文信息
 * @param systemPrompt 系统提示词
 * @returns 请求数据对象
 */
export function createRequestData(
  content: string,
  history: { role: string; content: string }[],
  modelId: string,
  streamEnabled: boolean,
  context?: number[],
  systemPrompt?: string
) {
  const requestData: any = {
    message: content,
    history: history,
    model: modelId,
    stream: streamEnabled
  };

  if (context) {
    requestData.context = context;
  }

  if (systemPrompt) {
    requestData.systemPrompt = systemPrompt;
  }

  return requestData;
}

/**
 * 处理非流式响应
 * @param apiPath API路径
 * @param requestData 请求数据
 * @param chatId 会话ID
 * @param assistant 助手对象
 * @param callbacks 回调函数
 */
export async function handleNonStreamingResponse(
  apiPath: string,
  requestData: any,
  chatId: string,
  assistant: any | undefined,
  callbacks: {
    addMessage: (sessionId: string, message: Message) => void,
    updateSessionContext: (sessionId: string, context: number[]) => void
  }
) {
  const response = await fetch(apiPath, {
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

  // 更新会话上下文
  if (data.context) {
    callbacks.updateSessionContext(chatId, data.context);
  }

  // 创建 AI 回复
  const aiResponse: Message = {
    id: `ai-${Date.now()}`,
    role: MessageRole.ASSISTANT,
    content: data.response,
    timestamp: new Date(),
    metadata: {
      model: data.model,
      ...(assistant?.id && { assistantId: assistant.id }),
      ...(assistant?.name && { assistantName: assistant.name })
    }
  };

  // 添加 AI 回复到聊天记录
  callbacks.addMessage(chatId, aiResponse);
}

/**
 * 处理流式响应
 * @param apiPath API路径
 * @param requestData 请求数据
 * @param chatId 会话ID
 * @param messageId 消息ID
 * @param modelId 模型ID
 * @param callbacks 回调函数
 */
export async function handleStreamingResponse(
  apiPath: string,
  requestData: any,
  chatId: string,
  messageId: string,
  modelId: string,
  callbacks: {
    updateMessage: (sessionId: string, messageId: string, content: string, metadata?: Record<string, any>) => void,
    updateSessionContext: (sessionId: string, context: number[]) => void
  }
) {
  const response = await fetch(apiPath, {
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
  let bufferChunk = ''; // 用于缓存不完整的JSON字符串
  let lastData: any = null; // 存储最后一条数据

  while (true) {
    const { done, value } = await reader.read();
    
    // 读取结束时处理最后一条数据
    if (done) {
      // 如果缓冲区中还有内容，尝试解析
      if (bufferChunk.trim()) {
        try {
          // 尝试标准JSON解析
          const finalData = JSON.parse(bufferChunk.trim());
          
          // 处理可能包含完整信息的最后一个数据包
          if (finalData.context) {
            callbacks.updateSessionContext(chatId, finalData.context);
          }
          
          // 如果有完整响应，更新消息
          if (finalData.fullResponse) {
            callbacks.updateMessage(
              chatId,
              messageId,
              finalData.fullResponse,
              {
                isStreaming: false,
                model: finalData.model || modelId
              }
            );
          }
        } catch (e) {
          // 如果标准解析失败，使用特殊解析
          const parsedData = parseOllamaFinalResponse(bufferChunk.trim());
          
          if (parsedData) {
            // 处理解析出的上下文
            if (parsedData.context && Array.isArray(parsedData.context)) {
              callbacks.updateSessionContext(chatId, parsedData.context);
            }
            
            // 处理模型信息
            if (parsedData.done) {
              callbacks.updateMessage(
                chatId, 
                messageId,
                accumulatedContent,
                {
                  isStreaming: false,
                  model: parsedData.model || modelId
                }
              );
            }
          } else {
            console.error('Error parsing final chunk:', e);
          }
        }
      }
      
      // 如果有最后一条有效数据且响应已完成，但可能没有context
      if (lastData && lastData.done) {
        callbacks.updateMessage(
          chatId,
          messageId,
          accumulatedContent,
          {
            isStreaming: false,
            model: lastData.model || modelId
          }
        );
      }
      
      break;
    }

    // 解码二进制数据
    const chunk = decoder.decode(value, { stream: true });
    
    // 将新chunk添加到缓冲区
    bufferChunk += chunk;
    
    try {
      // 从缓冲区提取有效的JSON行
      const { validLines, remaining } = extractValidJsonLines(bufferChunk);
      
      // 更新缓冲区为未完成的部分
      bufferChunk = remaining;

      // console.log('bufferChunk', remaining);
      // 处理所有有效的JSON行
      for (const data of validLines) {
        // 存储最后一条处理的数据
        lastData = data;
        
        accumulatedContent = processResponseData(
          data, 
          accumulatedContent, 
          chatId, 
          messageId, 
          callbacks.updateMessage, 
          callbacks.updateSessionContext, 
          modelId
        );
      }
    } catch (e) {
      console.error('Error processing stream chunks:', e);
    }
  }
} 