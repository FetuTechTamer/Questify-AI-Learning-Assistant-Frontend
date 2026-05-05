import { useState, useRef, useEffect } from "react";
import { ChatCircle, X, PaperPlaneTilt, Sparkle, CircleNotch } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export function AIAssistantButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI study assistant. How can I help you today? 📚",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.askQuesty({
        message: currentInput,
        session_id: sessionId || undefined
      });

      if (response.success) {
        const aiMessage: Message = {
          id: response.data.message_id,
          role: "assistant",
          content: response.data.response,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        
        // Save session ID for continued conversation
        if (!sessionId) {
          setSessionId(response.data.session_id);
        }
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      console.error("AI Assistant Error:", error);
      toast.error("Questy is having trouble connecting. Please try again.");
      
      // Fallback message
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again in a moment! 🧠💤",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-primary shadow-glow",
          "flex items-center justify-center transition-all duration-300 hover:scale-110",
          "animate-pulse-slow",
          isOpen && "opacity-0 pointer-events-none"
        )}
      >
        <Sparkle className="w-6 h-6 text-primary-foreground" weight="fill" />
      </button>

      {/* Chat Panel */}
      <div
        className={cn(
          "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 h-[80vh] sm:h-[500px] max-h-[600px] rounded-2xl overflow-hidden",
          "glass border shadow-2xl flex flex-col",
          "transition-all duration-300 transform origin-bottom-right",
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="p-4 gradient-primary flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center border border-white/10">
              <Sparkle className="w-5 h-5 text-primary-foreground" weight="fill" />
            </div>
            <div>
              <h3 className="font-bold text-primary-foreground text-sm tracking-tight">Questy AI</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <p className="text-[10px] text-primary-foreground/70 font-medium">Study Partner Online</p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 rounded-full"
          >
            <X className="w-4 h-4" weight="bold" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 bg-background/20 backdrop-blur-sm">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col",
                  message.role === "user" ? "items-end" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-xs md:text-sm shadow-sm",
                    message.role === "user"
                      ? "gradient-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md border border-border/50"
                  )}
                >
                  {message.content}
                </div>
                {message.timestamp && (
                  <span className="text-[9px] text-muted-foreground mt-1 px-1">{message.timestamp}</span>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2.5 border border-border/50">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t bg-background/80 backdrop-blur-md">
          <div className="flex gap-2">
            <Input
              placeholder="Ask Questy anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 h-10 text-xs md:text-sm bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSend} 
              size="icon" 
              className="gradient-primary h-10 w-10 shrink-0 shadow-lg shadow-primary/20"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <CircleNotch className="w-4 h-4 animate-spin" weight="bold" />
              ) : (
                <PaperPlaneTilt className="w-4 h-4" weight="bold" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
