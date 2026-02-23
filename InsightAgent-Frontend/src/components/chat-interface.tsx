'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThinkingUI } from './thinking-ui';
import { ResultDisplay } from './result-display';
import { agentApi } from '@/lib/api';
import type { Message, QueryResult } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface ChatInterfaceProps {
  projectId: string;
  hasData: boolean;
}

export function ChatInterface({ projectId, hasData }: ChatInterfaceProps) {
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
    } catch (error) {
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: error instanceof Error ? error.message : 'An error occurred while processing your query.',
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
    <div className="flex flex-col min-h-full relative">
      {/* Messages Area */}
      <div className="flex-1 p-4">
        <div className="space-y-4 max-w-6xl mx-auto" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-lg font-semibold mb-2">
                Ask questions about your data
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {hasData
                  ? "I can analyze your data, find patterns, and create visualizations. Try asking a question!"
                  : "Upload some CSV files first to start analyzing your data."}
              </p>
              {hasData && (
                <div className="flex flex-wrap justify-center gap-2">
                  {exampleQuestions.map((question, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setInput(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`min-w-0 ${
                  message.role === 'user'
                    ? 'max-w-[85%] md:max-w-[75%] bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2'
                    : 'w-full max-w-full md:max-w-[85%] space-y-3'
                }`}
              >
                <div className={message.role === 'assistant' ? 'text-sm' : ''}>
                  {message.content}
                </div>
                {message.queryResult && (
                  <ResultDisplay 
                    result={message.queryResult} 
                    onRecommendationClick={handleQuerySubmit}
                  />
                )}
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 max-w-md">
                <ThinkingUI isThinking={isLoading} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area - Sticky at bottom */}
      <div className="sticky bottom-0 border-t p-4 bg-background/95 backdrop-blur-sm z-10 w-full shrink-0 mt-auto">
        <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                hasData
                  ? "Ask a question about your data..."
                  : "Upload CSV files to start asking questions..."
              }
              disabled={!hasData || isLoading}
              className="pr-12 min-h-[52px] max-h-[100px] resize-none"
              rows={1}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading || !hasData}
              className="absolute right-2 bottom-2"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
