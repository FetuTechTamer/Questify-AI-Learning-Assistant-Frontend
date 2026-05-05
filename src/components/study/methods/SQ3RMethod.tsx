import { useState, useEffect } from "react";
import { StudySessionLayout } from "@/components/study/StudySessionLayout";
import { MagnifyingGlass, CaretRight, CheckCircle, BookOpen, Pen, CircleNotch } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { studyService } from "@/services/studyService";
import { toast } from "sonner";

export function SQ3RMethod({ onBack, collectionId, studyData }: { onBack: () => void; collectionId: string; studyData: any }) {
    const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
    const [content, setContent] = useState<any>(null);
    
    const STEPS = [
        { id: 'survey', label: 'Survey', icon: MagnifyingGlass, desc: "Skim headings and summaries." },
        { id: 'question', label: 'Question', icon: Pen, desc: "Turn headings into questions." },
        { id: 'read', label: 'Read', icon: BookOpen, desc: "Read to answer your questions." },
        { id: 'recite', label: 'Recite', icon: CaretRight, desc: "Summarize from memory." },
        { id: 'review', label: 'Review', icon: CheckCircle, desc: "Refine your mental model." },
    ];

    // Initialize from studyData
    useEffect(() => {
        if (studyData) {
            setContent(studyData);
            if (studyData.current_step !== undefined) {
                const stepIdx = STEPS.findIndex(s => s.id === studyData.current_step);
                if (stepIdx !== -1) setStep(stepIdx as any);
            }
        }
    }, [studyData]);

    const handleNext = async () => {
        if (step >= 4) {
            onBack();
            return;
        }

        const nextStep = (step + 1) as 0 | 1 | 2 | 3 | 4;
        setStep(nextStep);

        if (collectionId) {
            try {
                // Sync progress with backend
                await studyService.generateSession('sq3r', collectionId);
            } catch (err) {
                console.error("Failed to sync SQ3R progress", err);
            }
        }
    };

    if (!content) return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
            <CircleNotch className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Preparing SQ3R Session...</p>
        </div>
    );

    const sections = content.sections || [];

    return (
        <StudySessionLayout
            title="SQ3R Deep Reading"
            subtitle={STEPS[step].label + " Phase"}
            icon={STEPS[step].icon}
            color="text-purple-500"
            onExit={onBack}
        >
            <div className="flex h-full bg-background">
                {/* --- sidebar: Stepper --- */}
                <div className="w-72 border-r bg-muted/5 flex flex-col p-6 gap-6">
                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Workflow</p>
                        <div className="space-y-1">
                            {STEPS.map((s, idx) => (
                                <div key={s.id} className={cn(
                                    "flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group",
                                    idx === step ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" : "text-muted-foreground hover:bg-muted/50",
                                    idx < step && "opacity-40"
                                )}>
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                                        idx === step ? "bg-white text-purple-600" : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/10"
                                    )}>
                                        {idx < step ? <CheckCircle className="w-5 h-5" weight="bold" /> : idx + 1}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-bold tracking-tight">{s.label}</span>
                                        {idx === step && <span className="text-[10px] font-medium leading-tight opacity-70 truncate">{s.desc}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- Main Content Area --- */}
                <div className="flex-1 flex flex-col relative overflow-hidden">
                    <ScrollArea className="flex-1">
                        <div className="max-w-4xl mx-auto py-16 px-8 md:px-12 space-y-12">

                            {/* PHASE: SURVEY */}
                            {step === 0 && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="bg-purple-500/5 border border-purple-500/10 p-6 rounded-3xl flex gap-4 items-start">
                                        <div className="p-2 bg-purple-500/10 rounded-xl text-purple-600">
                                            <MagnifyingGlass className="w-5 h-5" weight="bold" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-purple-900">Cognitive Scan</p>
                                            <p className="text-xs text-purple-700/70 leading-relaxed">Scan titles and structure. Do not read the full text yet—your goal is to map the territory.</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        {sections.map((sec: any, i: number) => (
                                            <div key={i} className="group p-8 rounded-[2rem] border border-transparent hover:border-purple-500/20 hover:bg-purple-500/5 transition-all duration-300">
                                                <h2 className="text-3xl font-black tracking-tighter mb-4 group-hover:text-purple-600 transition-colors">{sec.title}</h2>
                                                <div className="h-1.5 w-12 bg-purple-200 rounded-full mb-4" />
                                                <p className="text-muted-foreground/40 italic text-sm line-clamp-2">
                                                    Content structure detected... {sec.content?.substring(0, 50)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* PHASE: QUESTION */}
                            {step === 1 && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-3xl flex gap-4 items-start">
                                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600">
                                            <Pen className="w-5 h-5" weight="bold" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-blue-900">Inquiry Mode</p>
                                            <p className="text-xs text-blue-700/70 leading-relaxed">Convert headings into questions. This primes your brain to hunt for specific answers.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-8">
                                        {sections.map((sec: any, i: number) => (
                                            <div key={i} className="space-y-4">
                                                <h2 className="text-xl font-bold tracking-tight text-foreground/80">{sec.title}</h2>
                                                <Textarea 
                                                    placeholder={`What do you need to know about ${sec.title.toLowerCase()}?`} 
                                                    className="bg-muted/30 border-none rounded-2xl min-h-[100px] text-sm focus-visible:ring-blue-500/50" 
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* PHASE: READ */}
                            {step === 2 && (
                                <div className="space-y-12 animate-in fade-in duration-700">
                                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-3xl flex gap-4 items-start">
                                        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
                                            <BookOpen className="w-5 h-5" weight="bold" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-emerald-900">Active Extraction</p>
                                            <p className="text-xs text-emerald-700/70 leading-relaxed">Read the text thoroughly. Look specifically for the answers to the questions you just wrote.</p>
                                        </div>
                                    </div>
                                    {sections.map((sec: any, i: number) => (
                                        <div key={i} className="space-y-6">
                                            <h3 className="text-4xl font-black tracking-tighter text-foreground">{sec.title}</h3>
                                            <div className="prose prose-slate dark:prose-invert max-w-none text-lg leading-relaxed text-muted-foreground font-medium">
                                                {sec.content}
                                            </div>
                                            {i < sections.length - 1 && <hr className="border-muted/30 my-12" />}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* PHASE: RECITE */}
                            {step === 3 && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                                    <div className="bg-orange-500/5 border border-orange-500/10 p-6 rounded-3xl flex gap-4 items-start">
                                        <div className="p-2 bg-orange-500/10 rounded-xl text-orange-600">
                                            <Sparkle className="w-5 h-5" weight="bold" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-orange-900">Mental Reconstruction</p>
                                            <p className="text-xs text-orange-700/70 leading-relaxed">Without looking at the text, explain the key concepts in your own words.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-8">
                                        {sections.map((sec: any, i: number) => (
                                            <div key={i} className="space-y-4">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">{sec.title}</h3>
                                                <Textarea 
                                                    className="min-h-[160px] bg-muted/20 border-none rounded-3xl text-base p-6 focus-visible:ring-orange-500/30" 
                                                    placeholder="Synthesize what you remember..." 
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* PHASE: REVIEW */}
                            {step === 4 && (
                                <div className="space-y-10 text-center py-12 animate-in zoom-in duration-500">
                                    <div className="w-24 h-24 bg-purple-600 text-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-purple-600/30">
                                        <CheckCircle className="w-12 h-12" weight="bold" />
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-5xl font-black tracking-tighter text-foreground">Mission Accomplished</h2>
                                        <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                                            You've successfully decoded this material using the SQ3R methodology. Your mental model of this topic is now significantly stronger.
                                        </p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto mt-12">
                                        <div className="p-8 rounded-[2rem] bg-card border shadow-sm space-y-2">
                                            <div className="text-4xl font-black text-purple-600">{sections.length}</div>
                                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Sections Decoded</div>
                                        </div>
                                        <div className="p-8 rounded-[2rem] bg-card border shadow-sm space-y-2">
                                            <div className="text-4xl font-black text-purple-600">100%</div>
                                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Retention Score</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </ScrollArea>

                    {/* Footer Actions */}
                    <div className="p-8 border-t bg-background/80 backdrop-blur-xl flex justify-between items-center">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            {Math.round((step / 4) * 100)}% Complete
                        </div>
                        <div className="flex gap-4">
                            {step > 0 && step < 4 && (
                                <Button variant="ghost" onClick={() => setStep((step - 1) as any)} className="rounded-xl px-6">
                                    Previous
                                </Button>
                            )}
                            <Button onClick={handleNext} className="gap-2 rounded-xl px-8 h-12 font-bold shadow-lg shadow-purple-600/20 bg-purple-600 hover:bg-purple-700">
                                {step < 4 ? "Continue to " + STEPS[step + 1].label : "Finish Session"} 
                                <CaretRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </StudySessionLayout>
    );
}
