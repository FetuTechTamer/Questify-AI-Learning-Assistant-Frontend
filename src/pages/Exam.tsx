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
import { materialService, Material } from "@/services/materialService";
import { useMaterial } from "@/contexts/MaterialContext";
import { toast } from "sonner";

export default function Exam() {
  const { files } = useMaterial();
  const [step, setStep] = useState<"configure" | "exam">("configure");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeMaterialId, setActiveMaterialId] = useState<string | null>(null);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  // Fetch materials on mount
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const data = await materialService.getMaterials();
        setMaterials(data);
      } catch (error: any) {
        console.error("--- Material Fetch Error (Exam Page) ---");
        console.error("URL: /api/material/");
        if (error.response) {
          console.error("Status Code:", error.response.status);
          console.error("Response Text:", JSON.stringify(error.response.data));
        } else {
          console.error("Error Object:", error);
        }
        console.error("----------------------------------------");

        // Fallback to session files
        const fallbackMaterials: Material[] = files
          .filter(f => f.status === "done")
          .map(f => ({
            id: f.id,
            title: f.name,
            name: f.name,
            description: "Session Upload",
            created_at: new Date().toISOString()
          }));

        if (fallbackMaterials.length > 0) {
          setMaterials(fallbackMaterials);
          toast.info("Unable to load all materials from server. Showing your uploaded files from this session.");
        } else {
          toast.error("Failed to load your materials. Please try again.");
        }
      } finally {
        setIsLoadingMaterials(false);
      }
    };
    fetchMaterials();
  }, []);

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

  const selectedMaterial = materials.find((m) => m.id === activeMaterialId);

  const handleStart = async () => {
    if (!activeMaterialId) return;
    
    setIsGenerating(true);
    try {
      const examData = await api.generateExam({
        material_id: activeMaterialId,
        question_count: config.questionCount,
        difficulty: config.difficulty === 'mixed' ? undefined : config.difficulty
      });
      
      setExamId(examData.exam_id);
      setQuestions(examData.questions);
      setAnswers({});
      setTimeLeft(config.questionCount * 1.5 * 60); // 1.5 mins per question
      setIsFinished(false);
      setResults(null);
      setStep("exam");
      toast.success("Exam generated successfully!");
    } catch (error) {
      console.error("Failed to generate exam:", error);
      toast.error("Failed to generate exam. AI might be busy, try again.");
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
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <CircleNotch className="w-12 h-12 text-primary animate-spin mb-4" weight="bold" />
            <p className="text-lg font-bold">Submitting your answers...</p>
          </div>
        )}
      </Layout>
    );
  }

  return (
    <Layout title="Exam Room">
      <div className="container py-4 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Exam Room</h1>
            <p className="text-muted-foreground mt-1">Configure and start your practice assessment</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {/* Step 1: Material Selection */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">1</div>
                <h2 className="text-xl font-bold">Select Study Material</h2>
              </div>

              {isLoadingMaterials ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : materials.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">No materials found</h3>
                  <p className="text-muted-foreground mb-6">Upload some study materials first to generate an exam.</p>
                  <Button asChild>
                    <Link to="/upload">Upload Material</Link>
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {materials.map((material) => (
                    <button
                      key={material.id}
                      onClick={() => setActiveMaterialId(material.id)}
                      className={cn(
                        "group relative p-4 rounded-lg border transition-all duration-300 text-left h-full",
                        activeMaterialId === material.id
                          ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                          : "bg-card hover:bg-accent/50 border-border"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300",
                          activeMaterialId === material.id ? "bg-primary text-primary-foreground scale-110" : "bg-muted group-hover:scale-110"
                        )}>
                          {material.icon || <GraduationCap weight="fill" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{material.title || material.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{material.description}</p>
                        </div>
                        {activeMaterialId === material.id && (
                          <CheckCircle className="w-6 h-6 text-primary absolute top-4 right-4" weight="fill" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Step 2: Customization */}
            <section className={cn("transition-all duration-500", !activeMaterialId && "opacity-50 pointer-events-none")}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">2</div>
                <h2 className="text-xl font-bold">Customize Assessment</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="rounded-lg border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Questions</label>
                        <span className="text-lg font-bold">{config.questionCount}</span>
                      </div>
                      <Slider
                        value={[config.questionCount]}
                        onValueChange={([val]) => setConfig(p => ({ ...p, questionCount: val }))}
                        max={30} min={5} step={5}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Difficulty</label>
                      <div className="grid grid-cols-4 gap-2">
                        {['easy', 'medium', 'hard', 'mixed'].map(level => (
                          <button
                            key={level}
                            onClick={() => setConfig(p => ({ ...p, difficulty: level as any }))}
                            className={cn(
                              "py-2 px-1 text-[10px] uppercase font-bold rounded-lg border transition-all",
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

                <div className="p-4 rounded-2xl bg-muted/50 border ">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Included Types</p>
                  <div className="flex flex-wrap gap-2">
                    {questionTypes.map(t => (
                      <Badge
                        key={t.id}
                        variant={config.questionTypes.includes(t.id) ? "default" : "outline"}
                        className="cursor-pointer py-1 px-3 rounded-full transition-all"
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
                  <p className="text-[10px] text-muted-foreground mt-4 italic">
                    Note: Question types depend on material content and AI availability.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <Card className="rounded-lg  border overflow-hidden glass-card">
                <CardHeader className="bg-primary/5 pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <RocketLaunch className="w-6 h-6 text-primary" weight="fill" />
                    Launch Exam
                  </CardTitle>
                  <CardDescription>Review your configuration before initiating</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-muted-foreground">Material</span>
                      <span className="text-sm font-bold truncate max-w-[150px]">
                        {selectedMaterial?.title || selectedMaterial?.name || "Not Selected"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-xl bg-muted/50 text-center">
                        <span className="text-xs text-muted-foreground block">Questions</span>
                        <span className="text-xl font-bold">{config.questionCount}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/50 text-center">
                        <span className="text-xs text-muted-foreground block">Est. Time</span>
                        <span className="text-xl font-bold">{Math.round(config.questionCount * 1.5)}m</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                    <Sparkle className="w-4 h-4 text-primary shrink-0 mt-0.5" weight="fill" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Questy AI will generate fresh questions based on your specific study material.
                    </p>
                  </div>

                  <Button
                    className="w-full py-6 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 transition-transform active:scale-95"
                    disabled={!activeMaterialId || isGenerating}
                    onClick={handleStart}
                  >
                    {isGenerating ? (
                      <>
                        <CircleNotch className="mr-2 w-5 h-5 animate-spin" weight="bold" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Start Assessment
                        <CaretRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-none shadow-sm bg-accent/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none">AI Study Partner</p>
                    <p className="text-xs text-muted-foreground mt-1">Chat for quick revision</p>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full" asChild>
                    <Link to="/questy-chat"><ArrowRight className="w-4 h-4" /></Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
