
'use client';

import { useSharedState } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LifeBuoy, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SupportPage() {
  const { user } = useSharedState();
  const { toast } = useToast();

  if (user?.role !== 'employee') {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This page is only available for employees.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
        title: "Message Sent!",
        description: "Your message has been sent to the admin. They will get back to you shortly."
    })
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Support & Help</h1>
        <p className="text-muted-foreground">Have an issue? Report it here and an admin will get back to you.</p>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LifeBuoy className="text-primary"/>
            Contact Support
          </CardTitle>
          <CardDescription>
            Fill out the form below to report a problem or ask a question.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="e.g., Issue with vehicle VAN-002" required />
            </div>

            <div className="space-y-1">
                <Label htmlFor="category">Category</Label>
                 <Select required>
                    <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="vehicle-issue">Vehicle Issue</SelectItem>
                        <SelectItem value="trip-issue">Trip Problem</SelectItem>
                        <SelectItem value="expense-issue">Expense Claim Issue</SelectItem>
                        <SelectItem value="payment-issue">Payment/Salary Inquiry</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Please describe the issue in detail..."
                className="min-h-[150px]"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              <Send className="mr-2" />
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
