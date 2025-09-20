import { ChatBot } from '@/components/chat/ChatBot';
import { Card } from '@/components/ui/card';

export default function ChatPage() {
  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI Travel Assistant
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Chat with our AI assistant about anything travel-related. Get instant, helpful responses for your travel planning needs.
        </p>
      </div>
      
      <Card className="h-[700px] shadow-xl border-0 bg-gradient-to-br from-background to-muted/20">
        <ChatBot />
      </Card>
    </div>
  );
}
