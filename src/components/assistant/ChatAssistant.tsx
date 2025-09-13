"use client";

import { useState, useRef, useEffect } from "react";
import { CornerDownLeft, Bot, User, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
// import { medicationAssistant } from "@/ai/flows/medication-assistant";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMessage } from "@/lib/types";

export function ChatAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await medicationAssistant({ query: input });
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: result.response,
        disclaimer: result.disclaimer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-[calc(100vh-20rem)] md:h-[calc(100vh-16rem)]" ref={scrollAreaRef}>
            <div className="p-4 md:p-6 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <Bot className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium">Welcome to your AI Medication Assistant</p>
                  <p>Ask me anything about your medications. For example: "What are the side effects of Metformin?"</p>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-4 ${
                    message.role === "user" ? "justify-end" : ""
                  }`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 border">
                      <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-4 w-4"/></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`rounded-lg p-3 max-w-lg ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.disclaimer && (
                      <div className="mt-3 pt-2 border-t border-border/50 text-xs text-muted-foreground flex items-start gap-2">
                        <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0" />
                        <p>{message.disclaimer}</p>
                      </div>
                    )}
                  </div>
                  {message.role === "user" && (
                     <Avatar className="h-8 w-8 border">
                      <AvatarFallback><User className="h-4 w-4"/></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-start gap-4">
                    <Avatar className="h-8 w-8 border">
                      <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-4 w-4"/></AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 bg-muted space-y-2 max-w-sm">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 border-t">
          <form
            onSubmit={handleSendMessage}
            className="flex w-full items-center space-x-2"
          >
            <Input
              id="message"
              placeholder="Ask about your medication..."
              className="flex-1"
              autoComplete="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <CornerDownLeft className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
