import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User } from 'lucide-react';
import Editor from '@monaco-editor/react';

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
  };
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isCode = message.content.includes('```');
  const Icon = message.role === 'user' ? User : Bot;

  const renderContent = () => {
    if (isCode) {
      const codeMatch = message.content.match(/```(?:\w+)?\n([\s\S]*?)```/);
      const code = codeMatch ? codeMatch[1] : '';
      
      return (
        <div className="mt-2">
          <Editor
            height="200px"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
            }}
          />
        </div>
      );
    }

    return <ReactMarkdown>{message.content}</ReactMarkdown>;
  };

  return (
    <div className={`flex gap-4 p-4 ${message.role === 'assistant' ? 'bg-gray-50' : ''}`}>
      <div className="flex-shrink-0">
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-grow prose max-w-none">
        {renderContent()}
      </div>
    </div>
  );
};