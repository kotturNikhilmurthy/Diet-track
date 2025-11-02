import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import { chatAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const SYSTEM_PROMPT = `You are a friendly registered dietitian supporting users of the DIET Track app in India.
Keep answers brief, actionable, and culturally relevant. Encourage healthy habits, emphasise balanced meals,
and stay aligned with any cues from the conversation.`;

const SUGGESTED_PROMPTS = [
  'What should I eat for dinner after a strength workout?',
  'Give me a quick high-iron snack idea.',
  'How can I improve my hydration through the day?',
];

const AssistantPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${user?.name?.split(' ')?.[0] || 'there'}! I can help with meal ideas, nutrition tips, or healthy habits. What would you like to chat about today?`,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isSending) return;

    const nextMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInputValue('');
    setError(null);
    setIsSending(true);

    try {
      const response = await chatAPI.sendMessage({
        messages: nextMessages,
        systemPrompt: SYSTEM_PROMPT,
      });
      const reply = response.data?.reply || 'I had trouble formulating a response. Please try again.';
      setMessages([...nextMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Assistant error:', err);
      const fallback =
        err.response?.data?.message || 'The assistant is unavailable right now. Please try again soon.';
      setMessages([...nextMessages, { role: 'assistant', content: fallback }]);
      setError(fallback);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedPrompt = (prompt) => {
    setInputValue(prompt);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="card mb-6">
          <h1 className="card-header">Smart Assistant</h1>
          <p className="text-sm text-gray-600">
            Ask anything about meals, nutrition, or healthy habits. I&apos;ll respond with concise suggestions tailored to you.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSuggestedPrompt(prompt)}
                className="px-3 py-1 text-sm bg-primary-50 text-primary-700 rounded-full hover:bg-primary-100"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="card h-[32rem] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}-${message.content.slice(0, 10)}`}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 text-sm max-w-[80%] whitespace-pre-line ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3 bg-gray-100 text-sm text-gray-500">Thinking…</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="mt-4 border-t border-gray-200 pt-4">
            <textarea
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message…"
              rows={3}
              className="w-full resize-none border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            ></textarea>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-500">Press Enter to send • Shift + Enter for a new line</span>
              <button
                onClick={handleSend}
                disabled={isSending || !inputValue.trim()}
                className="btn-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSending ? 'Sending…' : 'Send'}
              </button>
            </div>
            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AssistantPage;
