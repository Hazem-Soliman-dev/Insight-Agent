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
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isThinking) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < THINKING_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isThinking]);

  if (!isThinking) return null;

  const steps: ThinkingStep[] = THINKING_STEPS.map((step, idx) => {
    let status: ThinkingStep['status'] = 'pending';
    if (idx < currentStep) {
      status = 'complete';
    } else if (idx === currentStep) {
      status = 'active';
    }
    return { ...step, status };
  });

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
    <div className="p-5 rounded-2xl bg-zinc-900/40 backdrop-blur-md border border-white/5 shadow-xl shadow-black/10">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="relative flex items-center justify-center">
          <Brain className="h-5 w-5 text-indigo-400 animate-pulse" />
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
        </div>
        <span className="font-extrabold text-xs text-zinc-200 uppercase tracking-widest">AI Agent Processing</span>
      </div>
      
      <div className="space-y-3">
        {steps.map((step) => {
          const Icon = getIcon(step.id);
          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 text-xs transition-all duration-300 ${
                step.status === 'pending'
                  ? 'text-zinc-500 opacity-40 font-semibold'
                  : step.status === 'active'
                  ? 'text-indigo-400 font-extrabold'
                  : 'text-zinc-300 font-bold'
              }`}
            >
              <div
                className={`relative flex items-center justify-center h-6.5 w-6.5 rounded-xl transition-all duration-300 border ${
                  step.status === 'complete'
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                    : step.status === 'active'
                    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                    : 'bg-zinc-950/40 border-zinc-900 text-zinc-500'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {step.status === 'active' && (
                  <span className="absolute inset-0 rounded-xl border border-indigo-400 animate-pulse" />
                )}
              </div>
              <span className="tracking-wide">
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
