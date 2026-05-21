'use client';

import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { ArrowLeft, Database, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col lg:flex-row relative overflow-hidden font-sans">
      
      {/* Form & Logo */}
      <div className="w-full flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 relative min-h-screen z-10 bg-zinc-950">
        
        {/* Back to Home Link */}
        <Link 
          href="/" 
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-100 transition-colors py-2 px-3.5 rounded-xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur-md shadow-sm hover:border-zinc-700/80 group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
          Back to Home
        </Link>

        {/* Ambient background glow for form on mobile */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none lg:hidden" />
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[25rem] h-[25rem] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none lg:hidden" />

        <div className="w-full max-w-[400px] flex flex-col gap-6 pt-12 lg:pt-0">

          {/* Clerk SignUp */}
          <SignUp
            path="/register"
            signInUrl="/login"
            appearance={{
              baseTheme: dark,
              variables: {
                colorPrimary: '#6366f1', // Indigo primary
                colorBackground: '#09090b', // zinc-950
                colorInputBackground: '#18181b', // zinc-900
                colorText: '#f4f4f5', // zinc-100
                colorTextSecondary: '#a1a1aa', // zinc-400
                colorInputText: '#f4f4f5',
                colorBorder: '#27272a', // zinc-800
                colorTextPlaceholder: '#71717a', // zinc-500 placeholder
              },
              elements: {
                card: '!border !border-zinc-800/80 !bg-zinc-950/80 backdrop-blur-md shadow-2xl rounded-2xl p-5 w-full',
                headerTitle: '!text-zinc-100 font-extrabold text-xl tracking-tight',
                headerSubtitle: '!text-zinc-400 text-xs mt-1',
                socialButtonsBlockButton: '!border-zinc-800/80 !bg-zinc-900/40 hover:!bg-zinc-800/50 !text-zinc-200 transition-colors py-2.5 rounded-xl text-xs font-semibold relative',
                socialButtonsBlockButtonText: '!text-zinc-200 font-semibold text-xs',
                socialButtonsBlockButtonArrow: '!text-zinc-400',
                formFieldLabel: '!text-zinc-300 font-semibold text-xs mb-1.5',
                formFieldInput: '!border-zinc-800 !bg-zinc-900/50 !text-zinc-100 placeholder:!text-zinc-500 rounded-xl py-2.5 px-3 focus:!border-indigo-500/50 transition-colors text-xs',
                formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 !text-white font-bold shadow-lg shadow-indigo-600/20 py-2.5 rounded-xl text-xs active:scale-[0.98] transition-all',
                footerActionText: '!text-zinc-400 text-xs',
                footerActionLink: '!text-indigo-400 hover:text-indigo-300 font-bold text-xs',
                dividerText: '!text-zinc-400 text-[10px] font-bold uppercase tracking-widest',
                dividerLine: 'bg-zinc-800/60',
                formFieldInfoText: '!text-zinc-400 text-[11px] mt-1',
                formFieldErrorText: '!text-rose-400 text-[11px] mt-1 font-semibold',
                identityPreviewText: '!text-zinc-200 text-xs',
                identityPreviewEditButton: '!text-indigo-400 hover:text-indigo-300 text-xs font-semibold',
                alert: 'bg-zinc-900 border border-zinc-800 rounded-xl p-3',
                alertText: '!text-zinc-200 text-xs',
                otpCodeFieldInput: '!border-zinc-800 !bg-zinc-900/30 !text-zinc-100 rounded-xl',
                badge: '!bg-indigo-500/20 !border !border-indigo-500/30 !text-indigo-300 font-bold text-[9px] py-0.5 px-2 rounded-md uppercase tracking-wider',
                branding: '!text-zinc-400 hover:!text-zinc-300 transition-colors text-[10px] [&>svg]:!fill-zinc-400 [&>svg]:hover:!fill-zinc-300',
                footerPageLink: '!text-zinc-400 hover:!text-zinc-300 transition-colors text-[10px]',
                developmentMode: '!text-amber-500/80 font-bold uppercase tracking-wider text-[9px] mt-1',
              },
            }}
          />
        </div>
        
        <p className="text-center text-xs text-zinc-500 mt-8 max-w-[320px]">
          By registering, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
