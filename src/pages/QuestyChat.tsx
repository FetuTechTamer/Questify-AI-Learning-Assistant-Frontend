import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  CircleNotch,
  Robot,
  List,
  ChatCircle,
  Paperclip,
  Microphone
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

import { collectionsService, Collection } from "@/services/collectionsService";

const QuestyChat = () => {
  const { user } = useAuth();
  const { collectionId: materialCollectionId } = useMaterial();
  const isMobile = useIsMobile();

  const memoizedAvatarUrl = useMemo(() => getAvatarUrl(user?.avatar_url), [user?.avatar_url]);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isDeletingSession, setIsDeletingSession] = useState<string | null>(null);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch sessions when collection changes
  useEffect(() => {
    if (selectedCollectionId) {
      fetchSessions(selectedCollectionId);
    }
  }, [selectedCollectionId]);

  const fetchCollections = async () => {
    setIsLoadingCollections(true);
    try {
      const data = await collectionsService.getCollections();
      setCollections(data);
    } catch (error) {
      console.error("Failed to load collections");
    } finally {
      setIsLoadingCollections(false);
    }
  };

  const fetchSessions = async (collectionId?: string) => {
    setIsLoadingSessions(true);
    try {
      const data = await chatService.getSessions();
      const sessionList = Array.isArray(data) ? data : [];
      setSessions(sessionList);
      
      // Auto-select the most recent session
      if (sessionList.length > 0) {
        // Sort by updated_at descending
        const sorted = [...sessionList].sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        setActiveSessionId(sorted[0].session_id);
        console.log(`[Chat] Auto-selected latest session: ${sorted[0].session_id}`);
      } else {
        setActiveSessionId(null);
      }
    } catch (error) {
      setSessions([]);
      setActiveSessionId(null);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    setIsLoadingMessages(true);
    try {
      const data = await chatService.getSessionMessages(sessionId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load history.");
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const createNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setInputValue('');
    setMobileHistoryOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
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

  // Initial load
  useEffect(() => {
    fetchCollections();
  }, []);

  // Sync with material context if it exists
  useEffect(() => {
    if (materialCollectionId && !selectedCollectionId) {
      setSelectedCollectionId(materialCollectionId);
    }
  }, [materialCollectionId]);

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

  const handleSend = async (retryCount = 0) => {
    if (!inputValue.trim() || isTyping) return;
    
    if (!selectedCollectionId) {
      toast.error("Please select a collection to start chatting.");
      return;
    }

    const currentInput = inputValue;
    if (retryCount === 0) setInputValue('');

    setIsTyping(true);

    try {
      // Requirement: Always ensure we have a session from backend
      let sessionId = activeSessionId;
      
      if (!sessionId) {
        console.log("[Chat] No active session. Creating one now...");
        const newSession = await chatService.createSession(selectedCollectionId);
        sessionId = newSession.session_id;
        setActiveSessionId(sessionId);
        fetchSessions(selectedCollectionId);
      }

      const userMsg: ChatMessage = {
        role: 'user',
        content: currentInput,
        timestamp: new Date().toISOString()
      };
      
      if (retryCount === 0) {
        setMessages(prev => [...prev, userMsg]);
      }

      const response = await chatService.ask({
        question: currentInput,
        session_id: sessionId!,
        collection_id: selectedCollectionId
      });

      const aiMsg: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMsg]);

    } catch (error: any) {
      console.error("[Chat] Request failed:", error);
      
      // Requirement 4: If 404, re-create session and retry once
      if (error.response?.status === 404 && retryCount < 1) {
        console.log("[Chat] Session expired (404). Re-creating and retrying...");
        setActiveSessionId(null);
        setIsTyping(false); // Reset to allow retry call to set it back
        return handleSend(retryCount + 1);
      }

      const errorText = error.response?.status === 404 
        ? "No chat session available. Please contact support."
        : "Failed to get response. Please try again.";
        
      toast.error(errorText);
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `I'm sorry, I encountered an error: ${errorText}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full gap-4 overflow-hidden">
      <Button
        onClick={createNewChat}
        className="w-full h-11 bg-primary text-primary-foreground hover:opacity-90 rounded-xl shadow-lg shadow-primary/20 font-bold gap-2"
      >
        <Plus className="w-4 h-4" weight="bold" />
        New Session
      </Button>

      {/* --- COLLECTIONS SECTION --- */}
      <Card className="flex-[0.6] rounded-xl border-none shadow-sm flex flex-col overflow-hidden">
        <CardHeader className="p-3 border-b bg-muted/30">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <BookOpen className="w-3 h-3 text-primary" />
            Knowledge Base
          </CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1 w-full">
          <div className="p-2 space-y-1">
            {isLoadingCollections ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2 opacity-50">
                <CircleNotch className="w-4 h-4 animate-spin text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Scanning...</span>
              </div>
            ) : collections.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-[10px] text-muted-foreground">No collections found.</p>
              </div>
            ) : (
              collections.map((collection) => (
                <div
                  key={collection.collection_id}
                  onClick={() => setSelectedCollectionId(collection.collection_id)}
                  className={cn(
                    "group p-2.5 rounded-xl cursor-pointer transition-all duration-200 relative flex items-center gap-3",
                    selectedCollectionId === collection.collection_id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "hover:bg-muted"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs",
                    selectedCollectionId === collection.collection_id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {collection.title?.charAt(0) || "T"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{collection.title}</p>
                    <p className="text-[10px] opacity-60 truncate">Active Library</p>
                  </div>
                  {selectedCollectionId === collection.collection_id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* --- RECENT SESSIONS --- */}
      <Card className="flex-1 rounded-xl border-none shadow-sm flex flex-col overflow-hidden">
        <CardHeader className="p-3 border-b bg-muted/30">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Recent Synapses
          </CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1 w-full">
          <div className="p-2 space-y-1">
            {isLoadingSessions ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 opacity-50">
                <CircleNotch className="w-6 h-6 animate-spin text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest">Loading...</span>
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-6 text-center space-y-2">
                <ChatCircle className="w-8 h-8 mx-auto opacity-10" />
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
                    {session.updated_at ? new Date(session.updated_at).toLocaleDateString() : 'Today'}
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
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] lg:h-[calc(100vh-110px)] gap-4 lg:gap-6 p-3 lg:p-6 overflow-hidden">

        {/* --- SIDEBAR (Desktop) --- */}
        {!isMobile && (
          <div className="w-72 xl:w-80 flex-shrink-0 flex flex-col gap-4 overflow-hidden">
            <SidebarContent />
          </div>
        )}

        {/* --- CHAT INTERFACE --- */}
        <Card className="flex-1 flex flex-col rounded-xl border-none relative glass-card overflow-hidden">
          {isMobile && (
            <div className="flex items-center justify-between px-4 py-3 border-b bg-background/80 backdrop-blur-xl sticky top-0 z-10">
              <Sheet open={mobileHistoryOpen} onOpenChange={setMobileHistoryOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 rounded-xl border-dashed gap-2 font-bold px-3">
                    <List className="w-4 h-4" />
                    {selectedCollectionId ? 
                      collections.find(c => c.collection_id === selectedCollectionId)?.title : 
                      "Select Topic"}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-4 w-[85%] border-0 overflow-y-auto">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
              
              <div className="flex items-center gap-2">
                <Button onClick={createNewChat} variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-primary">
                  <Plus className="w-5 h-5" weight="bold" />
                </Button>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {messages.length === 0 && !activeSessionId ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 text-center overflow-y-auto"
              >
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 shadow-inner animate-bounce-subtle">
                  <Robot className="w-10 h-10 text-primary" weight="fill" />
                </div>
                
                {!selectedCollectionId ? (
                  <>
                    <h2 className="text-2xl lg:text-3xl font-black tracking-tight mb-3">Select a Knowledge Base</h2>
                    <p className="text-muted-foreground max-w-sm mb-12 text-sm lg:text-base leading-relaxed">
                      To start our study session, please select a collection from the sidebar on the left. I'll use that material to help you learn.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl lg:text-3xl font-black tracking-tight mb-3">
                      Ready for <span className="text-primary">{collections.find(c => c.collection_id === selectedCollectionId)?.title}</span>?
                    </h2>
                    <p className="text-muted-foreground max-w-sm mb-8 lg:mb-12 text-sm lg:text-base leading-relaxed">
                      I'm connected to your material. Ask me to explain a concept, create a summary, or test your knowledge.
                    </p>
                  </>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 max-w-2xl w-full">
                  {suggestedPrompts.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setInputValue(item.prompt)}
                      className="group flex gap-x-4 items-center p-3 lg:p-4 rounded-2xl border bg-card/50 text-left transition-all hover:border-primary hover:bg-primary/5 hover:shadow-sm"
                    >
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", item.color)}>
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
                              {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            </span>
                          </div>

                          {message.role === 'user' && (
                            <Avatar className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl shadow-sm self-end mb-2">
                              <AvatarImage src={memoizedAvatarUrl} alt={user?.full_name} />
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
                          <div className="bg-muted px-6 py-4 rounded-3xl flex flex-col gap-1.5">
                            <div className="flex gap-1.5 items-center">
                              <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                              <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                            </div>
                            <span className="text-[10px] font-bold text-primary opacity-60">Questy is thinking...</span>
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
                  disabled={!selectedCollectionId || isTyping}
                  placeholder={selectedCollectionId ? "Ask anything about this collection..." : "Select a collection to start chatting..."}
                  className="border-none focus-visible:ring-0 min-h-[40px] lg:min-h-[48px] max-h-[150px] lg:max-h-[200px] px-4 lg:px-5 py-2 lg:py-3 text-sm bg-transparent resize-none disabled:opacity-50"
                />

                <div className="flex items-center justify-between px-3 lg:px-4 py-1.5 lg:py-2 bg-muted/20 border-t">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 lg:h-9 lg:w-9 rounded-full text-muted-foreground" disabled={!selectedCollectionId}>
                      <Paperclip className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 lg:h-9 lg:w-9 rounded-full text-muted-foreground" disabled={!selectedCollectionId}>
                      <Microphone className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                    </Button>
                  </div>

                  <Button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isTyping || !selectedCollectionId}
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
