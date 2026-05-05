import { useState, useEffect } from "react";
import { StudySessionLayout } from "@/components/study/StudySessionLayout";
import { Stack, ArrowCounterClockwise, Check, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { api } from "@/services/api";
import { toast } from "sonner";

interface Flashcard {
    id: string;
    topic: string;
    question: string;
    answer: string;
    difficulty: string;
    box: 1 | 2 | 3 | 4 | 5;
}

export function LeitnerSystem({
    onBack,
    collectionId,
    studyData
}: {
    onBack: () => void;
    collectionId: string;
    studyData: any;
}) {
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [currentBox, setCurrentBox] = useState<number>(1);
    const [activeCardIndex, setActiveCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // Initialize cards from studyData
    useEffect(() => {
        if (studyData && studyData.boxes) {
            const flattenedCards: Flashcard[] = [];
            studyData.boxes.forEach((box: any) => {
                const boxLevel = (box.level || 1) as 1 | 2 | 3 | 4 | 5;
                if (Array.isArray(box.cards)) {
                    box.cards.forEach((card: any) => {
                        flattenedCards.push({
                            id: card.id || card.card_id,
                            topic: card.topic || "Core Concept",
                            question: card.question,
                            answer: card.answer,
                            difficulty: card.difficulty || "medium",
                            box: boxLevel,
                        });
                    });
                }
            });
            setCards(flattenedCards);
        } else if (Array.isArray(studyData)) {
            // Support flat array if backend returns it
            setCards(studyData.map((c: any) => ({
                id: c.id || c.card_id,
                topic: c.topic || "Core Concept",
                question: c.question,
                answer: c.answer,
                difficulty: c.difficulty || "medium",
                box: (c.box || 1) as 1 | 2 | 3 | 4 | 5
            })));
        }
    }, [studyData]);

    const boxCards = cards.filter((c) => c.box === currentBox);
    const activeCard = boxCards[activeCardIndex];
    const isSessionComplete = activeCardIndex >= boxCards.length;

    const handleRate = async (correct: boolean) => {
        if (!activeCard) return;

        const newBox = correct ? Math.min(activeCard.box + 1, 5) : 1;

        setCards((prev) =>
            prev.map((c) =>
                c.id === activeCard.id
                    ? { ...c, box: newBox as 1 | 2 | 3 | 4 | 5 }
                    : c
            )
        );

        if (collectionId) {
            try {
                await api.updateLeitnerProgress({
                    collection_id: collectionId,
                    card_id: activeCard.id,
                    success: correct,
                });
            } catch (err) {
                console.error("Failed to update card progress", err);
                toast.error("Failed to sync progress");
            }
        }

        setIsFlipped(false);
        setTimeout(() => {
            setActiveCardIndex((prev) => prev + 1);
        }, 150);
    };

    const getBoxCount = (boxNum: number) =>
        cards.filter((c) => c.box === boxNum).length;

    const progressValue =
        boxCards.length === 0
            ? 0
            : (activeCardIndex / boxCards.length) * 100;

    return (
        <StudySessionLayout
            title="Leitner System"
            subtitle="Spaced Repetition Boxes"
            icon={Stack}
            color="text-amber-500"
            onExit={onBack}
        >
            <div className="h-full flex flex-col max-w-5xl mx-auto w-full p-6 gap-8">

                {/* Top Boxes */}
                <div className="grid grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map((box) => (
                        <button
                            key={box}
                            onClick={() => {
                                setCurrentBox(box);
                                setActiveCardIndex(0);
                                setIsFlipped(false);
                            }}
                            className={cn(
                                "flex flex-col items-center p-4 border transition-all duration-300 relative rounded-xl",
                                currentBox === box
                                    ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20"
                                    : "bg-card hover:bg-accent/50"
                            )}
                        >
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                Box {box}
                            </span>
                            <span className="text-2xl font-black">
                                {getBoxCount(box)}
                            </span>

                            {currentBox === box && (
                                <motion.div
                                    layoutId="activeBox"
                                    className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Main Area */}
                <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {!isSessionComplete && activeCard ? (
                            <div className="w-full max-w-2xl">
                                <div className="perspective-1000">
                                    <motion.div
                                        key={activeCard.id}
                                        initial={{ x: 100, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -100, opacity: 0 }}
                                        className={cn(
                                            "relative w-full aspect-[3/2] cursor-pointer transition-transform duration-500 preserve-3d",
                                            isFlipped ? "rotate-y-180" : ""
                                        )}
                                        onClick={() => setIsFlipped((p) => !p)}
                                    >
                                        {/* Front */}
                                        <div className="absolute inset-0 bg-card border rounded-3xl shadow-xl p-10 flex flex-col items-center justify-center text-center backface-hidden">
                                            <Badge variant="outline" className="mb-4 uppercase tracking-widest text-[10px]">
                                                {activeCard.topic}
                                            </Badge>
                                            <h3 className="text-2xl font-bold leading-tight">
                                                {activeCard.question}
                                            </h3>
                                            <p className="mt-8 text-xs text-muted-foreground font-medium uppercase tracking-tighter">Click to flip</p>
                                        </div>

                                        {/* Back */}
                                        <div className="absolute inset-0 bg-slate-900 text-white border rounded-3xl shadow-xl p-10 flex items-center justify-center text-center rotate-y-180 backface-hidden">
                                            <div className="space-y-4">
                                                <p className="text-xl leading-relaxed">{activeCard.answer}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Controls */}
                                <div className="flex gap-4 mt-8 justify-center">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="h-14 px-8 rounded-2xl border-destructive/20 hover:bg-destructive/10 text-destructive"
                                        onClick={(e) => { e.stopPropagation(); handleRate(false); }}
                                    >
                                        <X className="mr-2 w-5 h-5" /> Incorrect
                                    </Button>
                                    <Button
                                        size="lg"
                                        className="h-14 px-8 rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
                                        onClick={(e) => { e.stopPropagation(); handleRate(true); }}
                                    >
                                        <Check className="mr-2 w-5 h-5" /> Correct
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                    <Check className="w-10 h-10" weight="bold" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black">
                                        Box {currentBox} Mastery!
                                    </h2>
                                    <p className="text-muted-foreground">You've reviewed all cards in this proficiency level.</p>
                                </div>
                                <Button
                                    size="lg"
                                    className="rounded-xl px-8"
                                    onClick={() => {
                                        setCurrentBox(1);
                                        setActiveCardIndex(0);
                                    }}
                                >
                                    <ArrowCounterClockwise className="mr-2" />
                                    Restart from Box 1
                                </Button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Progress */}
                <div className="max-w-2xl mx-auto w-full space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        <span>Progress</span>
                        <span>{Math.round(progressValue)}%</span>
                    </div>
                    <Progress value={progressValue} className="h-2" />
                </div>

            </div>
        </StudySessionLayout>
    );
}