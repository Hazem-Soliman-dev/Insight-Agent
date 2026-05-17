'use client';

import { SignUp } from '@clerk/nextjs';
import { Brain } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
          <Brain className="h-7 w-7 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-2xl">InsightAgent</h1>
          <p className="text-xs text-muted-foreground">Agentic Business Intelligence</p>
        </div>
      </div>

      {/* Clerk SignUp */}
      <SignUp
        path="/register"
        signInUrl="/login"
        appearance={{
          variables: {
            colorPrimary: '#6366f1', // Indigo primary
            colorBackground: '#09090b', // zinc-950
            colorInputBackground: '#18181b', // zinc-900
            colorText: '#f4f4f5', // zinc-100
            colorTextSecondary: '#a1a1aa', // zinc-400
            colorInputText: '#f4f4f5',
            colorBorder: '#27272a', // zinc-800
          },
          elements: {
            card: 'border border-zinc-800 shadow-2xl bg-zinc-950',
            headerTitle: 'text-zinc-100 font-bold',
            headerSubtitle: 'text-zinc-400',
            socialButtonsBlockButton: 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-100',
            socialButtonsBlockButtonText: 'text-zinc-100 font-medium',
            formFieldLabel: 'text-zinc-300 font-medium',
            formFieldInput: 'border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-indigo-500',
            formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg',
            footerActionText: 'text-zinc-400',
            footerActionLink: 'text-indigo-400 hover:text-indigo-300 font-semibold',
            dividerText: 'text-zinc-500',
            dividerLine: 'bg-zinc-800',
          },
        }}
      />

      <p className="text-center text-xs text-muted-foreground mt-8">
        By registering, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}
