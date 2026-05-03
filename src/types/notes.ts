export interface NoteContent {
    id: string;
    courseId: string;
    title: string;
    date: string;
    method: 'cornell' | 'outline' | 'mindmap' | 'boxing' | 'charting' | 'zettelkasten' | 'feynman' | 'flowchart' | 'sentence' | 'sketchnote';
    // Cornell
    cues?: { keyword: string; content: string }[];
    summary?: string;
    // Outline / Sentence
    sections?: {
        heading?: string;
        level?: 1 | 2 | 3;
        content?: string;
        bullets?: string[];
    }[]; // Also used for Sentence method (as flat list)
    // Mind Map
    center?: string;
    branches?: {
        title: string;
        items: string[];
        color: string;
        subBranches?: { title: string; items: string[] }[] // Added depth
    }[];
    // Boxing
    boxes?: {
        title: string;
        color: string;
        items: string[];
        notes?: string;
    }[];
    // Charting
    headers?: string[];
    rows?: string[][];
    // Zettelkasten
    notes?: {
        id: string;
        title: string;
        content: string;
        links: string[];
        tags: string[]
    }[];
    // Feynman
    concept?: string;
    simpleExplanation?: string;
    gaps?: string[];
    refinedExplanation?: string;
    analogy?: string; // Added analogy
    // Flowchart
    nodes?: {
        id: string;
        type: 'start' | 'process' | 'decision' | 'end';
        text: string;
        connections: string[];
        x?: number; // Optional positioning hints if needed, but we'll try auto-layout or CSS grid
        y?: number;
    }[];
    // Sketch Note (simplified representation for UI)
    sketchSections?: {
        icon: string;
        title: string;
        content: string;
        doodles?: string[]; // E.g., 'arrow', 'star' to denote visuals
    }[];
}
