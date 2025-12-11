import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import { useNotes } from "@/contexts/NotesContext";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner, LoadingScreen } from "@/components/LoadingSpinner";
import { toast } from "@/hooks/use-toast";

export default function NoteEditor() {
  const { id } = useParams<{ id: string }>();
  const isEditing = id && id !== "new";
  
  const { getNoteById, createNote, updateNote, isLoading: notesLoading } = useNotes();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const note = getNoteById(id!);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
      }
    }
    setIsInitialized(true);
  }, [id, isEditing, getNoteById]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      toast({
        title: "Cannot save empty note",
        description: "Please add a title or content to your note.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      if (isEditing) {
        await updateNote(id!, title, content);
        toast({
          title: "Note updated",
          description: "Your changes have been saved.",
        });
      } else {
        await createNote(title, content);
        toast({
          title: "Note created",
          description: "Your new note has been saved.",
        });
      }
      navigate("/");
    } catch {
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  if (notesLoading || !isInitialized) {
    return <LoadingScreen />;
  }

  if (isEditing && !getNoteById(id!)) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-display font-bold text-foreground mb-4">
            Note not found
          </h1>
          <p className="text-muted-foreground mb-6">
            The note you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="w-4 h-4" />
            Back to Notes
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button variant="gradient" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <LoadingSpinner size="sm" className="border-primary-foreground border-t-transparent" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-card border border-border/50 p-6 sm:p-8 animate-fade-in">
          <div className="space-y-6">
            <div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title..."
                className="border-0 bg-transparent text-2xl font-display font-bold placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                disabled={isSaving}
              />
            </div>
            
            <div className="border-t border-border/50" />
            
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your note..."
              className="min-h-[400px] border-0 bg-transparent resize-none placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-foreground leading-relaxed"
              disabled={isSaving}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
