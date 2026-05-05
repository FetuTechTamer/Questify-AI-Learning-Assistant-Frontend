import React, { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  PaperPlaneRight,
  Sparkle,
  BookOpen,
  Brain,
  Target,
  TrendUp,
  Trash,
  Clock,
  User,
  Robot,
  CircleNotch,
  ChatCircle,
  Paperclip,
  Microphone,
  List
} from '@phosphor-icons/react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from "framer-motion";
import { cn, getAvatarUrl } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useMaterial } from "@/contexts/MaterialContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { chatService, ChatSession, ChatMessage } from "@/services/chatService";
import { toast } from "sonner";

const suggestedPrompts = [
  {
    icon: BookOpen,
    title: "Explain Concept",
    prompt: "Can you explain the core concepts of this material in simple terms?",
    color: "bg-blue-500/10 text-blue-500"
  },
  {
    icon: Brain,
    title: "Study Strategy",
    prompt: "What's the best way to study this collection effectively?",
    color: "bg-violet-500/10 text-violet-500"
  },
  {
    icon: Target,
    title: "Key Takeaways",
    prompt: "What are the most important points I should remember from this?",
    color: "bg-orange-500/10 text-orange-500"
  },
  {
    icon: TrendUp,
    title: "Test Readiness",
    prompt: "Based on the content, what kind of questions should I expect in an exam?",
    color: "bg-emerald-500/10 text-emerald-500"
  }
];

const QuestyChat = () => {
  const { user } = useAuth();
  const { collectionId } = useMaterial();
  const isMobile = useIsMobile();
  
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isDeletingSession, setIsDeletingSession] = useState<string | null>(null);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Fetch messages when active session changes
  useEffect(() => {
    if (activeSessionId) {
      fetchMessages(activeSessionId);
    } else {
      setMessages([]);
    }
  }, [activeSessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const data = await chatService.getSessions();
      setSessions(data);
    } catch (error) {
      console.error("Failed to fetch chat sessions:", error);
      toast.error("Failed to load chat history.");
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    setIsLoadingMessages(true);
    try {
      const data = await chatService.getSessionMessages(sessionId);
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      toast.error("Failed to load messages.");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const createNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setInputValue('');
    setMobileHistoryOpen(false);
    setTimeout(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, 100);
  };

  const deleteChat = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeletingSession(sessionId);
    try {
      await chatService.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));
      if (activeSessionId === sessionId) {
        createNewChat();
      }
      toast.success("Session deleted.");
    } catch (error) {
      toast.error("Failed to delete session.");
    } finally {
      setIsDeletingSession(null);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const currentInput = inputValue;
    setInputValue('');
    
    // Add optimistic user message
    const userMsg: ChatMessage = {
      role: 'user',
      content: currentInput,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await chatService.ask({
        message: currentInput,
        session_id: activeSessionId || undefined,
        collection_id: collectionId || undefined
      });

      const aiMsg: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMsg]);
      
      // If this was a new session, update active session and refresh list
      if (!activeSessionId) {
        setActiveSessionId(response.session_id);
        fetchSessions();
      }
    } catch (error) {
      console.error("Failed to get AI response:", error);
      toast.error("AI is currently unavailable. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full gap-4">
      <Button
        onClick={createNewChat}
        className="w-full h-11 bg-primary text-primary-foreground hover:opacity-90 rounded-xl shadow-lg shadow-primary/20 font-bold gap-2"
      >
        <Plus className="w-4 h-4" weight="bold" />
        New Session
      </Button>

      <Card className="flex-1 rounded-xl border-none shadow-sm flex flex-col overflow-hidden">
        <CardHeader className="p-3 border-b bg-muted/30">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent Synapses</CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1 w-full">
          <div className="p-2 space-y-1">
            {isLoadingSessions ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 opacity-50">
                <CircleNotch className="w-6 h-6 animate-spin text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest">Loading...</span>
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-xs text-muted-foreground">No recent chats.</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.session_id}
                  onClick={() => {
                      setActiveSessionId(session.session_id);
                      setMobileHistoryOpen(false);
                  }}
                  className={cn(
                    "group p-2.5 rounded-xl cursor-pointer transition-all duration-200 relative",
                    activeSessionId === session.session_id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  )}
                >
                  <div className="flex justify-between items-start mb-0.5">
                    <p className="font-bold text-sm truncate pr-6">{session.title || "Untitled Session"}</p>
                    <button
                      onClick={(e) => deleteChat(session.session_id, e)}
                      disabled={isDeletingSession === session.session_id}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all"
                    >
                      {isDeletingSession === session.session_id ? (
                        <CircleNotch className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground opacity-60">
                    <Clock className="w-3 h-3" />
                    {new Date(session.updated_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );

  return (
    <DashboardLayout title="Questy AI Partner">
      <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] gap-4 lg:gap-6 p-2 lg:p-4">

        {/* --- DESKTOP SIDEBAR --- */}
        {!isMobile && (
          <div className="w-80 flex-shrink-0 flex flex-col gap-4">
            <SidebarContent />
          </div>
        )}

        {/* --- MAIN: CHAT INTERFACE --- */}
        <Card className="flex-1 flex flex-col rounded-xl border-none relative glass-card overflow-hidden">
          {/* Mobile Header with History Toggle */}
          {isMobile && (
            <div className="flex items-center justify-between p-3 border-b bg-background/50 backdrop-blur-md">
              <Sheet open={mobileHistoryOpen} onOpenChange={setMobileHistoryOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 font-bold">
                    <List className="w-4 h-4" />
                    History
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-4 w-80 border-0">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
              <Button onClick={createNewChat} variant="ghost" size="sm" className="text-primary font-bold">
                <Plus className="w-4 h-4 mr-1" /> New
              </Button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {messages.length === 0 && !activeSessionId ? (
              /* --- Welcome Screen --- */
              <motion.div
                key="welcome"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 text-center overflow-y-auto"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-inner">
                  <Robot className="w-8 h-8 text-primary" weight="fill" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">How can I help you study?</h2>
                <p className="text-muted-foreground max-w-sm mb-8 lg:mb-12 text-sm lg:text-base">
                  I'm your AI study partner. I can help you understand complex topics, create study plans, and test your knowledge.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 max-w-2xl w-full">
                  {suggestedPrompts.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                          setInputValue(item.prompt);
                          inputRef.current?.focus();
                      }}
                      className="group flex gap-x-4 items-center p-3 lg:p-4 rounded-2xl border bg-card/50 text-left transition-all hover:border-primary hover:bg-primary/5 hover:shadow-sm"
                    >
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3 shrink-0 transition-transform group-hover:scale-110", item.color)}>
                        <item.icon className="w-4.5 h-4.5" weight="bold" />
                      </div>
                      <div>
                        <p className="font-bold text-xs lg:text-sm mb-1">{item.title}</p>
                        <p className="text-[10px] lg:text-xs text-muted-foreground leading-snug line-clamp-2">
                          {item.prompt}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* --- Message Stream --- */
              <ScrollArea className="flex-1 p-4 lg:p-10">
                <div className="space-y-6 max-w-3xl mx-auto">
                  {isLoadingMessages && messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                      <CircleNotch className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-sm font-bold uppercase tracking-widest">Loading...</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={cn(
                            "flex gap-3 lg:gap-4",
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          )}
                        >
                          {message.role === 'assistant' && (
                            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-primary/10 flex flex-shrink-0 items-center justify-center shadow-sm self-end mb-2">
                              <Robot className="w-4 h-4 lg:w-5 lg:h-5 text-primary" weight="fill" />
                            </div>
                          )}

                          <div className={cn(
                            "max-w-[85%] lg:max-w-[80%] p-3 lg:p-4 rounded-2xl relative shadow-sm",
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground rounded-br-none'
                              : 'bg-muted/50 border text-foreground rounded-bl-none'
                          )}>
                            <div className="text-sm font-medium whitespace-pre-wrap leading-relaxed">
                              {message.content}
                            </div>
                            <span className={cn(
                              "text-[9px] lg:text-[10px] opacity-40 mt-2 lg:mt-3 block font-bold uppercase tracking-widest",
                              message.role === 'user' ? "text-primary-foreground" : "text-muted-foreground"
                            )}>
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {message.role === 'user' && (
                            <Avatar className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl shadow-sm self-end mb-2">
                              <AvatarImage src={getAvatarUrl(user?.avatar_url)} alt={user?.full_name} />
                              <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
                                {user?.full_name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))}

                      {isTyping && (
                        <div className="flex gap-4 justify-start">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex flex-shrink-0 items-center justify-center shadow-sm self-end mb-2">
                            <Robot className="w-5 h-5 text-primary animate-pulse" />
                          </div>
                          <div className="bg-muted px-6 py-4 rounded-3xl flex gap-1.5 items-center">
                            <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                            <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                          </div>
                        </div>
                      )}
                      <div ref={scrollRef} />
                    </>
                  )}
                </div>
              </ScrollArea>
            )}
          </AnimatePresence>

          {/* --- INPUT BAR --- */}
          <div className="p-3 lg:p-6 bg-background/50 backdrop-blur-md border-t">
            <div className="max-w-3xl mx-auto relative">
              <div className="flex flex-col bg-muted/30 border rounded-2xl focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/5 transition-all overflow-hidden">
                <Textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                      }
                  }}
                  placeholder="Ask anything..."
                  className="border-none focus-visible:ring-0 min-h-[40px] lg:min-h-[48px] max-h-[150px] lg:max-h-[200px] px-4 lg:px-5 py-2 lg:py-3 text-sm bg-transparent resize-none"
                />

                <div className="flex items-center justify-between px-3 lg:px-4 py-1.5 lg:py-2 bg-muted/20 border-t">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 lg:h-9 lg:w-9 rounded-full text-muted-foreground">
                      <Paperclip className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 lg:h-9 lg:w-9 rounded-full text-muted-foreground">
                      <Microphone className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                    </Button>
                  </div>

                  <Button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isTyping}
                    className="h-8 lg:h-10 px-4 lg:px-6 rounded-full font-bold gap-2 group transition-all active:scale-95 shadow-md shadow-primary/20 text-xs lg:text-sm"
                  >
                    {isTyping ? <CircleNotch className="w-4 h-4 animate-spin" /> : "Send"}
                    {!isTyping && <PaperPlaneRight className="w-3.5 h-3.5 lg:w-4 lg:h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" weight="bold" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default QuestyChat;
