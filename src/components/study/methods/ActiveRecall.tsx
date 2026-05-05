import { useState, useEffect } from "react";
import { StudySessionLayout } from "@/components/study/StudySessionLayout";
import { Brain, Eye, ArrowCounterClockwise, Check, Sparkle, X, Target, MagicWand, ArrowRight, CircleNotch } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { studyService } from "@/services/studyService";
import { toast } from "sonner";

export function ActiveRecall({ onBack, bookFilename, collectionId, studyData }: { onBack: () => void; bookFilename?: string; collectionId?: string; studyData: any }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnswerVisible, setIsAnswerVisible] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [lastAnalysis, setLastAnalysis] = useState<string | null>(null);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const [questions, setQuestions] = useState<any[]>([]);

    // Initialize from studyData
    useEffect(() => {
        if (studyData) {
            const qs = studyData.questions || (Array.isArray(studyData) ? studyData : []);
            setQuestions(qs);
        }
    }, [studyData]);

    const currentQ = questions[currentIndex];
    const isComplete = questions.length > 0 && currentIndex >= questions.length;

    const handleNext = async (correct: boolean) => {
        setScore(prev => ({
            correct: prev.correct + (correct ? 1 : 0),
            total: prev.total + 1
        }));

        if (collectionId && currentQ) {
            try {
                // Sync result with backend if desired, using generateSession as a 'sync' point or a specific progress endpoint if it exists
                await studyService.generateSession('active_recall', collectionId);
            } catch (err) {
                console.error("Failed to sync recall progress", err);
            }
        }

        setIsAnswerVisible(false);
        setShowAnalysis(false);
        setLastAnalysis(null);
        setCurrentIndex(prev => prev + 1);
    };

    const runAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            // Simulated AI Analysis logic using the current data
            const response = await studyService.generateSession('active_recall', collectionId!);
            const analysis = response.feedback || response.analysis || "Your recall attempt was processed. Focus on the core relationships between these concepts.";
            setLastAnalysis(analysis);
            setShowAnalysis(true);
        } catch (err) {
            toast.error("AI Analysis currently unavailable.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (questions.length === 0 && !isComplete) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <CircleNotch className="w-8 h-8 animate-spin text-rose-500" />
                <p className="text-sm font-medium">Loading recall challenge...</p>
            </div>
        );
    }

    return (
        <StudySessionLayout
            title="Active Recall"
            subtitle="Self-Testing Protocol"
            icon={Brain}
            color="text-rose-500"
            onExit={onBack}
            rightAction={
                <Badge variant="outline" className="text-[10px] uppercase font-bold text-rose-600 border-rose-200 bg-rose-50/50 rounded-full px-3">
                    Accuracy: {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
                </Badge>
            }
        >
            <div className="flex h-full overflow-hidden bg-background">
                {/* --- MAIN AREA --- */}
                <div className="flex-1 flex flex-col relative min-w-0">
                    <div className="p-6 border-b bg-card/30 backdrop-blur-sm flex items-center justify-between">
                        <div className="flex items-center gap-6 flex-1 max-w-2xl">
                            <Progress value={(currentIndex / questions.length) * 100} className="h-1.5 flex-1" />
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                                Challenge {Math.min(currentIndex + 1, questions.length)} / {questions.length}
                            </span>
                        </div>
                    </div>

                    <ScrollArea className="flex-1 p-8">
                        <div className="max-w-3xl mx-auto h-full flex flex-col justify-center gap-10 py-12">
                            {!isComplete ? (
                                <>
                                    {/* Question Card */}
                                    <div className="w-full relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <Card className="p-12 md:p-16 shadow-2xl border-none relative overflow-hidden group bg-white rounded-[3rem] ring-1 ring-black/5">
                                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500" />
                                            <div className="flex items-center gap-2 mb-6">
                                                <Target className="w-4 h-4 text-rose-500" />
                                                <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Neural Trigger</h3>
                                            </div>
                                            <div className="text-3xl md:text-5xl font-black leading-tight tracking-tighter text-slate-900">
                                                {currentQ?.question}
                                            </div>
                                        </Card>
                                    </div>

                                    {/* Answer Section */}
                                    <div className="w-full relative min-h-[200px]">
                                        {isAnswerVisible ? (
                                            <div className="space-y-8 animate-in fade-in slide-in-from-top-6 duration-700">
                                                <Card className="p-10 bg-slate-900 text-white border-none shadow-2xl rounded-[2.5rem] relative overflow-hidden ring-4 ring-rose-500/10">
                                                    <div className="absolute top-0 right-0 p-6 opacity-20">
                                                        <Sparkle className="w-12 h-12 text-rose-400" weight="fill" />
                                                    </div>
                                                    <h3 className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em] mb-4">Core Knowledge</h3>
                                                    <p className="text-xl leading-relaxed font-medium italic opacity-90">{currentQ?.answer}</p>
                                                </Card>

                                                <div className="flex gap-4 items-center">
                                                    <Button
                                                        variant="outline"
                                                        size="lg"
                                                        className="flex-1 h-16 rounded-[1.5rem] border-rose-200 text-rose-700 font-black uppercase tracking-widest text-xs hover:bg-rose-50"
                                                        onClick={() => handleNext(false)}
                                                    >
                                                        <X className="w-5 h-5 mr-2" weight="bold" /> Re-learn
                                                    </Button>
                                                    <Button
                                                        size="lg"
                                                        className="flex-1 h-16 rounded-[1.5rem] bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-rose-600/20"
                                                        onClick={() => handleNext(true)}
                                                    >
                                                        <Check className="w-5 h-5 mr-2" weight="bold" /> Mastered
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={cn("h-16 w-16 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all", isAnalyzing && "animate-spin")}
                                                        onClick={runAnalysis}
                                                        disabled={isAnalyzing}
                                                    >
                                                        <MagicWand className="w-6 h-6" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setIsAnswerVisible(true)}
                                                className="w-full h-[240px] border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center gap-6 text-slate-300 hover:bg-rose-500/5 hover:border-rose-500/30 hover:text-rose-600 transition-all duration-500 group"
                                            >
                                                <div className="p-6 rounded-full bg-slate-50 group-hover:bg-rose-100 transition-colors">
                                                    <Brain className="w-12 h-12 group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                                <span className="font-black text-xs uppercase tracking-[0.4em]">Retrieve Answer</span>
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center space-y-10 animate-in zoom-in duration-500 h-fit my-auto">
                                    <div className="w-28 h-28 bg-rose-600 text-white rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl rotate-12 shadow-rose-600/30">
                                        <Sparkle className="w-14 h-14" weight="bold" />
                                    </div>
                                    <div className="space-y-3">
                                        <h2 className="text-5xl font-black tracking-tighter">Neuro-Sync Complete</h2>
                                        <p className="text-muted-foreground text-lg font-medium">You have successfully verified your mental model.</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 w-full max-w-md mx-auto">
                                        <div className="bg-white p-8 rounded-[2rem] border shadow-sm ring-1 ring-black/5">
                                            <div className="text-4xl font-black text-rose-600">{score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%</div>
                                            <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-2">Recall Accuracy</div>
                                        </div>
                                        <div className="bg-white p-8 rounded-[2rem] border shadow-sm ring-1 ring-black/5">
                                            <div className="text-4xl font-black text-slate-800">{questions.length}</div>
                                            <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-2">Items Refined</div>
                                        </div>
                                    </div>

                                    <Button size="lg" onClick={onBack} className="h-14 px-10 font-bold bg-slate-900 rounded-2xl hover:bg-black transition-all">
                                        <ArrowCounterClockwise className="w-5 h-5 mr-3" /> Conclude Protocol
                                    </Button>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* --- RIGHT PANEL: AI Analysis --- */}
                <div className={cn(
                    "transition-all duration-700 border-l bg-slate-50 flex flex-col relative overflow-hidden",
                    showAnalysis ? "w-[30%] opacity-100" : "w-0 opacity-0 border-none"
                )}>
                    <div className="p-8 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-black text-xs uppercase tracking-[0.3em] text-rose-700">Neural Analytics</h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowAnalysis(false)} className="h-8 w-8 rounded-full hover:bg-rose-100/50">
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>

                        <ScrollArea className="flex-1 -mx-8 px-8">
                            <div className="space-y-8">
                                {lastAnalysis && (
                                    <div className="p-8 rounded-[2.5rem] bg-white border border-rose-100 shadow-xl shadow-rose-900/5 space-y-4 animate-in slide-in-from-right-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600">
                                                <Target className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-sm tracking-tight">AI Diagnostic</span>
                                        </div>
                                        <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap italic font-medium">
                                            {lastAnalysis}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Recall Strategy</p>
                                    <div className="p-6 rounded-[1.5rem] bg-rose-600 text-white text-xs leading-relaxed font-medium shadow-lg shadow-rose-600/20">
                                        Your speed was consistent. Focus on the 'why' rather than just the definitions for better long-term encoding.
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        <Button
                            variant="outline"
                            className="mt-8 w-full border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs rounded-2xl h-12"
                            onClick={() => setShowAnalysis(false)}
                        >
                            Return to Protocol
                        </Button>
                    </div>
                </div>
            </div>
        </StudySessionLayout>
    );
}
