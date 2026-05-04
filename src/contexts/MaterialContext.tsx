import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { materialService } from "../services/materialService";
import { toast } from "sonner";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "uploading" | "done" | "error";
  progress: number;
  errorMessage?: string;
}

export interface ExtractedUnit {
  id: number;
  title: string;
  description: string;
  topics: string[];
}

interface MaterialContextType {
  files: UploadedFile[];
  wizardStep: number;
  confidence: number[];
  collectionId: string | null;
  isProcessing: boolean;
  analysisReady: boolean;
  extractedUnits: ExtractedUnit[];
  setWizardStep: (step: number) => void;
  setConfidence: (val: number[]) => void;
  processFiles: (newFiles: File[]) => Promise<void>;
  removeFile: (id: string) => Promise<void>;
  handlePreprocess: () => Promise<void>;
  handleStartAnalysis: () => Promise<void>;
  resetProcess: () => void;
}

const MaterialContext = createContext<MaterialContextType | undefined>(undefined);

export function MaterialProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [wizardStep, setWizardStep] = useState(1);
  const [confidence, setConfidence] = useState([50]);
  const [collectionId, setCollectionId] = useState<string | null>(localStorage.getItem("active_collection_id"));
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisReady, setAnalysisReady] = useState(false);
  const [extractedUnits, setExtractedUnits] = useState<ExtractedUnit[]>([]);

  const resetProcess = useCallback(() => {
    setFiles([]);
    setWizardStep(1);
    setConfidence([50]);
    setCollectionId(null);
    localStorage.removeItem("active_collection_id"); // always clear stale collection
    setIsProcessing(false);
    setAnalysisReady(false);
    setExtractedUnits([]);
    console.log('[resetProcess] Wizard reset. active_collection_id cleared from localStorage.');
  }, []);

  const processFiles = useCallback(async (newFiles: File[]) => {
    console.log(`[processFiles] Uploading ${newFiles.length} file(s)...`);

    // Create placeholder entries for all files at once
    const tempEntries = newFiles.map((file) => ({
      tempId: Math.random().toString(36).substr(2, 9),
      file,
    }));

    setFiles((prev) => [
      ...prev,
      ...tempEntries.map(({ tempId, file }) => ({
        id: tempId,
        name: file.name,
        size: file.size,
        type: file.type,
        status: "uploading" as const,
        progress: 0,
      })),
    ]);

    // Upload all files in parallel
    await Promise.allSettled(
      tempEntries.map(async ({ tempId, file }) => {
        try {
          const response = await materialService.upload(file, (progress) => {
            setFiles((prev) =>
              prev.map((f) => (f.id === tempId ? { ...f, progress } : f))
            );
          });
          const material_id = response.material_id;
          console.log(`[processFiles] "${file.name}" uploaded → material_id: ${material_id}`);

          setFiles((prev) =>
            prev.map((f) =>
              f.id === tempId ? { ...f, id: material_id, status: "done", progress: 100 } : f
            )
          );
        } catch (error: any) {
          console.error(`[processFiles] "${file.name}" upload failed:`, error);
          const errorMessage = error.response?.data?.message || "Upload failed";
          setFiles((prev) =>
            prev.map((f) =>
              f.id === tempId ? { ...f, status: "error", errorMessage } : f
            )
          );
          toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
        }
      })
    );

    console.log('[processFiles] All uploads settled.');
  }, []);

  const removeFile = useCallback(async (id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove && fileToRemove.status === "done") {
        materialService.delete(id).catch(console.error);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const handlePreprocess = async () => {
    const materialIds = files.filter(f => f.status === "done").map(f => f.id);
    if (materialIds.length === 0) {
      toast.error("No valid materials to process.");
      return;
    }

    console.log('[handlePreprocess] Starting preprocess with IDs:', materialIds);
    setIsProcessing(true);
    try {
      const response = await materialService.preprocess(materialIds);
      if (response && response.collection_id) {
        setCollectionId(response.collection_id);
        localStorage.setItem("active_collection_id", response.collection_id);
        setWizardStep(2); // Move to Step 2 after successful preprocess
        toast.success("Preprocessing complete!");
      } else {
        throw new Error("No collection ID returned from server.");
      }
    } catch (error: any) {
      console.error("[handlePreprocess] Error:", error);
      toast.error(error.response?.data?.message || "Preprocess failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartAnalysis = async () => {
    if (!collectionId) {
      toast.error("No active collection found. Please re-upload your files.");
      setWizardStep(1);
      return;
    }

    setIsProcessing(true);
    try {
      const userConfidence = confidence[0];
      console.log('[handleStartAnalysis] Starting analysis for collection:', collectionId, 'with confidence:', userConfidence);

      const analyzeResponse = await materialService.analyze(collectionId, userConfidence);
      const chapters = analyzeResponse?.chapters ?? [];
      
      console.log('[handleStartAnalysis] Analysis complete. Chapters:', chapters.length);

      const units = chapters.map((ch) => ({
        id: ch.chapter_number,
        title: ch.chapter_title,
        description: ch.chapter_description,
        topics: ch.keywords,
      }));

      setExtractedUnits(units);
      setAnalysisReady(true);
      setWizardStep(3); // Move to Step 3 after analysis
      toast.success("Neural analysis finished!");
    } catch (error: any) {
      console.error('[handleStartAnalysis] Error:', error);
      toast.error(error.response?.data?.message || "Analysis failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <MaterialContext.Provider
      value={{
        files,
        wizardStep,
        confidence,
        collectionId,
        isProcessing,
        analysisReady,
        extractedUnits,
        setWizardStep,
        setConfidence,
        processFiles,
        removeFile,
        handlePreprocess,
        handleStartAnalysis,
        resetProcess,
      }}
    >
      {children}
    </MaterialContext.Provider>
  );
}

export function useMaterial() {
  const context = useContext(MaterialContext);
  if (!context) {
    throw new Error("useMaterial must be used within a MaterialProvider");
  }
  return context;
}
