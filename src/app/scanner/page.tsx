
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, AlertTriangle, ScanLine, PlusCircle, LoaderCircle, CheckCircle, XCircle, DollarSign, Calendar, Fuel, Milestone, Wrench, HeartPulse, Send } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useSharedState } from '@/components/AppLayout';
import { parseExpense, ExpenseParserOutput } from '@/ai/flows/expense-parser';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

type ParsedExpense = ExpenseParserOutput['expenses'][0];

const manualExpenseSchema = z.object({
  type: z.enum(["Fuel", "Toll", "Maintenance", "Health", "Travel Allowance", "Other"]),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0."),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'A valid date is required.' }),
});

export default function ScannerPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedExpenses, setParsedExpenses] = useState<ParsedExpense[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { addExpense, user } = useSharedState();

  const form = useForm<z.infer<typeof manualExpenseSchema>>({
    resolver: zodResolver(manualExpenseSchema),
    defaultValues: {
      type: "Fuel",
      amount: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setParsedExpenses(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!imagePreview) {
      toast({
        title: 'No Image Selected',
        description: 'Please select an image of your bill or receipt first.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setParsedExpenses(null);

    try {
      const result = await parseExpense({ photoDataUri: imagePreview });
      if (result.expenses && result.expenses.length > 0) {
        setParsedExpenses(result.expenses);
        toast({
          title: 'Analysis Complete',
          description: `${result.expenses.length} expense(s) found.`,
        });
      } else {
        setError('No expenses could be identified in the image. Please try a clearer picture.');
      }
    } catch (err) {
      setError('An unexpected error occurred during analysis. The AI model may be temporarily unavailable.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleAddExpense = (expense: ParsedExpense) => {
    addExpense({
      ...expense,
      tripId: user?.role === 'employee' ? user.assignedVehicleId : undefined,
    });
    toast({
      title: 'Expense Added!',
      description: `The ${expense.type} expense of $${expense.amount.toFixed(2)} has been logged for approval.`,
    });
    setParsedExpenses(prev => prev ? prev.filter(e => e !== expense) : null);
  };
  
  const handleManualSubmit = (values: z.infer<typeof manualExpenseSchema>) => {
    addExpense({
      ...values,
      tripId: user?.role === 'employee' ? user.assignedVehicleId : undefined,
    });
    toast({
      title: "Expense Logged",
      description: `Your ${values.type} expense of $${values.amount.toFixed(2)} has been submitted for approval.`
    });
    form.reset();
    form.setValue('date', format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Log an Expense</h1>
        <p className="text-muted-foreground">Upload a receipt for automatic scanning or enter an expense manually.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-8">
            <Card>
            <CardHeader>
                <CardTitle>1. Scan a Receipt</CardTitle>
                <CardDescription>Choose a clear photo of your receipt for AI-powered scanning.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div
                className="relative aspect-video w-full border-2 border-dashed border-muted-foreground/50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/50"
                onClick={() => fileInputRef.current?.click()}
                >
                {imagePreview ? (
                    <Image src={imagePreview} alt="Receipt preview" layout="fill" objectFit="contain" className="rounded-md" data-ai-hint="receipt bill" />
                ) : (
                    <div className="text-center text-muted-foreground">
                    <Upload className="mx-auto h-12 w-12" />
                    <p>Click to upload or drag & drop</p>
                    </div>
                )}
                </div>
                <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                />
                <Button onClick={handleAnalyzeClick} disabled={isLoading || !imageFile} className="w-full">
                {isLoading ? (
                    <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                    </>
                ) : (
                    <>
                    <ScanLine className="mr-2 h-4 w-4" />
                    Analyze Expense
                    </>
                )}
                </Button>
            </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>2. Enter Expense Manually</CardTitle>
                    <CardDescription>If you don't have a receipt, you can add your expense details here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleManualSubmit)} className="space-y-4">
                             <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Expense Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an expense type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Fuel">Fuel</SelectItem>
                                                <SelectItem value="Toll">Toll</SelectItem>
                                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                                                <SelectItem value="Health">Health</SelectItem>
                                                <SelectItem value="Travel Allowance">Travel Allowance</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" placeholder="e.g., 25.50" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <Send className="mr-2"/> Submit Expense
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>3. Review & Add Scanned Expenses</CardTitle>
            <CardDescription>Review the expenses found by the AI and add them to your trip log.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && <ResultsSkeleton />}

            {error && (
              <Alert variant="destructive" className="h-full">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Analysis Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!isLoading && !error && !parsedExpenses && (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <p>Scanned results will appear here after analysis.</p>
              </div>
            )}
            
            {parsedExpenses && (
              <div className="space-y-3">
                {parsedExpenses.map((exp, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-muted rounded-md">
                         {exp.type === "Fuel" && <Fuel className="w-5 h-5 text-primary" />}
                         {exp.type === "Toll" && <Milestone className="w-5 h-5 text-primary" />}
                         {exp.type === "Maintenance" && <Wrench className="w-5 h-5 text-primary" />}
                         {exp.type === "Health" && <HeartPulse className="w-5 h-5 text-primary" />}
                       </div>
                       <div>
                         <div className="font-semibold flex items-center gap-2">
                           <Badge variant="outline">{exp.type}</Badge>
                         </div>
                         <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                           <DollarSign className="w-3 h-3" /> ${exp.amount.toFixed(2)}
                           <Calendar className="w-3 h-3 ml-2" /> {exp.date}
                         </p>
                       </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleAddExpense(exp)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const ResultsSkeleton = () => (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <Skeleton className="h-9 w-20" />
        </div>
      ))}
    </div>
);
