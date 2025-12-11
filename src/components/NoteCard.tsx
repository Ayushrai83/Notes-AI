import { formatDistanceToNow } from "date-fns";
import { Edit2, Trash2, Clock } from "lucide-react";
import { Note } from "@/contexts/NotesContext";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function NoteCard({ note, onEdit, onDelete, className, style }: NoteCardProps) {
  const preview = note.content.length > 150 
    ? note.content.substring(0, 150) + "..." 
    : note.content;

  return (
    <div
      className={cn(
        "group bg-card rounded-xl p-5 shadow-soft border border-border/50 transition-all duration-300 hover:shadow-card hover:border-primary/20 hover:-translate-y-1 animate-slide-up",
        className
      )}
      style={style}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-display font-semibold text-foreground text-lg line-clamp-1 flex-1">
          {note.title || "Untitled Note"}
        </h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => onEdit(note)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(note)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">
        {preview || "No content"}
      </p>
      
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="w-3.5 h-3.5" />
        <span>{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
      </div>
    </div>
  );
}
