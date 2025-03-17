import { NextResponse } from 'next/server';

export async function GET() {
  // 模拟 AI 生成的问候语
  const greetings = [
    'Hello, AI enthusiast!',
    'Welcome to the Next.js React AI project!',
    'Greetings from the AI assistant!',
    'Hello there! Ready to build something amazing?',
    'Welcome back! Let\'s create something intelligent today.'
  ];
  
  // 随机选择一个问候语
  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
  
  // 添加 2 秒延迟模拟 AI 处理时间
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return NextResponse.json({ greeting: randomGreeting });
} 