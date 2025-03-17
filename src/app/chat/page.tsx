'use client';

import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chat-store';

export default function ChatPage() {
  const router = useRouter();
  const createSession = useChatStore(state => state.createSession);
  
  const handleNewChat = () => {
    const newSessionId = createSession();
    router.push(`/chat/${newSessionId}`);
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">欢迎使用 AI 聊天助手</h1>
        <p className="text-gray-600 mb-8">
          选择左侧的历史对话或者开始一个新的对话。
        </p>
        <button
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          onClick={handleNewChat}
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
          开始新对话
        </button>
      </div>
    </div>
  );
} 