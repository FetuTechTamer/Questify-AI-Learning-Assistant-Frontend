import React, { useRef, useEffect, useState } from 'react';
import {
    Clock,
    CheckCircle,
    Warning,
    Flag,
    CaretRight,
    CaretLeft,
    List,
    SquaresFour,
    PaperPlaneTilt,
    Brain,
    X
} from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { cn } from '../lib/utils';
import { QuestionRenderer } from '../components/exam/QuestionRenderer';
import { WeakPointAnalysisView } from '../components/exam/WeakPointAnalysisView';
import { useTheme } from 'next-themes';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface ExamRoomProps {
    questions: any[];
    answers: Record<string, any>;
    onAnswer: (id: string, value: any) => void;
    timeLeft: number;
    isFinished: boolean;
    onFinish: () => void;
    results: any;
    onReset: () => void;
}

// Navigator Component
const QuestionNavigator = ({ questions, answers, onScroll }: { questions: any[], answers: Record<string, any>, onScroll: (id: string) => void }) => (
    <Card className="rounded-3xl border-none shadow-2xl bg-card/60 backdrop-blur-xl h-full flex flex-col overflow-hidden glass-card">
        <CardHeader className="pb-4 border-b border-border/50 px-6 pt-6 bg-primary/5">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-3">
                <SquaresFour className="w-4 h-4 text-primary" weight="fill" />
                Navigation Console
            </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 px-6 overflow-y-auto custom-scrollbar flex-1">
            <div className="grid grid-cols-5 gap-2.5">
                {questions.map((q, i) => (
                    <button
                        key={q.question_id}
                        onClick={() => onScroll(q.question_id)}
                        className={cn(
                            "aspect-square rounded-xl text-[10px] font-black transition-all flex items-center justify-center border relative overflow-hidden group",
                            answers[q.question_id]
                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105 active:scale-95"
                                : "bg-muted/50 text-muted-foreground border-transparent hover:border-primary/30 hover:bg-muted/80 active:scale-95"
                        )}
                    >
                        <span className="relative z-10">{i + 1}</span>
                        {answers[q.question_id] && (
                            <div className="absolute top-0.5 right-0.5">
                                <div className="w-1 h-1 rounded-full bg-primary-foreground/50" />
                            </div>
                        )}
                        {!answers[q.question_id] && (
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </button>
                ))}
            </div>

            <div className="mt-8 space-y-4 pt-6 border-t border-border/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
                        Complete
                    </div>
                    <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        {Object.keys(answers).length}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                        Pending
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                        {questions.length - Object.keys(answers).length}
                    </span>
                </div>
            </div>
            
            <div className="mt-8 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <p className="text-[9px] font-bold text-muted-foreground leading-relaxed italic">
                    Tip: Questions can be answered in any order. Trust your intuition.
                </p>
            </div>
        </CardContent>
    </Card>
);

// Memoized Content Component
const ExamContent = React.memo(({
    questions,
    answers,
    onAnswer,
    onFinish
}: {
    questions: any[],
    answers: Record<string, any>,
    onAnswer: (id: string, value: any) => void,
    onFinish: () => void
}) => {
    const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const isMobile = useIsMobile();
    const [navOpen, setNavOpen] = useState(false);

    const scrollToQuestion = (id: string) => {
        setNavOpen(false);
        questionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
            {/* Navigation Sidebar (Desktop Only) */}
            {!isMobile && (
                <aside className="lg:col-span-3">
                    <div className="sticky top-32 h-[calc(100vh-160px)]">
                        <QuestionNavigator questions={questions} answers={answers} onScroll={scrollToQuestion} />
                    </div>
                </aside>
            )}

            {/* Mobile Nav Trigger */}
            {isMobile && (
                <div className="fixed bottom-6 right-6 z-40">
                    <Sheet open={navOpen} onOpenChange={setNavOpen}>
                        <SheetTrigger asChild>
                            <Button size="icon" className="h-14 w-14 rounded-full shadow-2xl shadow-primary/40 bg-primary text-primary-foreground">
                                <List className="w-6 h-6" weight="bold" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="p-0 h-[60vh] rounded-t-[2rem] border-0">
                            <QuestionNavigator questions={questions} answers={answers} onScroll={scrollToQuestion} />
                        </SheetContent>
                    </Sheet>
                </div>
            )}

            {/* Main Content */}
            <main className="lg:col-span-9 space-y-6 md:space-y-8 pb-32 lg:pb-0">
                {questions.map((question, index) => (
                    <div
                        key={question.question_id}
                        ref={el => questionRefs.current[question.question_id] = el}
                        className="scroll-mt-32"
                    >
                        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3 px-1">
                            <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">Question {index + 1}</span>
                            <Badge variant="outline" className="rounded-full text-[9px] md:text-[10px] uppercase font-bold">{question.question_type}</Badge>
                            {question.difficulty && (
                                <Badge variant="secondary" className="rounded-full text-[9px] md:text-[10px] uppercase font-bold">{question.difficulty}</Badge>
                            )}
                        </div>

                        <Card className="rounded-xl md:rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-md">
                            <CardContent className="p-5 md:p-8">
                                <QuestionRenderer
                                    question={question}
                                    value={answers[question.question_id]}
                                    onChange={(val) => onAnswer(question.question_id, val)}
                                />
                            </CardContent>
                        </Card>
                    </div>
                ))}


                <div className="pt-12 pb-24 text-center border-t px-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <PaperPlaneTilt className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Ready to finish?</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto leading-relaxed">Review your answers before submitting the exam. You cannot change them after submission.</p>
                    <Button
                        onClick={onFinish}
                        size="lg"
                        className="rounded-full px-12 h-12 md:h-14 font-bold shadow-xl shadow-primary/20"
                    >
                        Submit Assessment
                    </Button>
                </div>
            </main>
        </div>
    );
});
ExamContent.displayName = 'ExamContent';

export default function ExamRoom({
    questions,
    answers,
    onAnswer,
    timeLeft,
    isFinished,
    onFinish,
    results,
    onReset
}: ExamRoomProps) {

    if (isFinished && results) {
        return <WeakPointAnalysisView results={results} questions={questions} answers={answers} />;
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const answeredCount = Object.keys(answers).length;
    const progressPercent = (answeredCount / questions.length) * 100;

    return (
        <div className="bg-muted/5 min-h-screen">
            {/* Secondary Exam Bar */}
            <div className="bg-background/80 backdrop-blur-md border-b sticky top-14 z-30">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-6 min-w-0 flex-1">
                        <div className="hidden sm:block">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Progress</span>
                                <span className="text-[10px] font-bold">{Math.round(progressPercent)}%</span>
                            </div>
                            <Progress value={progressPercent} className="w-24 md:w-32 h-1.5" />
                        </div>
                        <div className="sm:hidden min-w-0">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5 truncate">
                                Question {answeredCount}/{questions.length}
                            </div>
                            <Progress value={progressPercent} className="w-20 h-1" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4 shrink-0">
                        <div className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-bold tabular-nums",
                            timeLeft < 60 ? "border-destructive text-destructive animate-pulse" : "bg-muted/50 border-transparent"
                        )}>
                            <Clock className="w-3.5 h-3.5" weight="bold" />
                            {formatTime(timeLeft)}
                        </div>
                        <Button
                            onClick={onFinish}
                            size="sm"
                            className="rounded-full shadow-lg shadow-primary/20 h-9 px-4 md:px-6 font-bold text-xs"
                        >
                            <span className="hidden xs:inline">Finish</span>
                            <span className="xs:hidden">End</span>
                        </Button>
                    </div>
                </div>
            </div>

            <ExamContent
                questions={questions}
                answers={answers}
                onAnswer={onAnswer}
                onFinish={onFinish}
            />
        </div>
    );
};
