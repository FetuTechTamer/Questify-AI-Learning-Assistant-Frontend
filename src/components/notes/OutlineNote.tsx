import { NoteContent } from "@/data/mockNotes";
import { cn } from "@/lib/utils";

export const OutlineNote = ({ content }: { content: NoteContent }) => {
  if (!content) return null;

  return (
    <div className="max-w-4xl mx-auto py-12 px-8 min-h-screen bg-background">
      <div className="mb-12 border-b pb-8">
        <h1 className="text-4xl font-black tracking-tight mb-2 text-foreground">
          {content.title || "Untitled Note"}
        </h1>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
          {content.courseId?.toUpperCase() || "STUDIO"} • Outline Method
        </p>
      </div>

      <div className="space-y-12">
        {content.sections?.map((section, idx) => (
          <div key={idx} className="space-y-6">
            <h3 className="text-2xl font-black text-primary border-l-4 border-primary pl-4 leading-none">
              {section.heading}
            </h3>

            {Array.isArray(section.bullets) && section.bullets.length > 0 && (
              <ul className="space-y-4 ml-6 list-disc marker:text-primary/40">
                {section.bullets.map((b, i) => (
                  <li key={i} className="text-base text-muted-foreground leading-relaxed pl-3">
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};