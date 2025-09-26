'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, AlertTriangle, ScanText, LoaderCircle, Text, Languages } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { extractTextFromImage, TransliterationOutput } from '@/ai/flows/transliteration';
import { Textarea } from '@/components/ui/textarea';
import { Copy } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';


const indianLanguages = [
    "English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Bengali", 
    "Gujarati", "Marathi", "Odia", "Punjabi", "Urdu", "Assamese", 
    "Bodo", "Dogri", "Kashmiri", "Konkani", "Maithili", "Meitei (Manipuri)", 
    "Nepali", "Sanskrit", "Santali", "Sindhi"
];


export default function TransliterationPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TransliterationOutput | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<string>("English");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!imagePreview) {
      toast({
        title: 'No Image Selected',
        description: 'Please select an image to extract text from.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await extractTextFromImage({ 
          photoDataUri: imagePreview,
          targetLanguage: targetLanguage
      });
      if (analysisResult.extractedText) {
        setResult(analysisResult);
        toast({
          title: 'Text Extracted & Transliterated',
          description: `The text has been processed into ${targetLanguage}.`,
        });
      } else {
        setError('No text could be identified in the image. Please try a clearer picture.');
      }
    } catch (err) {
      setError('An unexpected error occurred during analysis. The AI model may be temporarily unavailable.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
    if (result?.extractedText) {
      navigator.clipboard.writeText(result.extractedText);
      toast({
        title: "Copied!",
        description: "The transliterated text has been copied to your clipboard.",
      });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2"><Languages /> Transliteration</h1>
        <p className="text-muted-foreground">
          Extract and transliterate text from any image into one of the 22 official Indian languages.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-8">
            <Card>
              <CardHeader>
                  <CardTitle>1. Upload Image & Select Language</CardTitle>
                  <CardDescription>Choose an image and the target language for transliteration.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div
                    className="relative aspect-video w-full border-2 border-dashed border-muted-foreground/50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                  {imagePreview ? (
                      <Image src={imagePreview} alt="Text image preview" layout="fill" objectFit="contain" className="rounded-md" />
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

                  <div>
                    <Label htmlFor="language-select">Target Language</Label>
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                        <SelectTrigger id="language-select">
                            <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                        <SelectContent>
                            {indianLanguages.map(lang => (
                                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>


                  <Button onClick={handleAnalyzeClick} disabled={isLoading || !imageFile} className="w-full">
                  {isLoading ? (
                      <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                      </>
                  ) : (
                      <>
                      <ScanText className="mr-2 h-4 w-4" />
                      Extract & Transliterate
                      </>
                  )}
                  </Button>
              </CardContent>
            </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>2. Transliterated Text</CardTitle>
            <CardDescription>The text from the image, transliterated into <span className="font-bold">{targetLanguage}</span>, will appear below.</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            {isLoading && <ResultsSkeleton />}

            {error && (
              <Alert variant="destructive" className="h-full">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Analysis Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!isLoading && !error && !result && (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
                <Text className="mx-auto h-12 w-12" />
                <p>The result will appear here after analysis.</p>
              </div>
            )}
            
            {result && (
                <div className="relative">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={handleCopy}
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                    <Textarea
                        readOnly
                        value={result.extractedText}
                        className="w-full h-96 bg-muted text-base"
                    />
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
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-1/2" />
    </div>
);
