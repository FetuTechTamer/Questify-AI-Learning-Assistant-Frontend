import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { StudyMethodId } from "@/types/study";
import { StudyMethodSelector } from "@/components/study/StudyMethodSelector";
import { BookSelector } from "@/components/study/BookSelector";
import { PomodoroMethod } from "@/components/study/methods/PomodoroMethod";
import { FeynmanMethod } from "@/components/study/methods/FeynmanMethod";
import { SQ3RMethod } from "@/components/study/methods/SQ3RMethod";
import { LeitnerSystem } from "@/components/study/methods/LeitnerSystem";
import { ActiveRecall } from "@/components/study/methods/ActiveRecall";
import { Layout } from "@/components/layout/Layout";
import { Collection } from "@/services/api";
import { studyService } from "@/services/studyService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sparkle, CircleNotch, ArrowLeft, Warning } from "@phosphor-icons/react";

const SUPPORTED_METHODS: StudyMethodId[] = ['pomodoro', 'feynman', 'leitner', 'sq3r', 'active_recall'];

export default function StudyRoom() {
  const location = useLocation();
  const { chapterId, courseId } = location.state || {};

  const [activeCollection, setActiveCollection] = useState<Collection | null>(null);
  const [activeMethod, setActiveMethod] = useState<StudyMethodId | null>(null);
  
  // API Data States
  const [studyData, setStudyData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const fetchStudyData = useCallback(async (method: string, collectionId: string) => {
    if (!SUPPORTED_METHODS.includes(method as StudyMethodId)) return;
    
    setIsLoading(true);
    try {
      const data = await studyService.getSession(method, collectionId);
      setStudyData(data);
    } catch (error: any) {
      console.error(`[StudyRoom] GET failed:`, error);
      if (error.response?.status === 404) {
        toast.info("No study session found for this collection/method.");
        setStudyData(null);
      } else {
        toast.error("Failed to load study data.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInitialize = async () => {
    if (!activeMethod || !activeCollection) return;
    
    setIsInitializing(true);
    try {
      await studyService.generateSession(activeMethod, activeCollection.collection_id);
      toast.success("Study session initialized!");
      await fetchStudyData(activeMethod, activeCollection.collection_id);
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error("Study technique endpoint not ready. Please contact support.");
      } else {
        const msg = error.response?.data?.message || "Failed to initialize technique.";
        toast.error(msg);
      }
    } finally {
      setIsInitializing(false);
    }
  };

  // Auto-fetch when selection changes
  useEffect(() => {
    if (activeCollection && activeMethod) {
      fetchStudyData(activeMethod, activeCollection.collection_id);
    } else {
      setStudyData(null);
    }
  }, [activeCollection, activeMethod, fetchStudyData]);

  // UI Flow logic
  if (!activeCollection) {
    return <BookSelector onSelect={setActiveCollection} />;
  }

  if (!activeMethod) {
    return (
        <div className="relative">
            <Button 
                variant="ghost" 
                onClick={() => setActiveCollection(null)}
                className="absolute top-8 left-8 z-50 gap-2"
            >
                <ArrowLeft /> Change Collection
            </Button>
            <StudyMethodSelector onSelect={setActiveMethod} />
        </div>
    );
  }

  // Active Session Layout
  const renderMethodContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <CircleNotch className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Retrieving cognitive assets...</p>
        </div>
      );
    }

    if (!studyData) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] max-w-xl mx-auto text-center gap-6 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center text-primary/40">
            <Sparkle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Technique Not Initialized</h2>
            <p className="text-muted-foreground">
              You haven't generated study assets for <strong>{activeMethod.replace('_', ' ')}</strong> using this collection yet.
            </p>
          </div>
          <Button 
            size="lg" 
            onClick={handleInitialize} 
            disabled={isInitializing}
            className="rounded-xl px-8 h-12 gap-2 font-bold shadow-lg"
          >
            {isInitializing ? <CircleNotch className="w-4 h-4 animate-spin" /> : <Sparkle className="w-4 h-4" />}
            Initialize {activeMethod.replace('_', ' ')}
          </Button>
          <Button variant="ghost" onClick={() => setActiveMethod(null)} className="text-muted-foreground">
            Choose different method
          </Button>
        </div>
      );
    }

    const commonProps = {
      chapterId: chapterId || "demo-chapter",
      courseId: courseId || "demo-course",
      bookFilename: activeCollection.title,
      collectionId: activeCollection.collection_id,
      studyData: studyData, // Real data from GET
      onBack: () => setActiveMethod(null)
    };

    switch (activeMethod) {
      case 'pomodoro':
        return <PomodoroMethod {...commonProps} />;
      case 'feynman':
        return <FeynmanMethod {...commonProps} />;
      case 'sq3r':
        return <SQ3RMethod {...commonProps} />;
      case 'leitner':
        return <LeitnerSystem {...commonProps} />;
      case 'active_recall':
        return <ActiveRecall {...commonProps} />;
      default:
        return (
            <div className="p-20 text-center space-y-4">
                <Warning className="w-12 h-12 mx-auto text-amber-500" />
                <h3 className="text-xl font-bold">Technique Integration Pending</h3>
                <p className="text-muted-foreground">The <strong>{activeMethod}</strong> method is not yet fully integrated with the production API.</p>
                <Button onClick={() => setActiveMethod(null)}>Back to Selection</Button>
            </div>
        );
    }
  };

  return (
    <Layout showSidebar={false} title="Study Immersion Room">
      {renderMethodContent()}
    </Layout>
  );
}
