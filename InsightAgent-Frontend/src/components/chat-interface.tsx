'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThinkingUI } from './thinking-ui';
import { ResultDisplay } from './result-display';
import { agentApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Message } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface ChatInterfaceProps {
  projectId: string;
  hasData: boolean;
}

export function ChatInterface({ projectId, hasData }: ChatInterfaceProps) {
  const { refreshUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleQuerySubmit = async (question: string) => {
    if (!question.trim() || isLoading || !hasData) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: question.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await agentApi.query(projectId, userMessage.content);

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: `Found ${result.rowCount} results in ${result.executionTime}ms`,
        queryResult: result,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      refreshUser();
    } catch (error) {
      let errorMsg = 'An error occurred while processing your query.';
      const apiError = error as { response?: { data?: { message?: unknown } } };
      if (apiError?.response?.data?.message) {
        errorMsg = typeof apiError.response.data.message === 'string'
          ? apiError.response.data.message
          : Array.isArray(apiError.response.data.message)
            ? String(apiError.response.data.message[0])
            : JSON.stringify(apiError.response.data.message);
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }

      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: errorMsg,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    handleQuerySubmit(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const exampleQuestions = [
    "Show me all records from the first table",
    "What are the total counts by category?",
    "Find records where amount is greater than 100",
    "List customers who have orders",
  ];

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-background">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth" ref={scrollRef}>
        <div className="space-y-6 max-w-4xl mx-auto pb-28">
          {messages.length === 0 && (
            <div className="text-center py-16 px-4 max-w-xl mx-auto">
              <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto mb-6">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-200 tracking-tight mb-2">
                Analyze your dataset instantly
              </h3>
              <p className="text-xs text-zinc-400 mb-8 leading-relaxed">
                {hasData
                  ? "Enter questions in natural language. I can query data, perform statistical aggregations, filter subsets, and generate interactive charts."
                  : "Upload a CSV dataset in the panel first to start analyzing."}
              </p>

              {hasData && (
                <div className="flex flex-col gap-2.5">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-left mb-1.5 ml-1">
                    Suggested Exploration Questions
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2 text-left">
                    {exampleQuestions.map((question, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="text-xs justify-start py-5 px-4 rounded-xl border-zinc-900 bg-zinc-950/20 hover:bg-zinc-900/60 text-zinc-350 hover:text-zinc-200 text-left whitespace-normal h-auto leading-normal font-semibold transition-all duration-200"
                        onClick={() => setInput(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {messages.map((message, idx) => (
            <div
              key={message.id}
              className={`flex gap-3.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8.5 h-8.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Bot className="h-4.5 w-4.5" />
                </div>
              )}
              <div
                className={`min-w-0 ${message.role === 'user'
                    ? 'max-w-[85%] md:max-w-[70%] bg-indigo-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 shadow-md shadow-indigo-600/10 font-medium text-xs leading-relaxed'
                    : 'w-full max-w-full md:max-w-[90%] space-y-4'
                  }`}
              >
                <div className={message.role === 'assistant' ? 'text-xs text-zinc-200 leading-relaxed font-sans bg-zinc-950/20 border border-zinc-900 rounded-2xl p-4.5 shadow-sm' : ''}>
                  {message.content}
                </div>
                {message.queryResult && (
                  <ResultDisplay
                    result={message.queryResult}
                    question={
                      messages
                        .slice(0, idx)
                        .reverse()
                        .find((m) => m.role === 'user')?.content || ''
                    }
                    onRecommendationClick={handleQuerySubmit}
                  />
                )}
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8.5 h-8.5 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0">
                  <User className="h-4.5 w-4.5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3.5">
              <div className="flex-shrink-0 w-8.5 h-8.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 max-w-md">
                <ThinkingUI isThinking={isLoading} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area - Sticky at bottom */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-900/80 p-4 bg-zinc-950/80 backdrop-blur-md z-10 w-full shrink-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative flex items-center">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                hasData
                  ? "Ask a question about your data..."
                  : "Upload CSV files first to start asking questions..."
              }
              disabled={!hasData || isLoading}
              className="pr-14 min-h-[52px] max-h-[120px] resize-none bg-zinc-900/40 border-zinc-900 focus-visible:ring-1 focus-visible:ring-indigo-500/50 text-zinc-100 placeholder-zinc-500 rounded-2xl p-4 text-xs scrollbar-none"
              rows={1}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading || !hasData}
              className="absolute right-3 h-8.5 w-8.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 transition-all duration-200 shrink-0 active:scale-95 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
