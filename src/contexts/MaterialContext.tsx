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

interface ExtractedUnit {
  id: string;
  title: string;
  description: string;
  topics: string[];
  confidence: number;
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

  const processFiles = async (newFiles: File[]) => {
    for (const file of newFiles) {
      const tempId = Math.random().toString(36).substr(2, 9);
      const newUploadFile: UploadedFile = {
        id: tempId,
        name: file.name,
        size: file.size,
        type: file.type,
        status: "uploading",
        progress: 0,
      };

      setFiles((prev) => [...prev, newUploadFile]);

      try {
        const response = await materialService.upload(file, (progress) => {
          setFiles((prev) =>
            prev.map((f) => (f.id === tempId ? { ...f, progress } : f))
          );
        });
        const material_id = response.material_id;

        setFiles((prev) =>
          prev.map((f) =>
            f.id === tempId ? { ...f, id: material_id, status: "done", progress: 100 } : f
          )
        );
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Upload failed";
        setFiles((prev) =>
          prev.map((f) =>
            f.id === tempId ? { ...f, status: "error", errorMessage } : f
          )
        );
        toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
      }
    }
  };

  const removeFile = async (id: string) => {
    const fileToRemove = files.find(f => f.id === id);
    if (fileToRemove && fileToRemove.status === "done") {
      try {
        await materialService.delete(id);
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handlePreprocess = async () => {
    const materialIds = files.filter(f => f.status === "done").map(f => f.id);
    if (materialIds.length === 0) return;

    setIsProcessing(true);
    try {
      const response = await materialService.preprocess(materialIds);
      if (response && response.collection_id) {
        setCollectionId(response.collection_id);
        localStorage.setItem("active_collection_id", response.collection_id);
        setWizardStep(3);
        toast.success("Preprocessing complete!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Preprocess failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartAnalysis = async () => {
    if (!collectionId) return;

    setIsProcessing(true);
    try {
      await materialService.analyze(collectionId, confidence[0]);
      setExtractedUnits([
        {
          id: collectionId,
          title: "Synthesized Collection",
          description: "Your materials have been analyzed and mapped.",
          topics: ["Core Concepts", "Key Takeaways"],
          confidence: confidence[0],
        }
      ]);
      setAnalysisReady(true);
      setWizardStep(4);
      toast.success("Neural analysis finished!");
    } catch (error: any) {
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
      }}
    >
      {children}
    </MaterialContext.Provider>
  );
}

export function useMaterialProcessing() {
  const context = useContext(MaterialContext);
  if (!context) {
    throw new Error("useMaterialProcessing must be used within a MaterialProvider");
  }
  return context;
}
