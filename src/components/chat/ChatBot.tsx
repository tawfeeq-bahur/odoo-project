'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Copy, ThumbsUp, ThumbsDown, RotateCcw, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import type { ChatMessage } from '@/lib/types';

interface ChatBotProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function ChatBot({ className = '', isOpen = true, onClose }: ChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping]);

  // Auto-scroll when component mounts or messages change
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
          top: scrollAreaRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    };
    
    scrollToBottom();
  }, [messages, isTyping]);

  // Focus input when component opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { 
      role: 'user', 
      content: input.trim(),
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: userMessage.content,
          context: 'TourJet Travel Assistant'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Add the assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp || new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or check your connection.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied!',
      description: 'Message copied to clipboard',
    });
  };

  const handleClearChat = () => {
    setMessages([]);
    toast({
      title: 'Chat cleared',
      description: 'All messages have been cleared',
    });
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Removed predefined questions - pure chat interface

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <Sparkles className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background"></div>
            </div>
            <div>
              <CardTitle className="text-lg">TourJet AI</CardTitle>
              <p className="text-sm text-muted-foreground">Your travel planning assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleNewChat}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  New Chat
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleClearChat}>
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Clear Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                ×
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-0">
        <ScrollArea ref={scrollAreaRef} className="h-[400px] p-4">
          <div className="space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <div className="max-w-md">
                    <h3 className="text-xl font-semibold mb-3 text-foreground">Welcome to TourJet AI!</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      I'm your personal travel planning assistant. Ask me anything about travel, destinations, planning, or tourism - I'm here to help!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[85%] ${message.role === 'user' ? 'order-first' : ''}`}>
                  <div
                    className={`rounded-2xl px-5 py-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto shadow-lg'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content.split('\n').map((line, index) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return (
                            <div key={index} className={`font-bold text-base mb-2 ${
                              message.role === 'user' ? 'text-white' : 'text-gray-900 dark:text-white'
                            }`}>
                              {line.replace(/\*\*/g, '')}
                            </div>
                          );
                        }
                        if (line.startsWith('• ')) {
                          return (
                            <div key={index} className="flex items-start gap-2 mb-1">
                              <span className={`font-bold mt-1 ${
                                message.role === 'user' ? 'text-blue-100' : 'text-blue-500'
                              }`}>•</span>
                              <span>{line.substring(2)}</span>
                            </div>
                          );
                        }
                        if (line.trim() === '') {
                          return <br key={index} />;
                        }
                        return (
                          <div key={index} className="mb-2">
                            {line}
                          </div>
                        );
                      })}
                    </div>
                    {message.timestamp && (
                      <div className={`text-xs mt-3 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                  
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-1 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleCopyMessage(message.content)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* Loading State */}
            {isLoading && !isTyping && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-32" />
                    <span className="text-xs text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">AI is typing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Input Area */}
      <CardFooter className="p-6 border-t bg-gradient-to-r from-muted/50 to-muted/30">
        <form onSubmit={handleSendMessage} className="flex w-full gap-4">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here... Ask me anything about travel!"
              className="pr-14 h-14 rounded-2xl border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-base shadow-sm"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-105 transition-all duration-200 shadow-lg"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
        <div className="text-xs text-muted-foreground text-center mt-2">
          Press Enter to send • Shift+Enter for new line
        </div>
      </CardFooter>
    </div>
  );
}
