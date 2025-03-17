import { NextRequest, NextResponse } from 'next/server';

// Ollama API 的默认地址
const OLLAMA_API_URL = 'http://localhost:3000/api/proxy/ai/ollama/generate';

// 定义消息类型
interface ChatMessage {
  role: string;
  content: string;
}

// 定义请求体类型
interface OllamaRequestBody {
  model: string;
  prompt: string;
  stream?: boolean;
  format?: string;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
  };
  messages?: ChatMessage[];
  system?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, history = [], model = 'llama3.2', systemPrompt, stream = false } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: '消息内容不能为空' },
        { status: 400 }
      );
    }
    
    // 构建上下文提示
    let contextPrompt = '';
    if (history.length > 0) {
      // 将历史消息格式化为对话格式
      contextPrompt = history.map((msg: ChatMessage) => {
        const role = msg.role === 'user' ? '用户' : 'AI';
        return `${role}: ${msg.content}`;
      }).join('\n');
      
      contextPrompt += '\n';
    }
    
    // 添加当前用户消息
    contextPrompt += `用户: ${message}\nAI: `;
    
    // 构建请求体
    const ollamaRequestBody: OllamaRequestBody = {
      model: model,
      prompt: contextPrompt,
      stream: stream,
      options: {
        temperature: 0.7,
        top_p: 0.9,
      }
    };
    
    // 如果有历史记录，添加到请求中
    if (history && history.length > 0) {
      ollamaRequestBody.messages = history;
    }
    
    // 如果有系统提示词，添加到请求中
    if (systemPrompt) {
      // 添加系统提示词
      if (!ollamaRequestBody.messages) {
        ollamaRequestBody.messages = [];
      }
      
      ollamaRequestBody.messages.unshift({
        role: 'system',
        content: systemPrompt
      });
      
      // 或者使用 system 参数
      ollamaRequestBody.system = systemPrompt;
    }
    
    // console.log('正在请求 Ollama API...', ollamaRequestBody);
    
    // 如果是流式响应
    if (stream) {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      
      // 创建一个可读流
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            // 发送请求到 Ollama API
            const response = await fetch(OLLAMA_API_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(ollamaRequestBody),
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('Ollama API 请求失败:', errorText);
              controller.enqueue(encoder.encode(JSON.stringify({ 
                error: `Ollama API 请求失败: ${response.status}` 
              })));
              controller.close();
              return;
            }
            
            // 确保响应是可读流
            if (!response.body) {
              controller.enqueue(encoder.encode(JSON.stringify({ 
                error: 'Ollama API 没有返回流式响应' 
              })));
              controller.close();
              return;
            }
            
            const reader = response.body.getReader();
            let responseText = '';
            
            // 读取流数据
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              // 解码二进制数据
              const chunk = decoder.decode(value, { stream: true });
              responseText += chunk;
              
              // 将数据块发送到客户端
              controller.enqueue(encoder.encode(JSON.stringify({ 
                chunk: chunk,
                model: model
              })));
            }
            
            // 发送完成信号
            controller.enqueue(encoder.encode(JSON.stringify({ 
              done: true,
              fullResponse: responseText,
              model: model
            })));
            
          } catch (error) {
            console.error('处理流式响应时出错:', error);
            controller.enqueue(encoder.encode(JSON.stringify({ 
              error: `处理流式响应时出错: ${(error as Error).message}` 
            })));
          } finally {
            controller.close();
          }
        }
      });
      
      // 返回流式响应
      return new Response(readableStream, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });
    } 
    // 非流式响应
    else {
      // 发送请求到 Ollama API
      const ollamaResponse = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ollamaRequestBody),
      });

      // console.log('正在返回请求 ollamaResponse...', ollamaResponse);
      
      if (!ollamaResponse.ok) {
        const errorData = await ollamaResponse.text();
        console.error('Ollama API 请求失败:', errorData);
        throw new Error(`Ollama API 请求失败: ${ollamaResponse.status}`);
      }
      
      const data = await ollamaResponse.json();
      
      // 返回 Ollama 的响应
      return NextResponse.json({ 
        response: data.response || '抱歉，我无法生成回复。',
        model: model
      });
    }
  } catch (error) {
    console.error('处理 Ollama 请求时出错:', error);
    return NextResponse.json(
      { error: '处理请求时发生错误', details: (error as Error).message },
      { status: 500 }
    );
  }
} 