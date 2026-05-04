import { useCallback } from "react";
import { Upload as UploadIcon, FileText, X, Check, CircleNotch, CaretRight, Sparkle, Brain, WarningCircle } from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Layout } from "@/components/layout/Layout";
import { cn } from "@/lib/utils";
import { useMaterial } from "@/contexts/MaterialContext";
import { useNavigate } from "react-router-dom";

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
};

const getConfidenceColor = (confidence: number): string => {
  if (confidence < 40) return "text-destructive";
  if (confidence < 70) return "text-warning";
  return "text-success";
};

const getConfidenceMessage = (confidence: number): string => {
  if (confidence < 30) return "It's okay to start from the basics. We'll guide you step by step.";
  if (confidence < 50) return "You have some foundation. Let's build on it together.";
  if (confidence < 70) return "Good understanding! We'll help you master the details.";
  if (confidence < 90) return "You seem comfortable — we will challenge you appropriately.";
  return "Excellent confidence! Let's verify and push your limits.";
};

export default function Upload() {
  const {
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
  } = useMaterial();

  const navigate = useNavigate();

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, [processFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
      e.target.value = ""; // reset so user can select more files
    }
  };

  const handleFinish = () => {
    // Reset the context state so the next visit starts at Step 1
    resetProcess();
    // Navigate to the exam room
    navigate("/exam");
  };

  return (
    <Layout>
      <div className="container py-6 max-w-5xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {["Upload", "Analyze", "Review"].map((label, index) => (
            <div key={label} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    wizardStep > index + 1
                      ? "bg-primary text-primary-foreground"
                      : wizardStep === index + 1
                        ? "bg-primary/20 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {wizardStep > index + 1 ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span className={cn("text-sm font-medium hidden sm:block", wizardStep === index + 1 ? "text-foreground" : "text-muted-foreground")}>
                  {label}
                </span>
              </div>
              {index < 2 && (
                <div className="h-[2px] w-8 bg-muted mx-4" />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {wizardStep === 1 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight">Upload Materials</h1>
              <p className="text-muted-foreground mt-2">Questy will analyze your documents to build a personalized study plan</p>
            </div>

            <Card
              className={cn(
                "border-2 border-dashed transition-all duration-300 rounded-xl border-muted hover:border-primary/50"
              )}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
            >
              <CardContent className="p-8 md:p-12">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-3xl bg-muted text-muted-foreground flex items-center justify-center mb-6 transition-colors">
                    <UploadIcon className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Drag & drop files to upload</h3>
                  <p className="text-sm text-muted-foreground mb-8">
                    Support for PDF, DOCX, PPTX, and TXT files
                  </p>
                  <label>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain"
                    />
                    <Button variant="outline" className="cursor-pointer rounded-full px-8 h-12" asChild>
                      <span>Choose Files</span>
                    </Button>
                  </label>
                </div>
              </CardContent>
            </Card>

            {files.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold flex items-center gap-2 px-2">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  Uploaded Documents
                </h4>
                {files.map((file) => (
                  <Card key={file.id} className={cn(
                    "rounded-lg border shadow-sm overflow-hidden group transition-all",
                    file.status === "error" ? "border-destructive/50 bg-destructive/5" : "border-none"
                  )}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        file.status === "error" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                      )}>
                        {file.status === "error" ? <WarningCircle size={24} /> : <FileText size={24} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-sm truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground shrink-0">{formatFileSize(file.size)}</p>
                        </div>
                        {file.status === "uploading" && (
                          <Progress value={file.progress} className="h-1.5 mt-2" />
                        )}
                        {file.status === "error" && (
                          <p className="text-[10px] text-destructive font-medium mt-1">
                            {file.errorMessage}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {file.status === "done" && (
                          <Badge className="bg-green-500/10 text-green-500 border-none rounded-full py-1">
                            <Check className="w-3 h-3 mr-1" />
                            Ready
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex justify-end items-center bg-card p-4 rounded-xl border mt-8">
              <Button
                size="lg"
                className="rounded-full px-12 h-14 font-bold shadow-xl shadow-primary/20"
                disabled={files.length === 0 || files.some(f => f.status === "uploading") || !files.some(f => f.status === "done") || isProcessing}
                onClick={handlePreprocess}
              >
                {isProcessing ? (
                  <>
                    <CircleNotch className="mr-2 w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Preprocess
                    <CaretRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Preprocess */}
        {wizardStep === 2 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight">Confidence Baseline</h1>
              <p className="text-muted-foreground mt-2">How familiar are you with these materials?</p>
            </div>

            <Card className="rounded-xl p-8 md:p-12 border-none shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="space-y-12">
                <div className="max-w-md mx-auto space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      <span>Beginner</span>
                      <span>Expert</span>
                    </div>
                    <Slider
                      value={confidence}
                      onValueChange={setConfidence}
                      max={100}
                      step={1}
                      className="[&_[role=slider]]:w-8 [&_[role=slider]]:h-8"
                    />
                  </div>

                  <div className="relative inline-block w-full text-center">
                    <div className={cn(
                      "text-8xl font-black mb-4 transition-colors",
                      getConfidenceColor(confidence[0])
                    )}>
                      {confidence[0]}%
                    </div>
                    <p className="text-lg font-bold text-muted-foreground min-h-[3rem] max-w-sm mx-auto">
                      {getConfidenceMessage(confidence[0])}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center bg-card p-4 rounded-xl border mt-8">
              <Button
                variant="ghost"
                className="rounded-full px-8 h-12 font-bold"
                onClick={() => setWizardStep(1)}
                disabled={isProcessing}
              >
                Back to Upload
              </Button>
              <Button
                size="lg"
                className="rounded-full px-12 h-14 font-bold shadow-xl shadow-primary/20"
                onClick={handleStartAnalysis}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <CircleNotch className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  <>
                    Start Neural Analysis
                    <Sparkle className="ml-2 w-5 h-5" weight="fill" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}



        {/* Step 3: Study */}
        {wizardStep === 3 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight">Analysis Results</h1>
              <p className="text-muted-foreground mt-2">We've identified the following study units from your documents</p>
            </div>

            <Card className="rounded-xl p-8 md:p-12 border-none shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="space-y-4">
                {extractedUnits.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No chapters were extracted. Please try again.</p>
                ) : (
                  <ol className="space-y-4">
                    {extractedUnits.map((unit) => (
                      <li key={unit.id} className="flex gap-4 p-4 rounded-xl bg-muted/50 text-left">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/15 text-primary text-sm font-black flex items-center justify-center">
                          {unit.id}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm leading-snug">{unit.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{unit.description}</p>
                          {unit.topics && unit.topics.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {unit.topics.map((topic) => (
                                <span
                                  key={topic}
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between items-center bg-card p-4 rounded-xl border mt-8">
              <Button
                variant="ghost"
                className="rounded-full px-8 h-12 font-bold"
                onClick={() => setWizardStep(2)}
              >
                Back to Analysis
              </Button>
              <Button
                size="lg"
                className="rounded-full px-12 h-14 font-bold shadow-xl shadow-primary/20"
                onClick={handleFinish}
                disabled={!analysisReady}
              >
                Begin Study Protocol
                <Sparkle className="ml-2 w-5 h-5" weight="fill" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
