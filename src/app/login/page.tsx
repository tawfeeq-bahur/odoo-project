
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useSharedState } from '@/components/AppLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Truck } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const formSchema = z.object({
  username: z.string().min(1, { message: 'Username or Plate Number is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
  adminCode: z.string().optional(),
}).refine((data) => {
  // If username is 'admin', adminCode is required
  if (data.username.toLowerCase() === 'admin') {
    return data.adminCode && data.adminCode.length === 6 && /^\d{6}$/.test(data.adminCode);
  }
  return true;
}, {
  message: "Admin code must be exactly 6 digits",
  path: ["adminCode"],
});

export default function LoginPage() {
  const { login } = useSharedState();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
      adminCode: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { username, password, adminCode } = values;

    const success = login(username, password, adminCode);

    if (!success) {
        if (username.toLowerCase() === 'admin') {
            setError('Invalid admin credentials. Please check your username, password, and 6-digit admin code.');
        } else {
            setError('Invalid credentials. Please check your username/plate number and password.');
        }
    } else {
        setError(null);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
          <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-4">
            <Truck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline">Welcome to FleetFlow</CardTitle>
          <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username / Plate Number</FormLabel>
                    <FormControl>
                      <Input placeholder="admin or e.g., TRK-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch('username').toLowerCase() === 'admin' && (
                <FormField
                  control={form.control}
                  name="adminCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Code (6 digits)</FormLabel>
                      <FormControl>
                        <Input 
                          type="text" 
                          placeholder="123456" 
                          maxLength={6}
                          {...field}
                          onChange={(e) => {
                            // Only allow digits
                            const value = e.target.value.replace(/\D/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Login Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
