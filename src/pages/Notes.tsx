import { useState, useEffect, useCallback } from "react";
import {
  Books,
  MagnifyingGlass,
  ArrowRight,
  Brain,
  Sparkle,
  CheckCircle,
  FileText,
  List,
  Table,
  Package,
  AlignLeft,
  CircleNotch,
  Trash,
  Plus
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Layout } from "@/components/layout/Layout";
import { cn } from "@/lib/utils";
import { noteMethods } from "@/data/mockData";
import NoteRoom from "./NoteRoom";
import { toast } from "sonner";
import { collectionsService, Collection } from "@/services/collectionsService";
import { noteService } from "@/services/noteService";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Filter only the 6 specified methods
const supportedMethodIds = ['cornell', 'sentence', 'boxing', 'outline', 'mindmap', 'charting'];
const filteredMethods = noteMethods.filter(m => supportedMethodIds.includes(m.id));

// Mock data fallbacks for each method
const mockNotesFallback: Record<string, any[]> = {
  'cornell': [
    { id: 'm-c-1', title: 'Cornell Example: Neural Networks', content: 'Cues: Architecture, Backprop. Notes: Neural nets consist of layers. Summary: Deep learning fundamentals.', created_at: new Date().toISOString() }
  ],
  'sentence': [
    { id: 'm-s-1', title: 'Sentence Example: Biology 101', content: 'Mitochondria is the powerhouse of the cell. Ribosomes are responsible for protein synthesis.', created_at: new Date().toISOString() }
  ],
  'outline': [
    { id: 'm-o-1', title: 'Outline Example: React Lifecycle', content: '1. Mounting\n   - constructor\n   - render\n   - componentDidMount', created_at: new Date().toISOString() }
  ],
  'mindmap': [
    { id: 'm-m-1', title: 'Mindmap Example: Web Dev', content: 'Frontend -> HTML, CSS, JS; Backend -> Node, Python, Go;', created_at: new Date().toISOString() }
  ],
  'boxing': [
    { id: 'm-b-1', title: 'Boxing Example: History', content: 'Box 1: WW1 (1914-1918); Box 2: WW2 (1939-1945);', created_at: new Date().toISOString() }
  ],
  'charting': [
    { id: 'm-ch-1', title: 'Charting Example: Compare Databases', content: 'SQL: Relational, Strict Schema; NoSQL: Non-relational, Flexible;', created_at: new Date().toISOString() }
  ]
};

export default function Notes() {
  const [activeTopic, setActiveTopic] = useState<any | null>(null);
  const [activeMethod, setActiveMethod] = useState<string | null>(null);
  const [isNoteRoomOpen, setIsNoteRoomOpen] = useState(false);

  // Selection state
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [selectedMethodId, setSelectedMethodId] = useState<string>("cornell");

  // Data state
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch collections on mount
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const data = await collectionsService.getCollections();
        setCollections(data);
        if (data.length > 0) {
          // Load last used or default
          const lastCollection = localStorage.getItem('last_note_collection');
          const initialId = lastCollection && data.find(c => c.collection_id === lastCollection)
            ? lastCollection
            : data[0].collection_id;

          setSelectedCollectionId(initialId);

          const lastMethod = localStorage.getItem('last_note_method');
          if (lastMethod && supportedMethodIds.includes(lastMethod)) {
            setSelectedMethodId(lastMethod);
          }
        }
      } catch (error) {
        console.error("Failed to fetch collections:", error);
        toast.error("Could not load study collections.");
      } finally {
        setIsLoadingCollections(false);
      }
    };
    fetchCollections();
  }, []);

  // Persist selections
  useEffect(() => {
    if (selectedCollectionId) localStorage.setItem('last_note_collection', selectedCollectionId);
    if (selectedMethodId) localStorage.setItem('last_note_method', selectedMethodId);
  }, [selectedCollectionId, selectedMethodId]);

  const fetchNotes = useCallback(async () => {
    if (!selectedCollectionId || !selectedMethodId) return;

    setIsLoadingNotes(true);
    console.log(`[Notes Hub] Fetching notes for collection ${selectedCollectionId} and method ${selectedMethodId}...`);

    try {
      const data = await noteService.getNotes(selectedMethodId, selectedCollectionId);
      console.log(`[Notes Hub] Received ${data.length} notes from API.`);
      setNotes(data);
    } catch (error: any) {
      console.error(`[Notes Hub] Failed to fetch notes:`, error);
      if (error.response?.status === 404) {
        console.warn(`[Notes Hub] Endpoint returned 404, falling back to mock data.`);
        toast.info("Backend not ready – showing mock results");
        setNotes(mockNotesFallback[selectedMethodId] || []);
      } else {
        toast.error("Failed to load notes.");
      }
    } finally {
      setIsLoadingNotes(false);
    }
  }, [selectedCollectionId, selectedMethodId]);

  // Fetch notes when selection changes
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleLaunch = async () => {
    if (!selectedCollectionId || !selectedMethodId) {
      toast.error("Please select a collection first.");
      return;
    }

    console.log(`[Notes Hub] Launching Studio for collection ${selectedCollectionId}, method ${selectedMethodId}`);
    setIsGenerating(true);

    try {
      const result = await noteService.generateNote(selectedMethodId, selectedCollectionId);
      console.log(`[Notes Hub] Generation successful:`, result);
      toast.success("AI Studio is processing your materials...");

      // Immediately fetch notes after success
      console.log(`[Notes Hub] Refreshing note list...`);
      await fetchNotes();
    } catch (error: any) {
      console.error(`[Notes Hub] Launch failed:`, error);
      if (error.response?.status === 404) {
        toast.info("Backend not ready – showing mock results");
        console.warn(`[Notes Hub] Falling back to mock results due to 404.`);
        setNotes(mockNotesFallback[selectedMethodId] || []);
      } else {
        const errorMsg = error.response?.data?.message || "AI service is currently busy.";
        toast.error(errorMsg);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteNote = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    try {
      await noteService.deleteNote(selectedMethodId, noteId);
      toast.success("Note removed successfully.");
      await fetchNotes();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Could not delete this note.");
    }
  };

  const handleOpenNote = (note: any) => {
    const transformedTopic = {
      id: note.id || note.note_id,
      title: note.title || "Generated Note",
      courseId: "AI-Studio",
      [selectedMethodId]: note.content || note
    };

    setActiveTopic(transformedTopic);
    setActiveMethod(selectedMethodId);
    setIsNoteRoomOpen(true);
  };

  const filteredCollections = collections.filter(collection =>
    collection.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isNoteRoomOpen && activeTopic && activeMethod) {
    return (
      <Layout showSidebar={false} title={`Notes: ${activeTopic.title}`}>
        <NoteRoom
          topic={activeTopic}
          initialMethod={activeMethod}
          onClose={() => setIsNoteRoomOpen(false)}
        />
      </Layout>
    );
  }

  return (
    <DashboardLayout title="Cognitive Studio">
      <div className="container py-6 max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Cognitive Studio</h1>
            <p className="text-muted-foreground mt-1">Transform your study materials into structured cognitive assets.</p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1 gap-1.5 font-medium rounded-full bg-primary/5">
              <Books className="w-3.5 h-3.5 text-primary" />
              {collections.length} Collections
            </Badge>
            <Badge variant="outline" className="px-3 py-1 gap-1.5 font-medium rounded-full bg-primary/5">
              <Brain className="w-3.5 h-3.5 text-primary" />
              6 Methods
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left: Collections Sidebar (Optional but kept for UI consistency) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Collection</h2>
              </div>
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Filter collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 rounded-xl border-none bg-muted/50"
                />
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {isLoadingCollections ? (
                  [1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)
                ) : filteredCollections.map(c => (
                  <button
                    key={c.collection_id}
                    onClick={() => setSelectedCollectionId(c.collection_id)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl transition-all border",
                      selectedCollectionId === c.collection_id
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-transparent hover:bg-muted"
                    )}
                  >
                    <p className="font-bold text-sm truncate">{c.title}</p>
                    <p className="text-[10px] opacity-60">Created {new Date(c.created_at).toLocaleDateString()}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Tabs & Notes */}
          <div className="lg:col-span-9 space-y-8">
            <Tabs value={selectedMethodId} onValueChange={setSelectedMethodId} className="w-full">
              <TabsList className="grid grid-cols-3 md:grid-cols-6 h-auto p-1 bg-muted/50 rounded-2xl">
                {filteredMethods.map(m => (
                  <TabsTrigger
                    key={m.id}
                    value={m.id}
                    className="rounded-xl py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg">{m.icon}</span>
                      <span className="text-[10px] font-bold uppercase tracking-tighter">{m.name.split(' ')[0]}</span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              {filteredMethods.map(m => (
                <TabsContent key={m.id} value={m.id} className="mt-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">{m.name}</h2>
                      <p className="text-sm text-muted-foreground">{m.description}</p>
                    </div>
                  </div>

                  {isLoadingNotes ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-50 border border-dashed rounded-3xl">
                      <CircleNotch className="w-10 h-10 animate-spin text-primary" />
                      <p className="text-sm font-medium">Synchronizing studio...</p>
                    </div>
                  ) : notes.length === 0 ? (
                    <Card className="p-16 text-center border-dashed bg-muted/10 rounded-3xl">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                        <Sparkle className="w-8 h-8" weight="fill" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">No {m.name} notes yet</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                        Click "Launch Studio" above to let AI analyze your materials and generate structured notes.
                      </p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {notes.map((note) => (
                        <Card
                          key={note.id || note.note_id}
                          className="group relative overflow-hidden p-6 hover:shadow-xl transition-all cursor-pointer border-primary/10"
                          onClick={() => handleOpenNote(note)}
                        >
                          <div className="flex flex-col h-full gap-4">
                            <div className="flex items-start justify-between">
                              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                <FileText className="w-6 h-6" />
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                                onClick={(e) => handleDeleteNote(e, note.id || note.note_id)}
                              >
                                <Trash className="w-5 h-5" />
                              </Button>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                                {new Date(note.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                              </p>
                              <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                {note.title}
                              </h3>
                            </div>
                            <div className="pt-4 border-t flex items-center justify-between text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                              Open in Studio
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>

            {/* Selection Summary Action */}
            <div className="bg-card p-4 rounded-xl shadow-lg border flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
              <div className="space-y-1 text-center md:text-left">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Selected Configuration</p>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm">
                    {selectedCollectionId ? collections.find(c => c.collection_id === selectedCollectionId)?.title : "Select a topic"}
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <span className="font-bold text-sm text-primary">
                    {selectedMethodId ? filteredMethods.find(m => m.id === selectedMethodId)?.name : "Choose method"}
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleLaunch}
                disabled={isGenerating || !selectedCollectionId}
                className="rounded-xl px-8 h-12 gap-2 font-bold shadow-lg shadow-primary/20"
              >
                {isGenerating ? <CircleNotch className="w-4 h-4 animate-spin" /> : <Sparkle className="w-4 h-4" />}
                Launch Studio
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}