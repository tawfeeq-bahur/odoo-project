'use client';

import { ChatBot } from '@/components/chat/ChatBot';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MessageCircle, Plane, MapPin, DollarSign, Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function DemoPage() {
  const { t } = useLanguage();
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side - ChatBot */}
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
              <Sparkles className="h-8 w-8 text-blue-500" />
              TourJet AI Demo
            </h1>
            <p className="text-muted-foreground">
              {t("Experience our AI-powered travel assistant")}
            </p>
          </div>
          
          <Card className="h-[600px]">
            <ChatBot />
          </Card>
        </div>

        {/* Right side - Features */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                {t("Chat Features")}
              </CardTitle>
              <CardDescription>
                {t("What makes our AI assistant special")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <Plane className="h-6 w-6 text-blue-500 mb-2" />
                  <h3 className="font-semibold">{t("Trip Planning")}</h3>
                  <p className="text-sm text-muted-foreground">{t("Detailed itineraries and recommendations")}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950">
                  <MapPin className="h-6 w-6 text-green-500 mb-2" />
                  <h3 className="font-semibold">{t("Destinations")}</h3>
                  <p className="text-sm text-muted-foreground">{t("Best places to visit and explore")}</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950">
                  <DollarSign className="h-6 w-6 text-purple-500 mb-2" />
                  <h3 className="font-semibold">{t("Budget Planning")}</h3>
                  <p className="text-sm text-muted-foreground">{t("Cost estimates and money-saving tips")}</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950">
                  <Clock className="h-6 w-6 text-orange-500 mb-2" />
                  <h3 className="font-semibold">{t("Timing")}</h3>
                  <p className="text-sm text-muted-foreground">{t("Best times to visit destinations")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("How to Chat")}</CardTitle>
              <CardDescription>
                {t("Simple and intuitive chat experience")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💬 {t("Pure Chat Interface")}</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t("No predefined questions - just type anything you want to know about travel and get instant, helpful responses!")}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">🎯 {t("Travel-Focused")}</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {t("Specialized in travel planning, destinations, budgeting, and tourism advice.")}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">⚡ {t("Instant Responses")}</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {t("Get detailed, formatted answers with practical travel information and tips.")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("How to Use")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 className="font-medium">{t("Type your question")}</h4>
                  <p className="text-sm text-muted-foreground">{t("Ask about destinations, planning, or travel tips")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 className="font-medium">{t("Press Enter or Send")}</h4>
                  <p className="text-sm text-muted-foreground">{t("Submit your question to get AI-powered responses")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 className="font-medium">{t("Get detailed answers")}</h4>
                  <p className="text-sm text-muted-foreground">{t("Receive comprehensive travel information and recommendations")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
