
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useSharedState } from '@/components/AppLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Eye, EyeOff, Sparkles, CheckCircle2, Upload, Camera } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useLanguage } from '@/context/LanguageContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

// Signup form schema
const signupSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }),
  password: z.string().min(3, { message: 'Password must be at least 3 characters.' }),
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
});

export default function LoginPage() {
  const { login, signup } = useSharedState();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  // Panel state
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);

  // Auto-open signup panel if ?mode=signup is in URL
  useEffect(() => {
    if (searchParams.get('mode') === 'signup') {
      setIsRightPanelActive(true);
    }
  }, [searchParams]);

  // Login states
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup states
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  // Signup form
  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '', password: '', firstName: '', lastName: '', email: '', phone: '',
    },
  });

  function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoginLoading(true);
    const { username, password } = values;
    setTimeout(() => {
      const success = login(username, password);
      if (!success) {
        setLoginError('Invalid credentials. Try: Arun, Priya, or Ravi (password: 123)');
      } else {
        setLoginError(null);
      }
      setIsLoginLoading(false);
    }, 600);
  }

  function onSignupSubmit(values: z.infer<typeof signupSchema>) {
    setIsSignupLoading(true);
    const { username, password } = values;
    setTimeout(() => {
      const registered = signup(username, password);
      if (!registered) {
        setSignupError('Username already taken. Please choose a different username.');
        setSignupSuccess(false);
        setIsSignupLoading(false);
        return;
      }
      setSignupSuccess(true);
      setSignupError(null);
      setIsSignupLoading(false);
      setTimeout(() => {
        router.push('/onboarding');
      }, 1500);
    }, 600);
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const inputClass = "h-[48px] px-4 text-[14px] rounded-xl border-2 border-border/50 bg-muted/20 focus:bg-background focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder:text-muted-foreground/40 w-full";
  const labelClass = "text-[11px] font-semibold text-foreground/60 mb-1 block tracking-wider uppercase";

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 relative overflow-hidden" id="auth-page">
      {/* Theme Toggle */}
      <div className="fixed top-5 right-5 z-[200]">
        <ThemeToggle />
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md border-2 shadow-2xl">
        <CardContent className="pt-12 pb-8 px-8">
          {/* Photo/Logo Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-6">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src="/logo-globe.png" alt="TourJet" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-blue-500 text-white text-3xl">
                  <Globe className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* ============================= */}
        {/* SIGN IN FORM (left side, visible initially) */}
        {/* ============================= */}
        <div
          className={`absolute top-0 left-0 h-full w-1/2 flex items-center justify-center transition-all ease-in-out
            ${isRightPanelActive ? 'translate-x-full opacity-0 z-[1]' : 'z-[2]'}`}
          style={{ transitionDuration: '0.6s' }}
          id="signin-form-container"
        >
          <div className="w-full px-8 py-10 lg:px-12">
            <div className="max-w-[360px] mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-[28px] font-bold tracking-tight text-foreground mb-2">
                  {t("Welcome back")}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {t("Sign in to your TourJet account")}
                </p>
              </div>

              {/* Social login buttons */}
              <div className="flex justify-center gap-3 mb-6">
                {[
                  { icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z', label: 'Facebook' },
                  { icon: 'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z', label: 'Google' },
                  { icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z', label: 'LinkedIn' },
                ].map((social) => (
                  <button
                    key={social.label}
                    type="button"
                    className="h-10 w-10 rounded-full border-2 border-border/50 flex items-center justify-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group"
                    aria-label={`Sign in with ${social.label}`}
                  >
                    <svg className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="currentColor">
                      <path d={social.icon} />
                    </svg>
                  </button>
                ))}
              </div>

              <div className="text-center mb-5">
                <span className="text-xs text-muted-foreground/60">{t("or use your account")}</span>
              </div>

              {/* Login error */}
              {loginError && (
                <Alert variant="destructive" className="mb-4 py-2.5 rounded-xl animate-shake border-destructive/30 bg-destructive/5">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="text-sm font-semibold">{t("Login Failed")}</AlertTitle>
                  <AlertDescription className="text-xs opacity-90">{loginError}</AlertDescription>
                </Alert>
              )}

              {/* Login Form */}
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4" id="login-form">
                  <FormField control={loginForm.control} name="username" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          id="login-username"
                          placeholder={t("Username")}
                          className={inputClass}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs mt-1" />
                    </FormItem>
                  )} />

                  <FormField control={loginForm.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="login-password"
                            type={showLoginPassword ? 'text' : 'password'}
                            placeholder={t("Password")}
                            className={`${inputClass} pr-10`}
                            {...field}
                          />
                          <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors">
                            {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs mt-1" />
                    </FormItem>
                  )} />

                  <div className="text-right">
                    <button type="button" className="text-xs text-primary/80 hover:text-primary font-medium transition-colors" id="forgot-password-link">
                      {t("Forgot your password?")}
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoginLoading}
                    className="w-full h-[48px] text-sm font-bold rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 uppercase tracking-wider"
                    id="login-submit-btn"
                  >
                    {isLoginLoading ? (
                      <div className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>{t("Signing in...")}</span>
                      </div>
                    ) : t("Sign In")}
                  </Button>

                  {/* Demo hint */}
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-muted/30 border border-border/30 mt-3" id="demo-accounts-hint">
                    <div className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground/70">{t("Demo")}:</span>{' '}
                      Arun, Priya, Ravi &middot; {t("Password")}: 123
                    </p>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>

        {/* ============================= */}
        {/* OVERLAY CONTAINER (sliding panel with branding) */}
        {/* ============================= */}
        <div
          className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden z-[100] transition-transform ease-in-out
            ${isRightPanelActive ? '-translate-x-full' : ''}`}
          style={{ transitionDuration: '0.6s' }}
          id="overlay-container"
        >
          <div
            className={`relative h-full w-[200%] left-[-100%] transition-transform ease-in-out
              ${isRightPanelActive ? 'translate-x-1/2' : 'translate-x-0'}`}
            style={{ transitionDuration: '0.6s' }}
            id="overlay"
          >
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(24,85%,48%)] via-[hsl(20,78%,35%)] to-[hsl(16,72%,18%)] dark:from-[hsl(24,80%,40%)] dark:via-[hsl(20,70%,25%)] dark:to-[hsl(16,65%,10%)]" />

            {/* Animated mesh gradient */}
            <div className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `radial-gradient(ellipse at 20% 50%, hsla(32,90%,60%,0.4) 0%, transparent 50%),
                                  radial-gradient(ellipse at 80% 20%, hsla(24,85%,50%,0.3) 0%, transparent 50%),
                                  radial-gradient(ellipse at 50% 80%, hsla(16,75%,30%,0.4) 0%, transparent 50%)`,
              }}
            />

            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
              }}
            />

            {/* Floating orbs */}
            <div className="absolute top-[15%] left-[20%] w-40 h-40 rounded-full bg-white/[0.04] blur-3xl animate-float-slow" />
            <div className="absolute bottom-[20%] right-[15%] w-32 h-32 rounded-full bg-white/[0.06] blur-2xl animate-float-delayed" />

            {/* ===== LEFT overlay panel (shown when signup active) ===== */}
            <div
              className={`absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center px-10 text-center text-white transition-transform ease-in-out
                ${isRightPanelActive ? 'translate-x-0' : '-translate-x-[20%]'}`}
              style={{ transitionDuration: '0.6s' }}
              id="overlay-left"
            >
              {/* Logo */}
              <div className="flex items-center gap-2.5 mb-6">
                <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold tracking-tight">TourJet</h2>
                  <p className="text-white/50 text-[9px] tracking-[0.2em] uppercase font-medium">AI Travel Platform</p>
                </div>
              </div>

              {/* Hero image */}
              <div className="relative w-full max-w-[200px] mx-auto mb-6 group">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/[0.08] bg-white/[0.03]">
                  <Image
                    src="/LOGO-2-TOURJET_processed.png"
                    alt="Travel Adventure"
                    width={300}
                    height={250}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              </div>

              <h1 className="text-2xl font-bold mb-3 leading-tight">{t("Welcome Back!")}</h1>
              <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-[240px]">
                {t("Already have an account? Sign in to continue your journey.")}
              </p>
              <button
                onClick={() => {
                  setIsRightPanelActive(false);
                  setSignupError(null);
                  setSignupSuccess(false);
                }}
                className="px-8 py-2.5 rounded-xl border-2 border-white/40 text-white text-sm font-bold uppercase tracking-wider hover:bg-white/10 hover:border-white/60 transition-all duration-300 hover:scale-105 active:scale-95"
                id="switch-to-signin"
              >
                {t("Sign In")}
              </button>
            </div>

            {/* ===== RIGHT overlay panel (shown when signin active) ===== */}
            <div
              className={`absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center px-10 text-center text-white transition-transform ease-in-out
                ${isRightPanelActive ? 'translate-x-[20%]' : 'translate-x-0'}`}
              style={{ transitionDuration: '0.6s' }}
              id="overlay-right"
            >
              {/* Logo */}
              <div className="flex items-center gap-2.5 mb-6">
                <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold tracking-tight">TourJet</h2>
                  <p className="text-white/50 text-[9px] tracking-[0.2em] uppercase font-medium">AI Travel Platform</p>
                </div>
              </div>

              {/* Hero image */}
              <div className="relative w-full max-w-[200px] mx-auto mb-6 group">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/[0.08] bg-white/[0.03]">
                  <Image
                    src="/LOGO-2-TOURJET_processed.png"
                    alt="Travel Adventure"
                    width={300}
                    height={250}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              </div>

              <h1 className="text-2xl font-bold mb-3 leading-tight">{t("Hello, Friend!")}</h1>
              <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-[240px]">
                {t("Enter your details and start your adventure with us today.")}
              </p>
              <button
                onClick={() => {
                  setIsRightPanelActive(true);
                  setLoginError(null);
                }}
                className="px-8 py-2.5 rounded-xl border-2 border-white/40 text-white text-sm font-bold uppercase tracking-wider hover:bg-white/10 hover:border-white/60 transition-all duration-300 hover:scale-105 active:scale-95"
                id="switch-to-signup"
              >
                {t("Sign Up")}
              </button>

              {/* Feature pills */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {['AI-Powered', 'Smart Routes', '24/7 Support'].map((label) => (
                  <div key={label} className="px-3 py-1 rounded-full bg-white/[0.08] backdrop-blur-sm border border-white/10 text-white/60 text-[10px] font-medium tracking-wide">
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile view toggle (visible only on small screens) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] lg:hidden">
        <div className="flex gap-2 bg-card/90 backdrop-blur-md rounded-full p-1.5 shadow-xl border border-border/50">
          <button
            onClick={() => setIsRightPanelActive(false)}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300
              ${!isRightPanelActive ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t("Sign In")}
          </button>
          <button
            onClick={() => setIsRightPanelActive(true)}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300
              ${isRightPanelActive ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t("Sign Up")}
          </button>
        </div>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(15px) scale(0.95); }
        }
        .animate-shake { animation: shake 0.5s ease-out; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 10s ease-in-out infinite 2s; }

        @keyframes show {
          0%, 49.99% {
            opacity: 0;
            z-index: 1;
          }
          50%, 100% {
            opacity: 1;
            z-index: 5;
          }
        }
        .animate-show { animation: show 0.6s; }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.3);
        }

        /* Mobile responsive: show forms stacked on small screens */
        @media (max-width: 768px) {
          #auth-container {
            max-width: 100% !important;
            min-height: auto !important;
            border-radius: 16px !important;
          }
          #overlay-container {
            display: none !important;
          }
          #signin-form-container,
          #signup-form-container {
            position: relative !important;
            width: 100% !important;
            transform: none !important;
            transition: none !important;
          }
          #signin-form-container {
            display: ${isRightPanelActive ? 'none' : 'flex'} !important;
            opacity: 1 !important;
            z-index: 5 !important;
          }
          #signup-form-container {
            display: ${isRightPanelActive ? 'flex' : 'none'} !important;
            opacity: 1 !important;
            z-index: 5 !important;
          }
        }
      `}</style>
    </div>
  );
}
