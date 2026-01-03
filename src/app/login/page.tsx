

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useSharedState } from '@/components/AppLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Globe } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

const formSchema = z.object({
  username: z.string().min(1, { message: 'Username is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function LoginPage() {
  const { login } = useSharedState();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { username, password } = values;
    const success = login(username, password);

    if (!success) {
      setError('Invalid credentials. Try: Arun, Priya, or Ravi (password: 123)');
    } else {
      setError(null);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md border-2 shadow-2xl">
        <CardContent className="pt-12 pb-8 px-8">
          {/* Photo/Logo Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-6">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src="/logo-globe.png" alt="GlobeTrotter" />
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-blue-500 text-white text-3xl">
                  <Globe className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
            </div>
            <h1 className="text-3xl font-bold font-headline text-center mb-2">GlobeTrotter</h1>
            <p className="text-sm text-muted-foreground text-center">Empowering Personalized Travel Planning</p>
          </div>

          {/* Login Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Username Field */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Username"
                        className="h-12 px-4 text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Password"
                        className="h-12 px-4 text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="py-3">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="text-sm">Login Failed</AlertTitle>
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}

              {/* Login Button */}
              <Button type="submit" className="w-full h-12 text-base font-semibold">
                Login
              </Button>

              {/* Additional Links */}
              <div className="flex justify-between items-center text-sm mt-4">
                <button type="button" className="text-muted-foreground hover:text-primary transition-colors">
                  Forgot Password?
                </button>
                <Link href="/signup" className="text-primary hover:underline font-medium">
                  Sign Up
                </Link>
              </div>
            </form>
          </Form>

          {/* Demo Hint */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              <span className="font-semibold">Demo Accounts:</span> Arun, Priya, Ravi | Password: 123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
