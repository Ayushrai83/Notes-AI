import { FileText, Search, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  type: "no-notes" | "no-results";
  searchQuery?: string;
  onCreateNote?: () => void;
  className?: string;
}

export function EmptyState({ type, searchQuery, onCreateNote, className }: EmptyStateProps) {
  if (type === "no-results") {
    return (
      <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in", className)}>
        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-accent-foreground" />
        </div>
        <h3 className="text-xl font-display font-semibold text-foreground mb-2">
          No matching notes
        </h3>
        <p className="text-muted-foreground max-w-sm">
          We couldn't find any notes matching "{searchQuery}". Try different keywords or create a new note.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in", className)}>
      <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-6">
        <FileText className="w-10 h-10 text-accent-foreground" />
      </div>
      <h3 className="text-2xl font-display font-semibold text-foreground mb-2">
        No notes yet
      </h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        Start capturing your thoughts, ideas, and insights. Your first note is just a click away.
      </p>
      {onCreateNote && (
        <Button onClick={onCreateNote} variant="gradient" size="lg">
          <Plus className="w-5 h-5" />
          Create Your First Note
        </Button>
      )}
    </div>
  );
}
