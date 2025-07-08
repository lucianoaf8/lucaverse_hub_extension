import React, { useState } from 'react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4');

  const models = [
    { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model' },
    { id: 'gpt-3.5', name: 'GPT-3.5', description: 'Fast and efficient' },
    { id: 'claude', name: 'Claude', description: 'Anthropic\'s assistant' },
    { id: 'local', name: 'Local Model', description: 'Private processing' },
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `I understand you're asking about "${inputValue}". This is a placeholder response. In a real implementation, this would connect to an AI service like OpenAI, Anthropic, or a local AI model to provide intelligent responses.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'ai',
        content: 'Chat cleared. How can I help you today?',
        timestamp: new Date(),
      },
    ]);
  };

  const exportChat = () => {
    const chatData = {
      timestamp: new Date().toISOString(),
      model: selectedModel,
      messages: messages.map(msg => ({
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
      })),
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-surface rounded-lg border border-neutral-700">
      {/* Header */}
      <div className="p-4 border-b border-neutral-700 bg-elevated rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
              <span className="text-secondary">🤖</span>
            </div>
            <div>
              <h3 className="font-medium text-secondary">AI Chat Assistant</h3>
              <p className="text-xs text-neutral-400">
                Model: {models.find(m => m.id === selectedModel)?.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="text-xs bg-neutral-800 border border-neutral-700 rounded px-2 py-1"
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
            <button
              onClick={exportChat}
              className="p-1 hover:bg-neutral-700 rounded transition-colors"
              title="Export Chat"
            >
              📤
            </button>
            <button
              onClick={clearChat}
              className="p-1 hover:bg-neutral-700 rounded transition-colors"
              title="Clear Chat"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-primary text-white rounded-br-none'
                  : 'bg-elevated border border-neutral-700 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-2 ${
                message.type === 'user' ? 'text-primary-100' : 'text-neutral-500'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-3 bg-elevated border border-neutral-700 rounded-lg rounded-bl-none">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-neutral-700 bg-elevated rounded-b-lg">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-sm 
                         focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20
                         resize-none"
              rows={3}
              disabled={isTyping}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="px-4 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isTyping ? '⏳' : '📤'}
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-3 text-xs text-neutral-500">
          <div>
            {messages.length} messages • {models.find(m => m.id === selectedModel)?.description}
          </div>
          <div className="flex items-center space-x-4">
            <span>Ctrl+Enter to send</span>
            <span>•</span>
            <span>Shift+Enter for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
}