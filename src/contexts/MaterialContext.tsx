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

    // Upload files sequentially to avoid overwhelming the backend or causing DB locks
    for (const { tempId, file } of tempEntries) {
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
    }

    console.log('[processFiles] All uploads finished.');
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

  const preprocessAction = async () => {
    const materialIds = files.filter(f => f.status === "done").map(f => f.id);
    if (materialIds.length === 0) {
      toast.error("No valid materials to process.");
      return;
    }

    setIsProcessing(true);
    try {
      console.log('[preprocessAction] Sending material_ids to preprocess:', materialIds);
      const preprocessResponse = await materialService.preprocess(materialIds);
      
      const freshCollectionId = preprocessResponse?.collection_id;
      if (freshCollectionId) {
        setCollectionId(freshCollectionId);
        localStorage.setItem("active_collection_id", freshCollectionId);
        console.log('[preprocessAction] collection_id saved:', freshCollectionId);
        toast.success("Preprocessing complete!");
        setWizardStep(2); // Move to Step 2 only after success
      } else {
        toast.error("Preprocessing failed – no collection ID returned.");
      }
    } catch (error: any) {
      console.error('[preprocessAction] Preprocess error:', error);
      toast.error(error.response?.data?.message || "Preprocess failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeAction = async () => {
    if (!collectionId) {
      toast.error("No collection found. Please preprocess files first.");
      return;
    }

    setIsProcessing(true);
    try {
      const userConfidence = confidence[0];
      const analyzeBody = { collection_id: collectionId, confidence: userConfidence };

      console.log('[analyzeAction] Request body:', JSON.stringify(analyzeBody));

      const analyzeResponse = await materialService.analyze(collectionId, userConfidence);

      console.log('[analyzeAction] Analyze raw response:', analyzeResponse);

      const chapters = analyzeResponse?.chapters ?? [];
      console.log('[analyzeAction] Chapters count:', chapters.length);

      if (chapters.length === 0) {
        console.warn('[analyzeAction] No chapters returned by analyze.');
      }

      const units = chapters.map((ch) => ({
        id: ch.chapter_number,
        title: ch.chapter_title,
        description: ch.chapter_description,
        topics: ch.keywords,
      }));

      setExtractedUnits(units);
      setAnalysisReady(true);
      setWizardStep(3);
      toast.success("Neural analysis finished!");
    } catch (error: any) {
      console.error('[analyzeAction] Error:', error);
      if (error.response) {
        console.error('[analyzeAction] Status:', error.response.status);
        console.error('[analyzeAction] Response body:', JSON.stringify(error.response.data));
      }
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
        handlePreprocess: preprocessAction,
        handleStartAnalysis: analyzeAction,
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
