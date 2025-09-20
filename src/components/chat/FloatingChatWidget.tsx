'use client';

import { useState } from 'react';
import { MessageCircle, X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChatBot } from './ChatBot';

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleChat = () => {
    if (isOpen) {
      setIsMinimized(!isMinimized);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={toggleChat}
            size="lg"
            className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group"
          >
            <MessageCircle className="h-7 w-7 group-hover:rotate-12 transition-transform duration-300" />
            <div className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce">
              AI
            </div>
          </Button>
        </div>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Card className={`w-[420px] h-[600px] shadow-2xl transition-all duration-300 ${
            isMinimized ? 'h-16' : ''
          }`}>
            {isMinimized ? (
              <div className="flex items-center justify-between p-4 h-full">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium">TourJet AI</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMinimized(false)}
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeChat}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">TourJet AI</h3>
                      <p className="text-xs text-muted-foreground">Online</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMinimized(true)}
                    >
                      <Minimize2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={closeChat}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1">
                  <ChatBot />
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
