import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Books,
  MagnifyingGlass,
  ArrowRight,
  Brain,
  Sparkle,
  CheckCircle,
  FileText,
  List,
  Graph,
  Table,
  AlignLeft,
  Plus,
  Trash,
  CircleNotch,
  GraduationCap,
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Layout } from "@/components/layout/Layout";
import { cn } from "@/lib/utils";
import { noteMethods } from "@/data/mockData";
import { api, Material } from "@/services/api";
import { toast } from "sonner";
import NoteRoom from "./NoteRoom";
import { mockTopics } from "@/data/mockTopics";

// ─── API-backed note methods ────────────────────────────────────────────────
const API_METHODS = ["cornell", "sentence", "outline", "mind-map", "charting"];

const methodVisuals: Record<string, { gradient: string; icon: any }> = {
  cornell:    { gradient: "bg-gradient-to-br from-emerald-400 to-teal-600",    icon: FileText  },
  outline:    { gradient: "bg-gradient-to-br from-blue-400 to-indigo-600",     icon: List      },
  mindmap:    { gradient: "bg-gradient-to-br from-violet-400 to-purple-600",   icon: Brain     },
  "mind-map": { gradient: "bg-gradient-to-br from-violet-400 to-purple-600",   icon: Brain     },
  charting:   { gradient: "bg-gradient-to-br from-orange-400 to-red-600",      icon: Table     },
  boxing:     { gradient: "bg-gradient-to-br from-pink-400 to-rose-600",       icon: Graph     },
  sentence:   { gradient: "bg-gradient-to-br from-rose-400 to-pink-600",       icon: AlignLeft },
};

// ─── NoteEditor ─────────────────────────────────────────────────────────────
interface NoteEditorProps {
  method: string;
  materialId: string;
  onSaved: () => void;
}

function NoteEditor({ method, materialId, onSaved }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      toast.error("Please add a title or some content.");
      return;
    }
    setIsSaving(true);
    try {
      await api.saveNote(method, { collection_id: materialId, title, content });
      toast.success("Note saved!");
      setTitle("");
      setContent("");
      onSaved();
    } catch {
      toast.error("Failed to save note. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Plus className="w-4 h-4" /> New {method} Note
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="Note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          placeholder="Write your note content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[120px]"
        />
        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? (
            <><CircleNotch className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
          ) : (
            <><Plus className="w-4 h-4 mr-2" /> Save Note</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── NotesList ───────────────────────────────────────────────────────────────
interface NotesListProps {
  method: string;
  materialId: string;
  refreshTrigger: number;
}

function NotesList({ method, materialId, refreshTrigger }: NotesListProps) {
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await api.getNotes(method, materialId);
        setNotes(Array.isArray(data) ? data : []);
      } catch {
        toast.error(`Failed to load ${method} notes.`);
        setNotes([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [method, materialId, refreshTrigger]);

  const handleDelete = async (noteId: string) => {
    setDeletingId(noteId);
    try {
      await api.deleteNote(method, noteId);
      setNotes((prev) => prev.filter((n) => (n.id || n._id) !== noteId));
      toast.success("Note deleted.");
    } catch {
      toast.error("Failed to delete note.");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <CircleNotch className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground text-sm">
        No {method} notes yet. Create one above!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => {
        const id = note.id || note._id || String(Math.random());
        return (
          <Card key={id} className="group relative">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {note.title && (
                    <h4 className="font-bold text-sm mb-1 truncate">{note.title}</h4>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                    {typeof note.content === "string"
                      ? note.content
                      : JSON.stringify(note.content)}
                  </p>
                  {note.created_at && (
                    <p className="text-[10px] text-muted-foreground mt-2 opacity-60">
                      {new Date(note.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(id)}
                  disabled={deletingId === id}
                >
                  {deletingId === id ? (
                    <CircleNotch className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Main Notes Page ─────────────────────────────────────────────────────────
export default function Notes() {
  // Material selection state
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Method selection (for API-backed methods)
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // NoteRoom fallback for non-API methods
  const [isNoteRoomOpen, setIsNoteRoomOpen] = useState(false);
  const [noteRoomMethod, setNoteRoomMethod] = useState<string | null>(null);

  // Fetch materials on mount
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const data = await api.getMaterials();
        setMaterials(data);
      } catch {
        toast.error("Failed to load your materials. Please try again.");
      } finally {
        setIsLoadingMaterials(false);
      }
    };
    fetchMaterials();
  }, []);

  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  const filteredMaterials = materials.filter((m) =>
    (m.title || m.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLaunch = () => {
    if (!selectedMaterialId || !selectedMethodId) {
      toast.error("Please select both a material and a note method.");
      return;
    }

    // API-backed methods → open inline view
    if (API_METHODS.includes(selectedMethodId)) {
      // Stay on this page, render inline
      return;
    }

    // Fallback: NoteRoom with mock topic data for non-API methods
    const fallbackTopic = Object.values(mockTopics)[0];
    if (fallbackTopic) {
      setNoteRoomMethod(selectedMethodId);
      setIsNoteRoomOpen(true);
    }
  };

  // NoteRoom for non-API methods
  if (isNoteRoomOpen && noteRoomMethod) {
    const fallbackTopic = Object.values(mockTopics)[0];
    return (
      <Layout showSidebar={false} title={`Notes`}>
        <NoteRoom
          topic={fallbackTopic}
          initialMethod={noteRoomMethod}
          onClose={() => setIsNoteRoomOpen(false)}
        />
      </Layout>
    );
  }

  // Inline API note-taking view
  const isApiMethod = selectedMethodId && API_METHODS.includes(selectedMethodId);
  if (isApiMethod && selectedMaterialId) {
    const visual = methodVisuals[selectedMethodId] || methodVisuals["outline"];
    const IconComponent = visual.icon;

    return (
      <DashboardLayout title="Notes Hub">
        <div className="container py-6 max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b">
            <Button variant="ghost" size="sm" onClick={() => setSelectedMethodId(null)}>
              ← Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight capitalize">
                {selectedMethodId.replace("-", " ")} Notes
              </h1>
              <p className="text-sm text-muted-foreground">
                {selectedMaterial?.title || selectedMaterial?.name}
              </p>
            </div>
          </div>

          <NoteEditor
            method={selectedMethodId}
            materialId={selectedMaterialId}
            onSaved={() => setRefreshTrigger((t) => t + 1)}
          />

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Saved Notes
            </h2>
            <NotesList
              method={selectedMethodId}
              materialId={selectedMaterialId}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Notes Hub">
      <div className="container py-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cognitive Studio</h1>
            <p className="text-muted-foreground mt-1">
              Select your material and a structured note-taking method
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1 gap-1.5 font-medium rounded-full">
              <Books className="w-3.5 h-3.5" />
              {materials.length} Materials
            </Badge>
            <Badge variant="outline" className="px-3 py-1 gap-1.5 font-medium rounded-full">
              <Brain className="w-3.5 h-3.5" />
              10 Methods
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* ── Left: Material Selection ─────────────────────────── */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 px-2">
              <AlignLeft className="w-4 h-4" /> Select Material
            </h2>

            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search materials..."
                className="pl-10 h-9 rounded-lg border-none bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Loading skeletons */}
            {isLoadingMaterials ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : materials.length === 0 ? (
              /* Empty state — consistent with Exam page */
              <Card className="p-8 text-center border-dashed">
                <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <GraduationCap className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="text-base font-bold mb-1">No materials found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload some study materials first to generate note.
                </p>
                <Button asChild size="sm">
                  <Link to="/upload">Upload Material</Link>
                </Button>
              </Card>
            ) : filteredMaterials.length === 0 ? (
              <p className="text-sm text-muted-foreground px-2">No materials match your search.</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {filteredMaterials.map((material) => (
                  <button
                    key={material.id}
                    onClick={() => setSelectedMaterialId(material.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-all duration-200 border relative group",
                      selectedMaterialId === material.id
                        ? "bg-primary/10 border-primary text-primary shadow-sm"
                        : "bg-card border-transparent hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          selectedMaterialId === material.id
                            ? "bg-primary"
                            : "bg-muted-foreground/30"
                        )}
                      />
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm leading-tight truncate">
                          {material.title || material.name}
                        </h3>
                        {material.description && (
                          <p className="text-[10px] opacity-60 truncate mt-0.5">
                            {material.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Method Selection ───────────────────────────── */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-2">
                Choose Structure
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {noteMethods.map((method) => {
                  const visual = methodVisuals[method.id] || methodVisuals["outline"];
                  const IconComponent = visual.icon;
                  const isApiSupported = API_METHODS.includes(method.id);

                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethodId(method.id)}
                      className={cn(
                        "relative flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-300 group overflow-hidden border-2 text-center h-40",
                        selectedMethodId === method.id
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-105"
                          : "border-transparent bg-muted/40 hover:bg-muted/60 opacity-80 hover:opacity-100"
                      )}
                    >
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                          selectedMethodId === method.id
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-card text-muted-foreground"
                        )}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-base mb-1">{method.name}</h4>
                      <p className="text-[10px] text-muted-foreground px-2 leading-tight">
                        {method.description.split(".")[0]}.
                      </p>
                      {isApiSupported && (
                        <span className="absolute top-2 left-2 text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                          Live
                        </span>
                      )}
                      {selectedMethodId === method.id && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground p-1 rounded-full shadow-lg">
                          <CheckCircle className="w-4 h-4" weight="fill" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary Action Bar */}
            <div className="bg-card p-4 rounded-xl shadow-lg border flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Selected Configuration
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold truncate max-w-[160px]">
                    {selectedMaterialId
                      ? selectedMaterial?.title || selectedMaterial?.name
                      : "Select a material"}
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-bold text-primary">
                    {selectedMethodId
                      ? noteMethods.find((m) => m.id === selectedMethodId)?.name
                      : "Choose method"}
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleLaunch}
                disabled={!selectedMaterialId || !selectedMethodId}
                className="rounded-full px-10 h-12 font-bold shadow-lg shadow-primary/20 transition-transform active:scale-95"
              >
                {selectedMethodId && API_METHODS.includes(selectedMethodId)
                  ? "Open Notes"
                  : "Launch Studio"}
                <Sparkle className="ml-2 w-4 h-4" weight="fill" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}