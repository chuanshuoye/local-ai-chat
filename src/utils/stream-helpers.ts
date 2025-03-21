import { Message } from '@/components/chat/chat-message';
import { MessageRole } from '@/constants';

/**
 * 处理流式响应的JSON行
 * @param line JSON字符串行
 * @returns 解析后的数据对象，解析失败则返回null
 */
export function parseJsonLine(line: string): any | null {
  if (!line.trim()) return null;

  try {
    return JSON.parse(line);
  } catch (e) {
    return null;
  }
}

/**
 * 从缓冲区中提取有效的JSON行
 * @param bufferChunk 缓冲区字符串
 * @returns 包含有效JSON行和剩余内容的对象
 */
export function extractValidJsonLines(bufferChunk: string): { 
  validLines: any[], 
  remaining: string 
} {
  const lines = bufferChunk.split('\n');
  const validLines: any[] = [];
  let remaining = '';
  
  for (const line of lines) {
    if (!line.trim()) continue;
    const parsedLine = parseJsonLine(line);
    if (parsedLine) {
      try {
        const isJson = JSON.parse(parsedLine.chunk);
        if (isJson) {
          validLines.push(parsedLine);
        }
      } catch (e) {
        // console.error('解析错误:', e);
      }
    } else {
      remaining += line + '\n';
    }
  }
  
  return { validLines, remaining };
}

/**
 * 处理单个响应数据
 * @param data 解析后的数据对象
 * @param accumulatedContent 当前累积的内容
 * @param chatId 会话ID
 * @param messageId 消息ID
 * @param updateMessage 更新消息的函数
 * @param updateSessionContext 更新会话上下文的函数
 * @param selectedModel 选中的模型
 * @returns 更新后的累积内容
 */
export function processResponseData(
  data: any,
  accumulatedContent: string,
  chatId: string,
  messageId: string,
  updateMessage: (sessionId: string, messageId: string, content: string, metadata?: Record<string, any>) => void,
  updateSessionContext: (sessionId: string, context: number[]) => void,
  selectedModel: string
): string {
  // 处理错误
  if (data.error) {
    console.error('Stream error:', data.error);
    return accumulatedContent;
  }

  // 如果是完整响应
  if (data.response) {
    updateMessage(chatId, messageId, data.response, {
      isStreaming: false,
      model: data.model || selectedModel
    });
    return data.response;
  }

  // 处理文本块
  if (data.chunk) {
    const newContent = accumulatedContent + data.chunk;
    updateMessage(chatId, messageId, newContent);
    return newContent;
  }

  // 处理上下文 - 无论是否为最后一个数据包都处理
  if (data.context) {
    updateSessionContext(chatId, data.context);
  }

  // 处理完成信号
  if (data.done) {
    // 处理最终响应
    if (data.fullResponse) {
      updateMessage(
        chatId,
        messageId,
        data.fullResponse,
        {
          isStreaming: false,
          model: data.model || selectedModel
        }
      );
      return data.fullResponse;
    } else {
      updateMessage(
        chatId,
        messageId,
        accumulatedContent,
        {
          isStreaming: false,
          model: data.model || selectedModel
        }
      );
    }
  }

  return accumulatedContent;
}

/**
 * 创建空的AI响应消息
 * @param selectedModel 当前选择的模型ID
 * @param assistant 助手对象
 * @returns AI消息对象
 */
export function createInitialAiMessage(selectedModel: string, assistant?: any): Message {
  return {
    id: `ai-${Date.now()}`,
    role: MessageRole.ASSISTANT,
    content: '',
    timestamp: new Date(),
    metadata: {
      model: selectedModel,
      isStreaming: true,
      ...(assistant?.id && { assistantId: assistant.id }),
      ...(assistant?.name && { assistantName: assistant.name })
    }
  };
}

/**
 * 解析Ollama的最终响应数据，提取上下文等关键信息
 * @param content 最后一条响应数据
 * @returns 解析后的响应对象
 */
export function parseOllamaFinalResponse(content: string): any {
  // 如果内容为空，返回null
  if (!content || !content.trim()) {
    return null;
  }
  
  try {
    // 尝试直接解析JSON
    return JSON.parse(content);
  } catch (e) {
    // 如果解析失败，尝试提取JSON部分
    try {
      // Ollama有时会在最后一条消息中包含类似 "context: [1,2,3]" 这样的格式
      // 尝试将其转换为有效的JSON
      
      // 提取上下文
      const contextMatch = content.match(/context\s*:\s*(\[\s*\d+(?:\s*,\s*\d+)*\s*\])/);
      if (contextMatch && contextMatch[1]) {
        try {
          const contextArray = JSON.parse(contextMatch[1]);
          return { context: contextArray };
        } catch {
          // 忽略解析错误
        }
      }
      
      // 提取响应完成标记
      if (content.includes('done') || content.includes('done: true')) {
        return { done: true };
      }
      
      // 提取模型名称
      const modelMatch = content.match(/model\s*:\s*"([^"]+)"/);
      if (modelMatch && modelMatch[1]) {
        return { model: modelMatch[1] };
      }
    } catch {
      // 如果所有提取尝试都失败，返回null
    }
  }
  
  return null;
} 