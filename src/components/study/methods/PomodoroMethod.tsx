import { useState, useEffect } from "react";
import { StudySessionLayout } from "@/components/study/StudySessionLayout";
import { Timer, BookOpen, Play, Pause, ArrowCounterClockwise, ArrowsOut, Info } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PDFViewer } from "@/components/study/PDFViewer";
import { api } from "@/services/api";
import { toast } from "sonner";

// --- Types ---
type TimerState = 'IDLE' | 'RUNNING' | 'PAUSED' | 'BREAK';

interface PomodoroMethodProps {
    bookFilename?: string;
    collectionId?: string;
    studyData: any;
    onBack: () => void;
}

export function PomodoroMethod({ bookFilename, collectionId, studyData, onBack }: PomodoroMethodProps) {
    // Timer State
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
    const [timerState, setTimerState] = useState<TimerState>('IDLE');
    const [cycleCount, setCycleCount] = useState(0);
    const [isFullWidth, setIsFullWidth] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    // Content State
    const [highlights, setHighlights] = useState<string[]>([]);

    // --- Initialize from studyData ---
    useEffect(() => {
        if (studyData && studyData.completed_sessions !== undefined) {
            setCycleCount(studyData.completed_sessions);
        }
    }, [studyData]);

    // --- Timer Logic ---
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (timerState === 'RUNNING' && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleTimerComplete();
        }

        return () => clearInterval(interval);
    }, [timerState, timeLeft]);

    const handleTimerComplete = async () => {
        if (timerState === 'RUNNING') {
            setCycleCount(c => c + 1);
            setTimerState('BREAK');
            setTimeLeft(5 * 60); // 5 min break
            new Audio('/sounds/bell.mp3').play().catch(() => { });

            if (collectionId) {
                try {
                    await api.recordPomodoro({ collection_id: collectionId, duration: 25, completed: true });
                    toast.success("Focus session recorded!");
                } catch (err) {
                    console.error("Failed to save pomodoro", err);
                }
            }
        } else {
            setTimerState('IDLE');
            setTimeLeft(25 * 60);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <StudySessionLayout
            title="Pomodoro Focus"
            subtitle={bookFilename}
            icon={Timer}
            color="text-orange-500"
            onExit={onBack}
            rightAction={
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowInfo(!showInfo)}
                        className="text-xs gap-1"
                    >
                        <Info className="w-4 h-4" />
                        Logic
                    </Button>
                    <Badge variant={timerState === 'RUNNING' ? "destructive" : "secondary"} className="rounded-full px-3">
                        {timerState === 'RUNNING' ? 'FOCUS' : timerState === 'BREAK' ? 'BREAK' : 'IDLE'}
                    </Badge>
                </div>
            }
        >
            <div className="flex h-full relative">
                {/* --- LEFT PANEL: PDF Viewer --- */}
                <div className={cn(
                    "flex-1 overflow-hidden flex flex-col relative border-r transition-all duration-500",
                    isFullWidth ? "w-full" : ""
                )}>
                    {bookFilename ? (
                        <div className={cn("h-full w-full transition-all duration-700", timerState === 'BREAK' && "blur-xl grayscale opacity-30")}>
                            <PDFViewer
                                filename={bookFilename}
                                onHighlight={(text) => setHighlights([...highlights, text])}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
                            <BookOpen className="w-12 h-12 opacity-20" />
                            <p className="text-sm font-medium">Resource not loaded</p>
                        </div>
                    )}

                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsFullWidth(!isFullWidth)}
                        className="absolute bottom-6 right-6 z-50 shadow-2xl gap-2 rounded-xl h-10 px-4"
                    >
                        <ArrowsOut className="w-4 h-4" />
                        {isFullWidth ? "Collapse View" : "Immersive PDF"}
                    </Button>

                    {timerState === 'BREAK' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 animate-in fade-in zoom-in duration-500">
                             <div className="bg-background/80 backdrop-blur-xl p-12 rounded-[3rem] border shadow-2xl text-center space-y-4">
                                <span className="text-6xl">☕</span>
                                <h2 className="text-4xl font-black text-primary tracking-tighter">
                                    BREAK TIME
                                </h2>
                                <p className="text-muted-foreground">Hydrate, stretch, and let your brain rest.</p>
                             </div>
                        </div>
                    )}
                </div>

                {/* --- RIGHT PANEL: Timer & Session Controls --- */}
                <div className={cn(
                    "bg-card/50 backdrop-blur-sm flex flex-col border-l transition-all duration-500 overflow-hidden",
                    isFullWidth ? "w-0 p-0 border-none" : "w-80 p-8 gap-8"
                )}>
                    {/* Timer UI */}
                    <div className="flex flex-col items-center justify-center py-6 relative shrink-0">
                        <div className="relative w-56 h-56 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="112" cy="112" r="100" className="stroke-muted" strokeWidth="8" fill="none" />
                                <circle
                                    cx="112" cy="112" r="100"
                                    className={cn("transition-all duration-1000", timerState === 'BREAK' ? "stroke-green-500" : "stroke-orange-500")}
                                    strokeWidth="8" fill="none"
                                    strokeDasharray={2 * Math.PI * 100}
                                    strokeDashoffset={2 * Math.PI * 100 * (1 - timeLeft / (timerState === 'BREAK' ? 300 : 1500))}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-mono font-black tracking-tighter">{formatTime(timeLeft)}</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] mt-2">{timerState === 'IDLE' ? 'Ready' : timerState}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 mt-10 w-full">
                            <Button size="lg" className={cn("flex-1 h-12 rounded-xl font-bold shadow-lg", timerState === 'RUNNING' ? "bg-destructive hover:bg-destructive/90" : "bg-primary shadow-primary/20")} onClick={() => setTimerState(prev => prev === 'RUNNING' ? 'PAUSED' : 'RUNNING')}>
                                {timerState === 'RUNNING' ? <Pause className="w-5 h-5 mr-2" weight="fill" /> : <Play className="w-5 h-5 mr-2" weight="fill" />}
                                {timerState === 'RUNNING' ? "Pause" : "Start"}
                            </Button>
                            <Button size="icon" variant="outline" className="h-12 w-12 rounded-xl" onClick={() => { setTimerState('IDLE'); setTimeLeft(1500); }}>
                                <ArrowCounterClockwise className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Session Stats */}
                    <div className="space-y-4 shrink-0">
                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            <span>Sprints Done</span>
                            <span>{cycleCount}</span>
                        </div>
                        <Progress value={(cycleCount % 4) * 25} className="h-1.5" />
                        <p className="text-[10px] text-muted-foreground text-center font-medium">
                            Long break after {4 - (cycleCount % 4)} sessions
                        </p>
                    </div>

                    <div className="flex-1 flex flex-col min-h-0 border-t pt-8">
                        <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-primary" />
                            Knowledge Log
                        </h4>
                        <ScrollArea className="flex-1 -mr-4 pr-4">
                            {highlights.length === 0 ? (
                                <div className="text-xs text-muted-foreground/60 text-center py-12 italic border border-dashed rounded-2xl mx-2">
                                    Highlight key concepts in the PDF to log them here.
                                </div>
                            ) : (
                                <div className="space-y-3 px-2 pb-4">
                                    {highlights.map((h, i) => (
                                        <div key={i} className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-xs leading-relaxed animate-in slide-in-from-right-2">
                                            {h}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>

                {/* --- OVERLAY: How it works --- */}
                {showInfo && (
                    <div className="absolute inset-0 z-[100] bg-background/95 backdrop-blur-md p-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                        <div className="max-w-xl space-y-8">
                            <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                                <Timer className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black tracking-tight">Focus Logic</h2>
                                <p className="text-muted-foreground">The Pomodoro Method helps you sustain concentration.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                {[
                                    { n: 1, t: "Focus", d: "25 min of deep work." },
                                    { n: 2, t: "Rest", d: "5 min short break." },
                                    { n: 3, t: "Momentum", d: "Repeat 4 cycles." },
                                    { n: 4, t: "Recharge", d: "30 min long break." }
                                ].map(i => (
                                    <div key={i.n} className="p-4 rounded-2xl border bg-card/50">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold">{i.n}</span>
                                            <h4 className="font-bold text-sm">{i.t}</h4>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{i.d}</p>
                                    </div>
                                ))}
                            </div>

                            <Button onClick={() => setShowInfo(false)} className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl shadow-orange-500/20">
                                Start Deep Work
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </StudySessionLayout>
    );
}
