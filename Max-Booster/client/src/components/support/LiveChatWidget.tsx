import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  message: string;
  isAI: boolean;
  isStaff: boolean;
  createdAt: Date;
}

/**
 * TODO: Add function documentation
 */
export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadChatHistory();
    }
  }, [isOpen]);

  const loadChatHistory = async () => {
    try {
      const response = await fetch('/api/support/ai/history', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          const historyMessages: Message[] = data.messages.map((msg: any) => ({
            id: msg.id,
            message: msg.message,
            isAI: msg.isAI,
            isStaff: msg.isStaff,
            createdAt: new Date(msg.createdAt),
          }));
          setMessages(historyMessages);
          return;
        }
      }

      const welcomeMessage: Message = {
        id: 'welcome',
        message:
          "Hi! I'm your AI assistant. How can I help you today? Ask me anything about Max Booster!",
        isAI: true,
        isStaff: false,
        createdAt: new Date(),
      };
      setMessages([welcomeMessage]);
    } catch (error: unknown) {
      logger.error('Error loading chat history:', error);
      const welcomeMessage: Message = {
        id: 'welcome',
        message:
          "Hi! I'm your AI assistant. How can I help you today? Ask me anything about Max Booster!",
        isAI: true,
        isStaff: false,
        createdAt: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      message: inputMessage,
      isAI: false,
      isStaff: false,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/support/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: inputMessage,
          sessionId: sessionId,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: 'Authentication Required',
            description: 'Please log in to use the AI assistant.',
            variant: 'destructive',
          });
          return;
        }
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        message: data.answer,
        isAI: true,
        isStaff: false,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (data.suggestedArticles && data.suggestedArticles.length > 0) {
        const articlesMessage: Message = {
          id: `articles-${Date.now()}`,
          message: `Here are some helpful articles:\n\n${data.suggestedArticles
            .slice(0, 3)
            .map((a: unknown) => `• ${a.title}`)
            .join('\n')}`,
          isAI: true,
          isStaff: false,
          createdAt: new Date(),
        };
        setTimeout(() => {
          setMessages((prev) => [...prev, articlesMessage]);
        }, 500);
      }
    } catch (error: unknown) {
      logger.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card
      className={`fixed ${isMinimized ? 'bottom-6' : 'bottom-6'} right-6 w-96 shadow-2xl z-50 transition-all ${isMinimized ? 'h-14' : 'h-[600px]'}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          {isMinimized ? 'Chat' : 'Live Support'}
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[calc(100%-60px)]">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.isAI ? 'justify-start' : 'justify-end'}`}
                >
                  {msg.isAI && (
                    <Avatar className="h-8 w-8 bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 ${
                      msg.isAI ? 'bg-muted text-foreground' : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {!msg.isAI && (
                    <Avatar className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </Avatar>
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
              />
              <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
