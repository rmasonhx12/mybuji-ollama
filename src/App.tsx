import React, { useState, useEffect } from 'react';
import { Send, AlertCircle, RefreshCw } from 'lucide-react';
import { Logo } from './components/Logo';
import { ModelSelector } from './components/ModelSelector';
import { ChatMessage } from './components/ChatMessage';

function App() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('llama2');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkApiConnection = async () => {
    setIsChecking(true);
    try {
      const apiUrl = import.meta.env.VITE_OLLAMA_HOST;
      if (!apiUrl) {
        throw new Error('Ollama API URL is not configured. Please set VITE_OLLAMA_HOST in your environment variables.');
      }

      // First check if Ollama is running by checking the version endpoint
      const versionResponse = await fetch(`${apiUrl}/api/version`);
      
      if (!versionResponse.ok) {
        throw new Error(`Ollama API returned status ${versionResponse.status}`);
      }
      
      // Then check if the selected model is available
      const modelResponse = await fetch(`${apiUrl}/api/show`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: model }),
      });
      
      if (!modelResponse.ok) {
        throw new Error(`Model ${model} is not available. Please ensure it's installed on the Ollama server.`);
      }
      
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Cannot connect to Ollama API. Please check the API configuration and ensure the server is running.');
      }
    } finally {
      setIsChecking(false);
    }
  };

  // Check connection when component mounts or model changes
  useEffect(() => {
    checkApiConnection();
  }, [model]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_OLLAMA_HOST}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt: input,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to get response from Ollama. Please check the API configuration and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b p-4">
        <Logo />
        <ModelSelector currentModel={model} onModelChange={setModel} />
      </header>

      <main className="flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-4xl">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
              <button
                onClick={checkApiConnection}
                disabled={isChecking}
                className="flex items-center gap-2 rounded-lg px-3 py-1 text-sm bg-red-100 hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
                {isChecking ? 'Checking...' : 'Retry Connection'}
              </button>
            </div>
          )}
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
        </div>
      </main>

      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="mx-auto max-w-4xl">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={error ? "Cannot connect to Ollama API..." : "Type your message..."}
              className="w-full rounded-lg border border-gray-300 pr-10 p-4 focus:border-blue-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
              disabled={isLoading || !!error}
            />
            <button
              type="submit"
              disabled={isLoading || !!error}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <Send className="h-6 w-6" />
            </button>
          </div>
        </div>
      </form>

      <footer className="border-t p-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Bujisoft
      </footer>
    </div>
  );
}

export default App;