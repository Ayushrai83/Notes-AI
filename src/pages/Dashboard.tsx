import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useNotes, Note } from "@/contexts/NotesContext";
import { NavBar } from "@/components/NavBar";
import { SearchBar } from "@/components/SearchBar";
import { NoteCard } from "@/components/NoteCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { notes, isLoading, searchNotes, deleteNote } = useNotes();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const displayedNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    return searchNotes(searchQuery);
  }, [notes, searchQuery, searchNotes]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCreateNote = () => {
    navigate("/notes/new");
  };

  const handleEditNote = (note: Note) => {
    navigate(`/notes/${note.id}`);
  };

  const handleDeleteNote = (note: Note) => {
    setNoteToDelete(note);
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;
    
    setIsDeleting(true);
    await deleteNote(noteToDelete.id);
    setIsDeleting(false);
    setNoteToDelete(null);
    
    toast({
      title: "Note deleted",
      description: "Your note has been permanently removed.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-1">
              Your Notes
            </h1>
            <p className="text-muted-foreground">
              {notes.length} {notes.length === 1 ? "note" : "notes"} total
            </p>
          </div>
          <Button onClick={handleCreateNote} variant="gradient" size="lg">
            <Plus className="w-5 h-5" />
            New Note
          </Button>
        </div>

        <div className="flex justify-center mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : displayedNotes.length === 0 ? (
          searchQuery ? (
            <EmptyState type="no-results" searchQuery={searchQuery} />
          ) : (
            <EmptyState type="no-notes" onCreateNote={handleCreateNote} />
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedNotes.map((note, index) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
              />
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={!!noteToDelete} onOpenChange={() => setNoteToDelete(null)}>
        <AlertDialogContent className="animate-scale-in">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{noteToDelete?.title || "Untitled Note"}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <LoadingSpinner size="sm" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
