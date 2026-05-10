import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ClockCounterClockwise,
  Calendar,
  Clock,
  Target,
  TrendUp,
  TrendDown,
  CaretRight,
  ArrowCounterClockwise,
  Brain,
  Warning,
  CheckCircle,
  XCircle,
  BookOpen,
  Lightbulb,
  ArrowLeft,
  FileText,
  ChartBar,
  Sparkle,
  CircleNotch,
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { noteMethods } from "@/data/mockData";
import { api, SubmitResponse } from "@/services/api";
import { toast } from "sonner";

// ── Interface ───────────────────────────────────────────────────────────────

interface DetailedExam {
  id: string;
  examId: string;
  courseName: string;
  date: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  difficulty: string;
  timeTaken: number;
  weakTopics: string[];
  strongTopics: string[];
  improvement: number;
  status: string;
  questions: any[];
}

// ── Component ───────────────────────────────────────────────────────────────

export default function ExamHistory() {
  const [exams, setExams] = useState<DetailedExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<DetailedExam | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "detail" | "analysis">("list");

  // ── Data Fetching ─────────────────────────────────────────────────────────

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await api.getExamHistory();
      
      // Map API SubmitResponse to UI DetailedExam structure
      const mappedExams: DetailedExam[] = data.map((item: SubmitResponse) => {
        const scorePercent = item.max_score > 0 
          ? Math.round((item.total_score / item.max_score) * 100) 
          : 0;
          
        return {
          id: item.submission_id || Math.random().toString(),
          examId: item.exam_id,
          courseName: item.exam_title || "Untitled Assessment",
          date: item.created_at || new Date().toISOString(),
          score: scorePercent,
          totalQuestions: item.max_score,
          correctAnswers: item.total_score,
          difficulty: "medium", // Default as not provided in basic list
          timeTaken: 0,         // Not provided in basic list
          weakTopics: [],      // Needs separate detail call or calculation
          strongTopics: [],    // Needs separate detail call or calculation
          improvement: 0,      // Calculated by comparing previous
          status: item.status,
          questions: item.graded_items || [],
        };
      });

      // Sort newest first
      mappedExams.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setExams(mappedExams);
    } catch (error) {
      console.error("[ExamHistory] Failed to fetch:", error);
      toast.error("Could not load exam history.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleViewAnalysis = (exam: DetailedExam) => {
    setSelectedExam(exam);
    setViewMode("analysis");
  };

  const handleReExam = (examId: string) => {
    window.location.href = `/exam?retake=${examId}`;
  };

  return (
    <DashboardLayout title="Exam History">
      {viewMode === "list" && (
        <div className="space-y-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ClockCounterClockwise className="w-5 h-5" />
                Past Exams
              </CardTitle>
              <CardDescription>Click on any exam to view detailed analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                  <CircleNotch className="w-10 h-10 animate-spin text-primary" />
                  <p className="text-sm font-bold uppercase tracking-widest">Retrieving results...</p>
                </div>
              ) : exams.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto opacity-20">
                    <ClockCounterClockwise className="w-8 h-8" />
                  </div>
                  <p className="text-muted-foreground">You haven't completed any exams yet.</p>
                  <Button variant="outline" asChild>
                    <Link to="/exam">Start Your First Exam</Link>
                  </Button>
                </div>
              ) : (
                exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="p-5 rounded-2xl border bg-card hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => handleViewAnalysis(exam)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl",
                            exam.score >= 80
                              ? "bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-600"
                              : exam.score >= 60
                                ? "bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 text-yellow-600"
                                : "bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 text-red-600"
                          )}
                        >
                          {exam.score}%
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{exam.courseName}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(exam.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {exam.totalQuestions} questions
                            </span>
                            <Badge variant="outline" className="text-[10px] uppercase tracking-tighter">
                              {exam.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <CaretRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-2">
                      <div className="p-3 rounded-xl bg-muted/50">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-wider">Correct</p>
                        <p className="text-lg font-semibold text-success">{exam.correctAnswers}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/50">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-wider">Incorrect</p>
                        <p className="text-lg font-semibold text-destructive">{exam.totalQuestions - exam.correctAnswers}</p>
                      </div>
                      <div className="hidden sm:block p-3 rounded-xl bg-muted/50">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-wider">Rank</p>
                        <p className="text-lg font-semibold">--</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {viewMode === "analysis" && selectedExam && (
        <div className="space-y-6 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => setViewMode("list")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to History
          </Button>

          <Card className="bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="mb-3 uppercase">{selectedExam.status}</Badge>
                  <h1 className="text-2xl font-bold mb-2">{selectedExam.courseName}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedExam.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={cn(
                      "text-5xl font-bold",
                      selectedExam.score >= 80
                        ? "text-success"
                        : selectedExam.score >= 60
                          ? "text-warning"
                          : "text-destructive"
                    )}
                  >
                    {selectedExam.score}%
                  </div>
                  <p className="text-muted-foreground">
                    {selectedExam.correctAnswers}/{selectedExam.totalQuestions} correct
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={() => handleReExam(selectedExam.examId)} className="gradient-primary shadow-lg shadow-primary/20">
              <ArrowCounterClockwise className="w-4 h-4 mr-2" />
              Re-take This Exam
            </Button>
            <Button variant="outline" asChild className="rounded-xl">
              <Link to="/notes">
                <BookOpen className="w-4 h-4 mr-2" />
                Study Weak Topics
              </Link>
            </Button>
          </div>

          {selectedExam.questions && selectedExam.questions.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ChartBar className="w-5 h-5 text-primary" />
                  Detailed Results
                </CardTitle>
                <CardDescription>Breakdown of your responses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedExam.questions.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-xl border bg-muted/20">
                    <div className="flex items-start gap-3">
                      {q.is_correct ? (
                        <CheckCircle className="w-5 h-5 text-success mt-1" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive mt-1" />
                      )}
                      <div>
                        <p className="font-medium text-sm mb-2">{q.question_id}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="p-2 rounded bg-background border">
                            <span className="text-muted-foreground block mb-1">Your Answer</span>
                            <span>{JSON.stringify(q.user_answer)}</span>
                          </div>
                          <div className="p-2 rounded bg-success/5 border border-success/20">
                            <span className="text-success block mb-1">Feedback</span>
                            <span>{q.feedback_note || "Great job!"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-20 text-center space-y-4">
                <Target className="w-12 h-12 mx-auto text-muted-foreground opacity-20" />
                <div className="max-w-xs mx-auto">
                  <p className="font-bold text-lg">No Item Breakdown</p>
                  <p className="text-sm text-muted-foreground">Detailed question analysis is only available for exams submitted through the advanced engine.</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkle className="w-5 h-5 text-primary" />
                Questy AI Insight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl bg-background border border-primary/10">
                <p className="text-sm leading-relaxed">
                  Based on your score of <span className="font-bold text-primary">{selectedExam.score}%</span>, you have a solid grasp of the material. 
                  {selectedExam.score < 80 ? " To reach mastery, I recommend focusing on the questions you missed and using the Feynman Technique to explain the concepts in your own words." : " You are performing at an elite level. Try a 'Hard' difficulty exam next to push your boundaries!"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}