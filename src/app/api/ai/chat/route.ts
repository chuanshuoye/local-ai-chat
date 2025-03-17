import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // 模拟 AI 处理延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 简单的响应生成逻辑
    const response = generateResponse(message);
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateResponse(message: string): string {
  const lowerCaseMessage = message.toLowerCase();
  
  if (lowerCaseMessage.includes('你好') || lowerCaseMessage.includes('hi') || lowerCaseMessage.includes('hello')) {
    return '你好！很高兴见到你。我能帮你解答问题或提供信息。';
  }
  
  if (lowerCaseMessage.includes('名字')) {
    return '我是 AI 助手，一个基于人工智能的聊天机器人。';
  }
  
  if (lowerCaseMessage.includes('谢谢') || lowerCaseMessage.includes('感谢')) {
    return '不客气！如果还有其他问题，随时可以问我。';
  }
  
  if (lowerCaseMessage.includes('再见') || lowerCaseMessage.includes('拜拜')) {
    return '再见！有需要随时回来找我聊天。';
  }
  
  if (lowerCaseMessage.includes('天气')) {
    return '我无法获取实时天气信息，但你可以查看天气应用或网站获取最新天气预报。';
  }
  
  if (lowerCaseMessage.includes('时间') || lowerCaseMessage.includes('日期')) {
    return `现在的时间是 ${new Date().toLocaleTimeString()}，日期是 ${new Date().toLocaleDateString()}。`;
  }
  
  return `我收到了你的消息："${message}"。作为一个简单的演示 AI，我的回复功能有限。在实际应用中，这里会连接到更强大的 AI 模型来生成更智能的回复。`;
} 