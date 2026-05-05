import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  CaretRight,
  TrendUp,
  Target,
  RocketLaunch,
  Faders,
  Funnel,
  ChartBar,
  CheckCircle,
  Clock,
  Sparkle,
  Lightning,
  GraduationCap,
  ArrowRight,
  CircleNotch
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Layout } from "@/components/layout/Layout";
import { cn } from "@/lib/utils";
import { questionTypes } from "@/data/mockData";
import ExamRoom from "./ExamRoom";
import { api, ExamQuestion, SubmitResponse } from "@/services/api";
import { collectionsService, Collection } from "@/services/collectionsService";
import { materialService, AnalyzedChapter } from "@/services/materialService";
import { useMaterial } from "@/contexts/MaterialContext";
import { toast } from "sonner";

export default function Exam() {
  const { collectionId: sessionCollectionId } = useMaterial();
  const [step, setStep] = useState<"configure" | "exam">("configure");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chapters, setChapters] = useState<AnalyzedChapter[]>([]);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  
  // Exam State
  const [examId, setExamId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState<SubmitResponse | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [config, setConfig] = useState({
    questionTypes: ['mcq', 'true-false', 'fill-blank', 'matching', 'coding'],
    questionCount: 10,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard' | 'mixed',
  });

  // Fetch collections on mount
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const data = await collectionsService.getCollections();
        setCollections(data);
      } catch (error: any) {
        console.error("--- Collection Fetch Error (Exam Page) ---");
        console.error("URL: /api/collections/");
        
        // Fallback to session collection if available
        if (sessionCollectionId) {
          const fallbackCollection: Collection = {
            collection_id: sessionCollectionId,
            title: "Current Session Collection",
            description: "Materials you just uploaded and processed",
            created_at: new Date().toISOString()
          };
          setCollections([fallbackCollection]);
          toast.info("Using collection from your current session.");
        } else {
          toast.error("Failed to load your study collections. Please try again.");
        }
      } finally {
        setIsLoadingCollections(false);
      }
    };
    fetchCollections();
  }, [sessionCollectionId]);

  // Fetch chapters when collection is selected
  useEffect(() => {
    if (activeCollectionId) {
      const fetchChapters = async () => {
        setIsLoadingChapters(true);
        try {
          // Using analyze endpoint to get chapters for now as per materialService capabilities
          const data = await materialService.analyze(activeCollectionId);
          setChapters(data.chapters || []);
        } catch (error) {
          console.error("Failed to fetch chapters for collection:", error);
          setChapters([]);
        } finally {
          setIsLoadingChapters(false);
        }
      };
      fetchChapters();
    } else {
      setChapters([]);
    }
  }, [activeCollectionId]);

  // Timer logic
  useEffect(() => {
    if (step === "exam" && !isFinished && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, isFinished, timeLeft]);

  const selectedCollection = collections.find((c) => c.collection_id === activeCollectionId);

  const handleStart = async () => {
    if (!activeCollectionId) return;
    
    setIsGenerating(true);
    try {
      // Map question type IDs to labels for the backend
      const selectedTypeLabels = config.questionTypes.map(typeId => {
        const type = questionTypes.find(t => t.id === typeId);
        return type ? type.label : typeId;
      });

      // Capitalize difficulty for backend consistency
      const formattedDifficulty = config.difficulty === 'mixed' 
        ? "Medium" 
        : config.difficulty.charAt(0).toUpperCase() + config.difficulty.slice(1);

      // Get all chapter IDs from the fetched chapters
      const chapterIds = chapters.map(ch => ch.chapter_id);

      const examData = await api.generateExam({
        collection_id: activeCollectionId,
        chapter_ids: chapterIds,
        question_count: config.questionCount,
        difficulty: formattedDifficulty,
        question_types: selectedTypeLabels
      });
      
      setExamId(examData.exam_id);
      setQuestions(examData.questions);
      setAnswers({});
      setTimeLeft(config.questionCount * 1.5 * 60); // 1.5 mins per question
      setIsFinished(false);
      setResults(null);
      setStep("exam");
      toast.success("Exam generated successfully!");
    } catch (error: any) {
      console.error("Failed to generate exam:", error);
      
      if (error.code === 'ERR_NETWORK' || !error.response) {
        toast.error("Network error – cannot reach exam service");
      } else {
        const backendMessage = error.response?.data?.detail || error.response?.data?.message || error.response?.data?.error || "Failed to generate exam. AI might be busy, try again.";
        toast.error(backendMessage);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const setAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleFinish = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const response = await api.submitExam({
        exam_id: examId || '',
        answers: answers
      });
      setResults(response);
      setIsFinished(true);
      toast.success("Assessment submitted!");
    } catch (error) {
      console.error("Failed to submit exam:", error);
      toast.error("Failed to submit assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "exam" && questions.length > 0) {
    return (
      <Layout showSidebar={false} title="Practice Exam">
        <ExamRoom
          questions={questions}
          answers={answers}
          onAnswer={setAnswer}
          timeLeft={timeLeft}
          isFinished={isFinished}
          onFinish={handleFinish}
          results={results}
          onReset={() => setStep("configure")}
        />
        {isSubmitting && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center">
            <CircleNotch className="w-12 h-12 text-primary animate-spin mb-4" weight="bold" />
            <p className="text-lg font-bold">Submitting your answers...</p>
          </div>
        )}
      </Layout>
    );
  }

  return (
    <Layout title="Exam Room">
      <div className="container py-4 max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8 text-center md:text-left">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Exam Room</h1>
            <p className="text-sm text-muted-foreground mt-1">Configure and start your practice assessment</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {/* Step 1: Collection Selection */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">1</div>
                <h2 className="text-lg md:text-xl font-bold">Select Study Collection</h2>
              </div>

              {isLoadingCollections ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : collections.length === 0 ? (
                <Card className="p-8 md:p-12 text-center border-dashed">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-7 h-7 md:w-8 md:h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold mb-2">No collections found</h3>
                  <p className="text-sm text-muted-foreground mb-6">Upload some study materials first and process them into a collection.</p>
                  <Button asChild size="sm">
                    <Link to="/upload">Upload & Process</Link>
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {collections.map((collection) => (
                    <button
                      key={collection.collection_id}
                      onClick={() => setActiveCollectionId(collection.collection_id)}
                      className={cn(
                        "group relative p-4 rounded-xl border transition-all duration-300 text-left h-full",
                        activeCollectionId === collection.collection_id
                          ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                          : "bg-card hover:bg-accent/50 border-border"
                      )}
                    >
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className={cn(
                          "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-xl md:text-2xl transition-transform duration-300 shrink-0",
                          activeCollectionId === collection.collection_id ? "bg-primary text-primary-foreground scale-110" : "bg-muted group-hover:scale-110"
                        )}>
                          {collection.icon || <GraduationCap weight="fill" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm md:text-lg mb-1 truncate">{collection.title}</h3>
                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 leading-snug">{collection.description}</p>
                        </div>
                        {activeCollectionId === collection.collection_id && (
                          <CheckCircle className="w-5 h-5 text-primary absolute top-4 right-4" weight="fill" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Step 2: Customization */}
            <section className={cn("transition-all duration-500", !activeCollectionId && "opacity-50 pointer-events-none")}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">2</div>
                <h2 className="text-lg md:text-xl font-bold">Customize Assessment</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="rounded-xl border">
                  <CardHeader className="pb-3 px-4">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 px-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Questions</label>
                        <span className="text-base font-bold">{config.questionCount}</span>
                      </div>
                      <Slider
                        value={[config.questionCount]}
                        onValueChange={([val]) => setConfig(p => ({ ...p, questionCount: val }))}
                        max={30} min={5} step={5}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Difficulty</label>
                      <div className="grid grid-cols-4 gap-2">
                        {['easy', 'medium', 'hard', 'mixed'].map(level => (
                          <button
                            key={level}
                            onClick={() => setConfig(p => ({ ...p, difficulty: level as any }))}
                            className={cn(
                              "py-2 px-1 text-[9px] md:text-[10px] uppercase font-bold rounded-lg border transition-all truncate",
                              config.difficulty === level
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                            )}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="p-4 rounded-xl bg-muted/50 border ">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Included Types</p>
                  <div className="flex flex-wrap gap-2">
                    {questionTypes.map(t => (
                      <Badge
                        key={t.id}
                        variant={config.questionTypes.includes(t.id) ? "default" : "outline"}
                        className="cursor-pointer py-1 px-3 rounded-full transition-all text-[9px] md:text-xs"
                        onClick={() => setConfig(p => ({
                          ...p,
                          questionTypes: p.questionTypes.includes(t.id)
                            ? p.questionTypes.filter(id => id !== t.id)
                            : [...p.questionTypes, t.id]
                        }))}
                      >
                        {t.label}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-[9px] md:text-[10px] text-muted-foreground mt-4 italic leading-tight">
                    Note: Question types depend on collection content and AI availability.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-4">
              <Card className="rounded-xl border overflow-hidden glass-card">
                <CardHeader className="bg-primary/5 pb-4 px-4 md:px-6">
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl font-bold">
                    <RocketLaunch className="w-5 h-5 md:w-6 md:h-6 text-primary" weight="fill" />
                    Launch Exam
                  </CardTitle>
                  <CardDescription className="text-xs">Review your configuration before initiating</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6 px-4 md:px-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-xs text-muted-foreground">Collection</span>
                      <span className="text-xs font-bold truncate max-w-[120px] md:max-w-[150px]">
                        {selectedCollection?.title || "Not Selected"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div className="p-2 md:p-3 rounded-xl bg-muted/50 text-center">
                        <span className="text-[10px] text-muted-foreground block">Questions</span>
                        <span className="text-lg md:text-xl font-bold">{config.questionCount}</span>
                      </div>
                      <div className="p-2 md:p-3 rounded-xl bg-muted/50 text-center">
                        <span className="text-[10px] text-muted-foreground block">Est. Time</span>
                        <span className="text-lg md:text-xl font-bold">{Math.round(config.questionCount * 1.5)}m</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 md:p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                    <Sparkle className="w-4 h-4 text-primary shrink-0 mt-0.5" weight="fill" />
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Questy AI will generate fresh questions based on your specific study collection.
                    </p>
                  </div>

                  <Button
                    className="w-full py-5 md:py-6 text-base md:text-lg font-bold rounded-xl shadow-lg shadow-primary/20 transition-transform active:scale-95"
                    disabled={!activeCollectionId || isGenerating}
                    onClick={handleStart}
                  >
                    {isGenerating ? (
                      <>
                        <CircleNotch className="mr-2 w-4 h-4 md:w-5 md:h-5 animate-spin" weight="bold" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Start Assessment
                        <CaretRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Link to="/questy-chat" className="block transition-transform active:scale-[0.98]">
                <Card className="rounded-xl border-none shadow-sm bg-accent/50 hover:bg-accent/70 transition-colors cursor-pointer">
                  <CardContent className="p-3 md:p-4 flex items-center gap-3 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground shrink-0">
                      <Brain className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-bold leading-none truncate">AI Study Partner</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground mt-1 truncate">Chat for quick revision</p>
                    </div>
                    <div className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-full bg-background/50 text-muted-foreground group-hover:text-primary transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
