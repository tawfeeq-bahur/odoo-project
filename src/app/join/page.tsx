

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSharedState } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { QrCode, LogIn, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const joinFormSchema = z.object({
  inviteCode: z.string().min(6, 'Invite code must be 6 characters').max(6, 'Invite code must be 6 characters'),
});

export default function JoinTripPage() {
  const { user, joinTour } = useSharedState();
  const { toast } = useToast();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof joinFormSchema>>({
    resolver: zodResolver(joinFormSchema),
    defaultValues: {
      inviteCode: '',
    },
  });

  if (!user) {
    return null; // Or a loading indicator
  }

  const onSubmit = (values: z.infer<typeof joinFormSchema>) => {
    setError(null);
    const success = joinTour(values.inviteCode);
    if (success) {
      toast({
        title: "Successfully Joined Tour!",
        description: "You've been added to the tour. Redirecting to your dashboard...",
      });
      router.push('/');
    } else {
      setError("Invalid invite code. Please check the code and try again.");
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-4">
            <QrCode className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Join a Tour</CardTitle>
          <CardDescription>Enter the 6-character invite code provided by the tour organizer.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="inviteCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invite Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ABCXYZ"
                        className="text-center font-mono tracking-widest text-lg h-12"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Join Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full">
                <LogIn className="mr-2" />
                Join Tour
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
