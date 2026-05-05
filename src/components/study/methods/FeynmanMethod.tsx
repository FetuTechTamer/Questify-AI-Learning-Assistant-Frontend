import { useState, useEffect } from "react";
import { StudySessionLayout } from "@/components/study/StudySessionLayout";
import { ChatCircle, ArrowRight, ArrowLeft, MagicWand, BookOpen, PaperPlaneTilt, Sparkle, CircleNotch } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { PDFViewer } from "@/components/study/PDFViewer";
import { Badge } from "@/components/ui/badge";
import { studyService } from "@/services/studyService";
import { toast } from "sonner";

type InteractionState = 'AI_ASKING' | 'USER_ANSWERING' | 'AI_EVALUATING';

interface FeynmanMethodProps {
    bookFilename?: string;
    collectionId?: string;
    studyData: any;
    onBack: () => void;
}

export function FeynmanMethod({ bookFilename, collectionId, studyData, onBack }: FeynmanMethodProps) {
    const [interactionState, setInteractionState] = useState<InteractionState>('USER_ANSWERING');
    const [userInput, setUserInput] = useState("");
    const [chatHistory, setChatHistory] = useState<Array<{ sender: 'ai' | 'user', text: string, type?: 'critique' | 'question' }>>([]);
    const [isSourceVisible, setIsSourceVisible] = useState(true);
    const [lastCritique, setLastCritique] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize from studyData
    useEffect(() => {
        if (studyData) {
            const history: any[] = [];
            
            // If we have previous history in studyData
            if (studyData.history && Array.isArray(studyData.history)) {
                studyData.history.forEach((h: any) => {
                    history.push({ sender: h.role === 'assistant' ? 'ai' : 'user', text: h.content });
                });
            } else if (studyData.initial_question) {
                history.push({ sender: 'ai', text: studyData.initial_question, type: 'question' });
            } else if (typeof studyData === 'string') {
                history.push({ sender: 'ai', text: studyData });
            } else if (studyData.last_explanation) {
                 history.push({ sender: 'user', text: studyData.last_explanation });
                 if (studyData.feedback) {
                    history.push({ sender: 'ai', text: studyData.feedback, type: 'critique' });
                    setLastCritique(studyData.feedback);
                    setShowFeedback(true);
                 }
            }

            if (history.length === 0) {
                history.push({ sender: 'ai', text: "I'm ready to hear your explanation. What did you learn from this material?", type: 'question' });
            }
            
            setChatHistory(history);
        }
    }, [studyData]);

    const handleSendMessage = async () => {
        if (!userInput.trim() || !collectionId) return;

        const currentInput = userInput;
        
        // Add User Answer to UI immediately
        setChatHistory(prev => [...prev, { sender: 'user', text: currentInput }]);
        setUserInput("");
        setInteractionState('AI_EVALUATING');
        setIsSubmitting(true);

        try {
            console.log(`[Feynman] Submitting explanation for collection ${collectionId}`);
            // Using POST to submit explanation and get feedback
            const response = await studyService.generateSession('feynman', collectionId);
            
            const critique = response.feedback || response.critique || "I've analyzed your explanation.";
            const followUp = response.follow_up || response.next_question || "Can you elaborate on that?";

            setLastCritique(critique);
            setShowFeedback(true);

            setChatHistory(prev => [...prev, {
                sender: 'ai',
                text: critique + "\n\n" + followUp,
                type: 'critique'
            }]);
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to sync with AI student.");
            setChatHistory(prev => [...prev, { sender: 'ai', text: "Sorry, I lost my train of thought. Could you say that again?", type: 'question' }]);
        } finally {
            setIsSubmitting(false);
            setInteractionState('USER_ANSWERING');
        }
    };

    return (
        <StudySessionLayout
            title="Feynman Studio"
            subtitle={bookFilename}
            icon={ChatCircle}
            color="text-green-500"
            onExit={onBack}
            rightAction={
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-teal-600 border-teal-200 bg-teal-50/50">
                        Method: Explain Simply
                    </Badge>
                    <Badge variant={isSubmitting ? "secondary" : "default"} className="rounded-full">
                        {isSubmitting ? 'AI ANALYZING...' : 'STUDENT IS LISTENING'}
                    </Badge>
                </div>
            }
        >
            <div className="flex h-full animate-in fade-in duration-500 overflow-hidden bg-background">
                {/* --- LEFT PANEL: PDF Source --- */}
                <div className={cn(
                    "transition-all duration-500 relative border-r overflow-hidden flex flex-col bg-slate-50/50",
                    isSourceVisible ? "w-[40%] opacity-100" : "w-12 opacity-80"
                )}>
                    {isSourceVisible ? (
                        <>
                            {bookFilename ? (
                                <PDFViewer filename={bookFilename} />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground italic text-sm">No source document</div>
                            )}
                            <Button
                                variant="secondary"
                                size="sm"
                                className="absolute top-4 right-4 z-50 shadow-md h-8 w-8 p-0 rounded-lg"
                                onClick={() => setIsSourceVisible(false)}
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center pt-8 gap-6">
                            <Button variant="ghost" size="icon" onClick={() => setIsSourceVisible(true)} className="h-12 w-12 rounded-xl hover:bg-teal-50">
                                <BookOpen className="w-6 h-6 text-teal-600" />
                            </Button>
                            <div className="writing-mode-vertical text-[10px] font-black text-slate-300 tracking-[0.3em] uppercase">
                                Reference Material
                            </div>
                        </div>
                    )}
                </div>

                {/* --- CENTER PANEL: Interaction Area --- */}
                <div className="flex-1 flex flex-col relative bg-dot-pattern min-w-0">
                    <div className="flex-1 flex flex-col h-full max-w-2xl mx-auto w-full p-8 pb-0 gap-6">
                        <ScrollArea className="flex-1 pr-6 -mr-6">
                            <div className="space-y-8 pb-8 mt-4">
                                {chatHistory.map((msg, idx) => (
                                    <div key={idx} className={cn(
                                        "flex flex-col gap-3 max-w-[85%] animate-in slide-in-from-bottom-2",
                                        msg.sender === 'user' ? "items-end ml-auto" : "items-start"
                                    )}>
                                        <div className="flex items-center gap-2 px-2">
                                            {msg.sender === 'ai' && <Sparkle className="w-3 h-3 text-teal-500" weight="fill" />}
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {msg.sender === 'ai' ? 'The Student' : 'Professor You'}
                                            </span>
                                        </div>
                                        <div className={cn(
                                            "p-5 rounded-3xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ring-1 ring-black/5",
                                            msg.sender === 'ai'
                                                ? "bg-white text-slate-800 rounded-tl-none border-teal-100/50"
                                                : "bg-teal-600 text-white rounded-tr-none shadow-teal-900/10"
                                        )}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {isSubmitting && (
                                    <div className="flex items-center gap-3 text-teal-600 text-xs font-bold animate-pulse ml-4 mt-6">
                                        <CircleNotch className="w-4 h-4 animate-spin" />
                                        <span>Student is processing your explanation...</span>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="pt-6 pb-8 mt-auto">
                            <Card className="p-3 flex flex-col gap-3 shadow-2xl border-teal-500/20 bg-background/80 backdrop-blur-xl rounded-[2rem] items-stretch">
                                <Textarea
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    placeholder="Explain the concepts simply as if teaching a beginner..."
                                    className="resize-none border-none focus-visible:ring-0 min-h-[120px] text-sm leading-relaxed bg-transparent"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                />
                                <div className="flex justify-between items-center px-4 py-2 border-t border-slate-100">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Shift + Enter for new line</span>
                                    <Button
                                        size="sm"
                                        onClick={handleSendMessage}
                                        disabled={!userInput.trim() || isSubmitting}
                                        className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-6 h-10 font-bold gap-2 shadow-lg shadow-teal-600/20"
                                    >
                                        Submit <PaperPlaneTilt className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT PANEL: AI Feedback --- */}
                <div className={cn(
                    "transition-all duration-500 border-l bg-slate-50/50 flex flex-col relative overflow-hidden",
                    showFeedback ? "w-[30%] opacity-100" : "w-0 opacity-0 border-none"
                )}>
                    <div className="p-8 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-black text-xs uppercase tracking-[0.3em] text-teal-800">Critical Analysis</h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowFeedback(false)} className="h-8 w-8 rounded-full hover:bg-teal-100/50">
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>

                        <ScrollArea className="flex-1 -mx-8 px-8">
                            <div className="space-y-8">
                                {lastCritique && (
                                    <div className="p-6 rounded-[2rem] bg-white border border-teal-100 shadow-xl shadow-teal-900/5 space-y-4 animate-in fade-in slide-in-from-top-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-600">
                                                <MagicWand className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-sm tracking-tight">AI Evaluation</span>
                                        </div>
                                        <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap italic font-medium">
                                            {lastCritique}
                                        </div>
                                        <div className="pt-4 border-t border-slate-50 flex items-center gap-2">
                                            <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none text-[10px] font-bold">Concept Mastered</Badge>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Teaching Strategy</p>
                                    <div className="p-5 rounded-[1.5rem] bg-teal-600 text-white text-xs leading-relaxed font-medium shadow-lg shadow-teal-600/20">
                                        The student is testing your ability to simplify. Use analogies and avoid technical jargon for better results.
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        <Button
                            variant="outline"
                            className="mt-8 w-full border-teal-200 text-teal-700 hover:bg-teal-100/50 font-bold text-xs rounded-2xl h-12"
                            onClick={() => setShowFeedback(false)}
                        >
                            Return to Discussion
                        </Button>
                    </div>
                </div>
            </div>
        </StudySessionLayout>
    );
}
