import { useState } from "react";
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
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { examResults, courses, noteMethods } from "@/data/mockData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DetailedExam {
  id: string;
  courseId: string;
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
  questions: {
    id: string;
    question: string;
    type: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    topic: string;
    explanation: string;
    whyWrong?: string;
    conceptTested?: string;
    intelligenceType?: string;
    materialReference?: string;
    howToFix?: string;
  }[];
}

// Enhanced mock exam history with deep analysis
const detailedExamHistory: DetailedExam[] = [
  {
    id: "exam1",
    courseId: "cs101",
    courseName: "Computer Science Fundamentals",
    date: "2024-01-15",
    score: 85,
    totalQuestions: 20,
    correctAnswers: 17,
    difficulty: "medium",
    timeTaken: 35,
    weakTopics: ["Recursion", "Big O Notation"],
    strongTopics: ["Variables", "Control Flow", "Arrays"],
    improvement: 8,
    questions: [
      {
        id: "q1",
        question: "What is the time complexity of binary search?",
        type: "mcq",
        userAnswer: "O(n)",
        correctAnswer: "O(log n)",
        isCorrect: false,
        topic: "Big O Notation",
        explanation: "Binary search divides the search space in half with each step.",
        whyWrong: "You confused linear search (O(n)) with binary search. This is a common misconception. Linear search checks each element one by one, while binary search eliminates half of the remaining elements in each step by comparing with the middle element. This is why binary search requires a sorted array - it uses the ordering to make intelligent decisions about which half to search.",
        conceptTested: "Understanding of logarithmic time complexity and divide-and-conquer algorithms",
        intelligenceType: "Logical-Mathematical Intelligence - This question tests your ability to recognize patterns in how algorithms scale with input size",
        materialReference: "Chapter 3: Algorithm Analysis, Section 3.2 'Logarithmic Complexity' - The material explains that any algorithm that halves the problem size at each step has O(log n) complexity. Examples include binary search, balanced BST operations, and merge sort's divide step.",
        howToFix: "Practice calculating time complexity step-by-step. For binary search: with n elements, after 1 step you have n/2, after 2 steps n/4, after k steps n/2^k. When n/2^k = 1, k = log₂(n). Use the Mind Map note method to visualize different complexity classes and their growth rates.",
      },
      {
        id: "q2",
        question: "What is the base case in recursion?",
        type: "fill-blank",
        userAnswer: "loop",
        correctAnswer: "termination condition",
        isCorrect: false,
        topic: "Recursion",
        explanation: "The base case is the condition that stops the recursive calls.",
        whyWrong: "You associated recursion with loops, which shows a fundamental misunderstanding. While both achieve repetition, they work differently. Loops use iteration with explicit counters, while recursion uses function calls that must eventually terminate. The base case is what prevents infinite recursion - it's the 'exit door' that the function reaches when the problem is small enough to solve directly without further recursion.",
        conceptTested: "Understanding of recursive function structure and termination conditions",
        intelligenceType: "Abstract Reasoning - This tests your ability to understand self-referential concepts and the importance of boundary conditions",
        materialReference: "Chapter 4: Recursion Fundamentals, Section 4.1 'Anatomy of Recursive Functions' - Every recursive function has two parts: base case (when to stop) and recursive case (when to continue). The factorial example shows: base case is n=0 returning 1, recursive case is n*factorial(n-1).",
        howToFix: "Use the Feynman technique: try to explain recursion to a beginner. Draw the call stack for a simple recursive function like factorial(5). See how each call waits for the next, and how the base case finally returns a concrete value that 'unwinds' the stack. Practice with Cornell notes, dedicating the left column to base cases and right column to recursive cases.",
      },
      {
        id: "q3",
        question: "Arrays in most programming languages use zero-based indexing.",
        type: "true-false",
        userAnswer: "true",
        correctAnswer: "true",
        isCorrect: true,
        topic: "Arrays",
        explanation: "Most languages like C, Java, JavaScript, Python use 0-based indexing.",
      },
    ],
  },
  {
    id: "exam2",
    courseId: "cs101",
    courseName: "Computer Science Fundamentals",
    date: "2024-01-10",
    score: 77,
    totalQuestions: 25,
    correctAnswers: 19,
    difficulty: "hard",
    timeTaken: 45,
    weakTopics: ["Trees", "Graphs", "Normalization"],
    strongTopics: ["Linked Lists", "Stacks"],
    improvement: -3,
    questions: [
      {
        id: "q1",
        question: "What traversal order does a pre-order tree traversal follow?",
        type: "mcq",
        userAnswer: "Left, Right, Root",
        correctAnswer: "Root, Left, Right",
        isCorrect: false,
        topic: "Trees",
        explanation: "Pre-order the visits the root first, then left subtree, then right subtree.",
        whyWrong: "You described post-order traversal (Left, Right, Root) instead of pre-order. This is a common confusion because the naming convention isn't intuitive at first. The 'pre', 'in', and 'post' refer to WHEN the root is processed: PRE-order processes root BEFORE children, IN-order processes root IN BETWEEN left and right, POST-order processes root AFTER children.",
        conceptTested: "Understanding of tree traversal algorithms and their applications",
        intelligenceType: "Spatial Intelligence - This tests your ability to mentally navigate hierarchical structures and track position within them",
        materialReference: "Chapter 5: Tree Data Structures, Section 5.3 'Tree Traversals' - The mnemonic 'Pre means root First' helps remember. Pre-order is used for copying trees and prefix expressions, In-order gives sorted order in BST, Post-order is used for deletion and postfix expressions.",
        howToFix: "Draw a simple tree with 5-7 nodes. Manually trace through each traversal type, writing down the order you visit nodes. Create a Mind Map with the three traversals branching from 'Tree Traversal', each branch showing the order and a real-world use case. Practice with the Charting note method: columns for traversal type, order, and applications.",
      },
    ],
  },
];

export default function ExamHistory() {
  const [selectedExam, setSelectedExam] = useState<DetailedExam | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "detail" | "analysis">("list");

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
        <div className="container py-4 md:py-6 max-w-5xl mx-auto space-y-6 animate-fade-in px-4">
          <Card className="border shadow-sm">
            <CardHeader className="px-4 md:px-6">
              <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                <ClockCounterClockwise className="w-5 h-5 text-primary" />
                Past Assessments
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">Click on any exam to view deep AI analysis and weak areas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 md:px-6">
              {detailedExamHistory.map((exam) => (
                <div
                  key={exam.id}
                  className="p-4 md:p-5 rounded-2xl border bg-card hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group relative"
                  onClick={() => handleViewAnalysis(exam)}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div
                        className={cn(
                          "w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-base md:text-xl shrink-0 shadow-sm",
                          exam.score >= 80
                            ? "bg-green-500/10 text-green-600 border border-green-500/20"
                            : exam.score >= 60
                              ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
                              : "bg-red-500/10 text-red-600 border border-red-500/20"
                        )}
                      >
                        {exam.score}%
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm md:text-lg truncate">{exam.courseName}</h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] md:text-xs text-muted-foreground mt-1 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(exam.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {exam.timeTaken}m
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            {exam.totalQuestions} Qs
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-2 md:gap-3 border-t md:border-none pt-3 md:pt-0">
                      <div className="flex items-center gap-2">
                        {exam.improvement > 0 ? (
                          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20 text-[10px] md:text-xs">
                            <TrendUp className="w-3 h-3 mr-1" />
                            +{exam.improvement}%
                          </Badge>
                        ) : exam.improvement < 0 ? (
                          <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20 text-[10px] md:text-xs">
                            <TrendDown className="w-3 h-3 mr-1" />
                            {exam.improvement}%
                          </Badge>
                        ) : null}
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] md:text-xs font-bold uppercase tracking-wider px-2 py-0.5",
                            exam.difficulty === "hard"
                              ? "border-red-500/50 text-red-500"
                              : exam.difficulty === "medium"
                                ? "border-yellow-500/50 text-yellow-500"
                                : "border-green-500/50 text-green-500"
                          )}
                        >
                          {exam.difficulty}
                        </Badge>
                      </div>
                      <CaretRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors hidden md:block" />
                    </div>
                  </div>

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4">
                    <div className="p-2 md:p-3 rounded-xl bg-muted/30 border border-transparent hover:border-muted-foreground/10 text-center">
                      <p className="text-[9px] md:text-xs text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Correct</p>
                      <p className="text-sm md:text-lg font-black text-green-600">{exam.correctAnswers}</p>
                    </div>
                    <div className="p-2 md:p-3 rounded-xl bg-muted/30 border border-transparent hover:border-muted-foreground/10 text-center">
                      <p className="text-[9px] md:text-xs text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Wrong</p>
                      <p className="text-sm md:text-lg font-black text-red-600">{exam.totalQuestions - exam.correctAnswers}</p>
                    </div>
                    <div className="p-2 md:p-3 rounded-xl bg-muted/30 border border-transparent hover:border-muted-foreground/10 text-center">
                      <p className="text-[9px] md:text-xs text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Gaps</p>
                      <p className="text-sm md:text-lg font-black text-primary">{exam.weakTopics.length}</p>
                    </div>
                  </div>

                  {/* Weak Topics Chips */}
                  {exam.weakTopics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {exam.weakTopics.map((topic) => (
                        <Badge key={topic} variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/10 text-[9px] md:text-xs px-2 py-0.5">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {viewMode === "analysis" && selectedExam && (
        <div className="container py-4 md:py-6 max-w-4xl mx-auto space-y-6 animate-fade-in px-4">
          <Button
            variant="ghost"
            onClick={() => setViewMode("list")}
            className="mb-2 h-9 text-xs md:text-sm font-bold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to History
          </Button>

          <Card className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-5 md:p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-left">
                <div className="min-w-0 w-full md:w-auto">
                  <Badge className="mb-3 font-black tracking-widest">{selectedExam.difficulty.toUpperCase()}</Badge>
                  <h1 className="text-xl md:text-3xl font-black tracking-tight mb-2 truncate">{selectedExam.courseName}</h1>
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-[11px] md:text-sm font-medium text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedExam.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {selectedExam.timeTaken} minutes
                    </span>
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-center md:items-end">
                  <div
                    className={cn(
                      "text-4xl md:text-6xl font-black tracking-tighter mb-1",
                      selectedExam.score >= 80 ? "text-green-600" : selectedExam.score >= 60 ? "text-yellow-600" : "text-red-600"
                    )}
                  >
                    {selectedExam.score}%
                  </div>
                  <p className="text-[11px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {selectedExam.correctAnswers}/{selectedExam.totalQuestions} Questions Correct
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => handleReExam(selectedExam.id)} className="gradient-primary h-12 rounded-xl font-bold flex-1 shadow-lg shadow-primary/20">
              <ArrowCounterClockwise className="w-4 h-4 mr-2" />
              Retake Assessment
            </Button>
            <Button variant="outline" className="h-12 rounded-xl font-bold flex-1" asChild>
              <Link to="/notes">
                <BookOpen className="w-4 h-4 mr-2" />
                Open Study Studio
              </Link>
            </Button>
          </div>

          <Card className="border shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="p-5 md:p-6 pb-2">
              <CardTitle className="text-base md:text-xl flex items-center gap-2">
                <Warning className="w-5 h-5 text-red-500" weight="fill" />
                AI Deep Diagnostics
              </CardTitle>
              <CardDescription className="text-xs">Precise breakdown of conceptual gaps identified during the exam</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-5 md:p-6">
              {selectedExam.questions
                .filter((q) => !q.isCorrect)
                .map((question) => (
                  <div
                    key={question.id}
                    className="p-5 md:p-8 rounded-2xl border bg-gradient-to-br from-red-500/[0.02] to-transparent space-y-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                        <XCircle className="w-6 h-6 text-red-600" weight="fill" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest">{question.type}</Badge>
                          <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-widest">{question.topic}</Badge>
                        </div>
                        <p className="font-bold text-base md:text-lg leading-tight">{question.question}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-red-600/70 mb-1">Your Response</p>
                        <p className="font-bold text-red-600 text-sm">{question.userAnswer}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-green-600/70 mb-1">AI Solution</p>
                        <p className="font-bold text-green-600 text-sm">{question.correctAnswer}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {question.whyWrong && (
                        <div className="flex gap-3">
                          <Warning className="w-4 h-4 text-red-500 shrink-0 mt-1" weight="bold" />
                          <div className="space-y-1">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-red-600/70">The Logic Gap</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">{question.whyWrong}</p>
                          </div>
                        </div>
                      )}
                      {question.howToFix && (
                        <div className="flex gap-3">
                          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-1" weight="bold" />
                          <div className="space-y-1">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600/70">Mastery Path</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">{question.howToFix}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
