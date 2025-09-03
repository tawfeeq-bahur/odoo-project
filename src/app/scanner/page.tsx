
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, AlertTriangle, ScanLine, PlusCircle, LoaderCircle, CheckCircle, XCircle, DollarSign, Calendar, Fuel, Milestone, Truck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useSharedState } from '@/components/AppLayout';
import { parseExpense, ExpenseParserOutput } from '@/ai/flows/expense-parser';
import { Badge } from '@/components/ui/badge';

type ParsedExpense = ExpenseParserOutput['expenses'][0];

export default function ScannerPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedExpenses, setParsedExpenses] = useState<ParsedExpense[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { addExpense } = useSharedState();

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
      setError('An error occurred during analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddExpense = (expense: ParsedExpense) => {
    addExpense({
      ...expense,
      id: new Date().toISOString()
    })
    toast({
      title: "Expense Added",
      description: `A ${expense.type} expense of $${expense.amount.toFixed(2)} has been logged.`
    })
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Expense Scanner</h1>
        <p className="text-muted-foreground">Upload an image of a bill or receipt to automatically log trip expenses.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>1. Upload Bill</CardTitle>
            <CardDescription>Choose a clear photo of your receipt.</CardDescription>
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
            <CardTitle>2. Review & Add Expenses</CardTitle>
            <CardDescription>Review the expenses found and add them to your trip log.</CardDescription>
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
                <p>Results will appear here after analysis.</p>
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
                         {exp.type === "Maintenance" && <Truck className="w-5 h-5 text-primary" />}
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
