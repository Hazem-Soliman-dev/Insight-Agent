'use client';

import { useEffect, useState } from 'react';
import { Brain, Database, Code, Sparkles } from 'lucide-react';
import type { ThinkingStep } from '@/types';

interface ThinkingUIProps {
  isThinking: boolean;
}

const THINKING_STEPS: Omit<ThinkingStep, 'status'>[] = [
  { id: '1', label: 'Analyzing database schema' },
  { id: '2', label: 'Detecting table relationships' },
  { id: '3', label: 'Writing SQL query' },
  { id: '4', label: 'Executing query' },
];

export function ThinkingUI({ isThinking }: ThinkingUIProps) {
  const [steps, setSteps] = useState<ThinkingStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isThinking) {
      setSteps(
        THINKING_STEPS.map((step, idx) => ({
          ...step,
          status: idx === 0 ? 'active' : 'pending',
        }))
      );
      setCurrentStep(0);

      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < THINKING_STEPS.length - 1) {
            setSteps((prevSteps) =>
              prevSteps.map((step, idx) => ({
                ...step,
                status:
                  idx < prev + 1 ? 'complete' : idx === prev + 1 ? 'active' : 'pending',
              }))
            );
            return prev + 1;
          }
          return prev;
        });
      }, 800);

      return () => clearInterval(interval);
    } else {
      setSteps([]);
      setCurrentStep(0);
    }
  }, [isThinking]);

  if (!isThinking) return null;

  const getIcon = (stepId: string) => {
    switch (stepId) {
      case '1':
        return Database;
      case '2':
        return Brain;
      case '3':
        return Code;
      case '4':
        return Sparkles;
      default:
        return Brain;
    }
  };

  return (
    <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
      <div className="flex items-center gap-2 mb-3">
        <div className="relative">
          <Brain className="h-5 w-5 text-primary" />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-ping" />
        </div>
        <span className="font-medium text-sm">AI Agent is thinking...</span>
      </div>
      
      <div className="space-y-2">
        {steps.map((step) => {
          const Icon = getIcon(step.id);
          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                step.status === 'pending'
                  ? 'text-muted-foreground opacity-50'
                  : step.status === 'active'
                  ? 'text-primary'
                  : 'text-foreground'
              }`}
            >
              <div
                className={`relative flex items-center justify-center h-6 w-6 rounded-full transition-all duration-300 ${
                  step.status === 'complete'
                    ? 'bg-primary text-primary-foreground'
                    : step.status === 'active'
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="h-3 w-3" />
                {step.status === 'active' && (
                  <span className="absolute inset-0 rounded-full border-2 border-primary animate-pulse" />
                )}
              </div>
              <span className={step.status === 'active' ? 'font-medium' : ''}>
                {step.label}
                {step.status === 'active' && '...'}
                {step.status === 'complete' && ' ✓'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
