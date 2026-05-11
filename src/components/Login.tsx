import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import logo from '../assets/logo.svg';

interface LoginProps {
  onLogin: () => void;
  isDesktop?: boolean;
}

export function Login({ onLogin, isDesktop = false }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email) {
      setError('Email address is required.');
      return;
    }
    
    if (!email.includes('@')) {
      setError('Please enter a valid work email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    // Mock login delay
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background p-6 md:p-8 md:items-center md:justify-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[400px] flex flex-col"
      >
        <div className="flex flex-col items-center mb-6 md:mb-12 text-center">
          <img src={logo} alt="Pulse By Teragon Logo" className="h-6 md:h-12 w-auto mb-6 md:mb-10" />
          <h1 className="text-2xl md:text-4xl font-bold text-foreground tracking-tight mb-1">Sign in</h1>
          <p className="text-muted-foreground font-medium text-sm md:text-lg">Use your work account to continue.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 md:space-y-6">
          <div className="space-y-1">
            <label className={`text-[10px] md:text-[13px] font-bold ml-0.5 uppercase tracking-wider transition-colors ${error && error.includes('Email') ? 'text-destructive' : 'text-foreground/40'}`}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              placeholder="name@company.com"
              className={`w-full bg-muted/10 border rounded-lg md:rounded-2xl py-2.5 px-4 md:py-4 md:px-5 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 transition-all font-medium text-sm md:text-base ${
                error && error.includes('Email')
                  ? 'border-destructive border-2 focus:ring-destructive/20 focus:border-destructive' 
                  : 'border-foreground/20 focus:ring-foreground/20 focus:border-foreground'
              }`}
            />
            <AnimatePresence>
              {error && error.includes('Email') && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-[10px] md:text-[12px] font-bold text-destructive ml-1 mt-1.5 flex items-center gap-1"
                >
                  <span className="w-1 h-1 bg-destructive rounded-full" />
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center px-0.5">
              <label className={`text-[10px] md:text-[13px] font-bold uppercase tracking-wider transition-colors ${error && error.includes('password') ? 'text-destructive' : 'text-foreground/40'}`}>
                Password
              </label>
              <button type="button" className="text-[10px] md:text-[13px] font-bold text-foreground hover:opacity-60 underline transition-opacity underline-offset-2">Forgot?</button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              placeholder="••••••••"
              className={`w-full bg-muted/10 border rounded-lg md:rounded-2xl py-2.5 px-4 md:py-4 md:px-5 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 transition-all font-medium text-sm md:text-base ${
                error && error.includes('password')
                  ? 'border-destructive border-2 focus:ring-destructive/20 focus:border-destructive' 
                  : 'border-foreground/20 focus:ring-foreground/20 focus:border-foreground'
              }`}
            />
            <AnimatePresence>
              {error && error.includes('password') && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-[10px] md:text-[12px] font-bold text-destructive ml-1 mt-1.5 flex items-center gap-1"
                >
                  <span className="w-1 h-1 bg-destructive rounded-full" />
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground font-bold py-3 md:py-4 rounded-lg md:rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/5 mt-1"
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                </motion.div>
              ) : (
                <motion.span
                  key="normal"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm md:text-lg"
                >
                  Continue
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </form>

        <div className="mt-6 md:mt-12 text-center">
          <p className="text-xs md:text-sm text-muted-foreground font-medium">
            Need access? <button className="text-foreground font-bold hover:underline underline-offset-2">Request account</button>
          </p>
        </div>

        <div className="mt-auto md:mt-16 pt-6 md:pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 opacity-40">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">© 2026 Teragon Systems</span>
          <div className="flex gap-5">
            <button className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest">Privacy</button>
            <button className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest">Terms</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
