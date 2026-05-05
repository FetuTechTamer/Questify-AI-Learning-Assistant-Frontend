import {
    Timer,
    ChatCircle,
    MagnifyingGlass,
    Brain,
    Stack,
    ArrowRight,
    Sparkle
} from "@phosphor-icons/react";
import { StudyMethodConfig, StudyMethodId } from "@/types/study";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const METHODS: StudyMethodConfig[] = [
    {
        id: 'pomodoro',
        label: "Pomodoro Focus",
        description: "25-minute sprints of focused study followed by 5-minute breaks.",
        icon: Timer,
        color: "text-blue-500",
        gradient: "from-blue-500/20 to-indigo-500/20",
        recommendedFor: ["Procrastination", "Burnout prevention"],
        badge: "Productivity"
    },
    {
        id: 'feynman',
        label: "Feynman Method",
        description: "Learn by teaching. Simplify concepts to test your understanding.",
        icon: ChatCircle,
        color: "text-green-500",
        gradient: "from-green-500/20 to-emerald-500/20",
        badge: "Deep Learning",
        recommendedFor: ["Complex topics", "Concept Mastery"]
    },
    {
        id: 'leitner',
        label: "Leitner System",
        description: "Spaced repetition using flashcards sorted into proficiency boxes.",
        icon: Stack,
        color: "text-amber-500",
        gradient: "from-amber-500/20 to-yellow-500/20",
        recommendedFor: ["Memorization", "Definitions"],
        badge: "Memory"
    },
    {
        id: 'sq3r',
        label: "SQ3R Method",
        description: "Survey, Question, Read, Recite, Review. A systematic reading approach.",
        icon: MagnifyingGlass,
        color: "text-purple-500",
        gradient: "from-purple-500/20 to-violet-500/20",
        recommendedFor: ["Textbooks", "Research papers"],
        badge: "Reading"
    },
    {
        id: 'active_recall',
        label: "Active Recall",
        description: "Test yourself constantly before re-reading the material.",
        icon: Brain,
        color: "text-rose-500",
        gradient: "from-rose-500/20 to-pink-500/20",
        badge: "High Efficiency",
        recommendedFor: ["Exam prep", "Quick checks"]
    }
];

interface StudyMethodSelectorProps {
    onSelect: (method: StudyMethodId) => void;
}

export function StudyMethodSelector({ onSelect }: StudyMethodSelectorProps) {
    return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center p-6 md:p-12 min-h-[85vh]">
                <div className="max-w-6xl w-full space-y-16">
                    <div className="text-center space-y-6 animate-in fade-in slide-in-from-top-6 duration-700">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 shadow-sm">
                            <Sparkle className="w-4 h-4 animate-pulse" />
                            Production Study Suite
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground leading-[1.1]">
                            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-600 to-indigo-600">Methodology</span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
                            Select a scientifically proven study technique integrated with your AI assistant.
                        </p>
                    </div>

                    <div className="flex flex-col gap-8 items-center">
                        {/* First Row: 3 Methods */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                            {METHODS.slice(0, 3).map((method, index) => (
                                <MethodCard
                                    key={method.id}
                                    method={method}
                                    onClick={() => onSelect(method.id)}
                                />
                            ))}
                        </div>

                        {/* Second Row: 2 Methods (Centered) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full lg:max-w-[66%] lg:mx-auto">
                            {METHODS.slice(3, 5).map((method, index) => (
                                <MethodCard
                                    key={method.id}
                                    method={method}
                                    onClick={() => onSelect(method.id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function MethodCard({ method, onClick }: { method: StudyMethodConfig; onClick: () => void }) {
    const Icon = method.icon;

    return (
        <button
            onClick={onClick}
            className={cn(
                "group relative flex flex-col text-left h-full p-8 border bg-card/40 backdrop-blur-md hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 hover:border-primary/40 overflow-hidden rounded-[2.5rem] ring-1 ring-black/5",
            )}
        >
            {/* Hover Background Gradient */}
            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br", method.gradient)} />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-8">
                    <div className={cn("p-4 rounded-2xl bg-background/80 shadow-inner ring-1 ring-inset ring-black/5 transition-transform duration-500 group-hover:scale-110", method.color)}>
                        <Icon className="w-8 h-8" weight="duotone" />
                    </div>
                    {method.badge && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm">
                            {method.badge}
                        </span>
                    )}
                </div>

                <h3 className="text-2xl font-black mb-3 tracking-tight group-hover:text-primary transition-colors">
                    {method.label}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed mb-8 flex-1 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                    {method.description}
                </p>

                <div className="space-y-4 pt-6 border-t border-border/50">
                    <div className="flex flex-wrap gap-2">
                        {method.recommendedFor?.map(tag => (
                            <span key={tag} className="text-[10px] px-2.5 py-1 rounded-lg bg-muted/50 text-muted-foreground font-bold uppercase tracking-tighter">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center text-xs font-black uppercase tracking-widest text-primary opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                        Initialize Session <ArrowRight className="w-4 h-4 ml-2" weight="bold" />
                    </div>
                </div>
            </div>
        </button>
    );
}
