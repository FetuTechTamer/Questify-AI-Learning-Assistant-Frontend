import { useState, useEffect } from "react";
import { StudySessionLayout } from "@/components/study/StudySessionLayout";
import { Stack, ArrowCounterClockwise, Check, X } from "@phosphor-icons/react";
import { MOCK_FLASHCARDS, Flashcard } from "@/data/mockFlashcards";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { api } from "@/services/api";
import { toast } from "sonner";

export function LeitnerSystem({
    onBack,
    collectionId,
}: {
    onBack: () => void;
    bookFilename?: string;
    chapterId?: string;
    courseId?: string;
    collectionId?: string;
}) {
    const [cards, setCards] = useState<Flashcard[]>(MOCK_FLASHCARDS);
    const [currentBox, setCurrentBox] = useState<number>(1);
    const [activeCardIndex, setActiveCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!collectionId) {
            setIsLoading(false);
            return;
        }

        const fetchState = async () => {
            try {
                const state = await api.getLeitnerState(collectionId);

                if (state?.boxes) {
                    const flattenedCards: Flashcard[] = [];

                    state.boxes.forEach((box: any) => {
                        box.cards.forEach((card: any) => {
                            flattenedCards.push({
                                id: card.id,
                                topic: card.topic || "General",
                                question: card.question,
                                answer: card.answer,
                                difficulty: card.difficulty || "medium", // ✅ ADD THIS
                                box: (box.level || 1) as 1 | 2 | 3 | 4 | 5,
                            });
                        });
                    });

                    if (flattenedCards.length > 0) {
                        setCards(flattenedCards);
                    }
                }
            } catch (error) {
                console.error("Failed to load Leitner state", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchState();
    }, [collectionId]);

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
                                "flex flex-col items-center p-4 border transition-all duration-300 relative",
                                currentBox === box
                                    ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20"
                                    : "bg-card hover:bg-accent/50"
                            )}
                        >
                            <span className="text-xs font-bold text-muted-foreground uppercase">
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
                        {isLoading ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                <p className="text-muted-foreground">
                                    Loading your cards...
                                </p>
                            </div>
                        ) : !isSessionComplete && activeCard ? (
                            <div className="w-full max-w-2xl">
                                <motion.div
                                    key={activeCard.id}
                                    initial={{ x: 100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -100, opacity: 0 }}
                                    className={cn(
                                        "relative w-full aspect-[3/2] cursor-pointer transition-transform duration-500",
                                        isFlipped ? "rotate-y-180" : ""
                                    )}
                                    onClick={() => setIsFlipped((p) => !p)}
                                >
                                    {/* Front */}
                                    <div className="absolute inset-0 bg-card border shadow-xl p-10 flex flex-col items-center justify-center text-center">
                                        <Badge className="mb-4">
                                            {activeCard.topic}
                                        </Badge>
                                        <h3 className="text-2xl font-bold">
                                            {activeCard.question}
                                        </h3>
                                    </div>

                                    {/* Back */}
                                    <div className="absolute inset-0 bg-slate-900 text-white border shadow-xl p-10 flex items-center justify-center text-center">
                                        <p>{activeCard.answer}</p>
                                    </div>
                                </motion.div>

                                {/* Controls */}
                                <div className="flex gap-4 mt-8 justify-center">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleRate(false)}
                                    >
                                        <X className="mr-2" /> Incorrect
                                    </Button>
                                    <Button
                                        className="bg-green-600 text-white"
                                        onClick={() => handleRate(true)}
                                    >
                                        <Check className="mr-2" /> Correct
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-4">
                                <h2 className="text-2xl font-bold">
                                    Box {currentBox} Complete!
                                </h2>
                                <Button
                                    onClick={() => {
                                        setCurrentBox(1);
                                        setActiveCardIndex(0);
                                    }}
                                >
                                    <ArrowCounterClockwise className="mr-2" />
                                    Restart
                                </Button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Progress */}
                <div className="max-w-2xl mx-auto w-full">
                    <Progress value={progressValue} />
                </div>

            </div>
        </StudySessionLayout>
    );
}