// src/pages/Dashboard.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useNotes, Note } from "@/contexts/NotesContext";
import { NavBar } from "@/components/NavBar";
import { NoteCard } from "@/components/NoteCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import AISearch, { SmallNote } from "@/components/AISearch";

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

  // AI Search State (null = no AI mode)
  const [aiResults, setAiResults] = useState<SmallNote[] | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Merge AI results with full notes when possible so NoteCard shows proper metadata
  const displayedNotes = useMemo(() => {
    if (aiResults !== null) {
      const notesById = new Map(notes.map((n) => [n.id, n]));
      return aiResults.map((sn) => {
        const full = notesById.get(sn.id);
        return (
            full ?? {
              id: sn.id,
              title: sn.title,
              content: sn.content,
              createdAt: "",
              updatedAt: "",
              userId: "",
            }
        );
      }) as Note[];
    }

    if (!searchQuery.trim()) return notes;
    return searchNotes(searchQuery);
  }, [notes, searchQuery, searchNotes, aiResults]);

  const handleSearch = (query: string) => {
    // Normal (non-AI) search clears AI mode
    setAiResults(null);
    setSearchQuery(query);
  };

  const handleCreateNote = () => navigate("/notes/new");
  const handleEditNote = (note: Note) => navigate(`/notes/${note.id}`);
  const handleDeleteNote = (note: Note) => setNoteToDelete(note);

  const confirmDelete = async () => {
    if (!noteToDelete) return;
    setIsDeleting(true);
    await deleteNote(noteToDelete.id);
    setIsDeleting(false);
    setNoteToDelete(null);
    toast({ title: "Note deleted", description: "Your note has been permanently removed." });
  };

  return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <NavBar />

        <main className="max-w-6xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-semibold text-slate-900 mb-1">Your Notes</h1>
              <p className="text-sm text-slate-500 flex items-center gap-2">
                {notes.length} {notes.length === 1 ? "note" : "notes"} total
                {aiResults && (
                    <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 ring-1 ring-slate-100">
                  AI results
                </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleCreateNote} variant="gradient" size="lg" className="shadow-sm">
                <Plus className="w-5 h-5" />
                New Note
              </Button>
            </div>
          </div>

          {/* Unified Search (single input + single primary button) */}
          <div className="mb-8">
            <div className="bg-white/70 backdrop-blur-md border border-slate-100 rounded-xl p-4 shadow-sm">
              <AISearch
                  onResults={(results) => {
                    setAiError(null);
                    setAiResults(results);
                  }}
                  onError={(msg) => setAiError(msg)}
                  onSearch={handleSearch}
              />
            </div>

            {aiError && <div className="mt-3 text-sm text-red-600">{aiError}</div>}
          </div>

          {/* Notes grid */}
          {isLoading ? (
              <div className="flex justify-center py-24">
                <LoadingSpinner size="lg" />
              </div>
          ) : displayedNotes.length === 0 ? (
              aiResults !== null ? (
                  <EmptyState type="no-results" searchQuery={"AI Search"} />
              ) : searchQuery ? (
                  <EmptyState type="no-results" searchQuery={searchQuery} />
              ) : (
                  <EmptyState type="no-notes" onCreateNote={handleCreateNote} />
              )
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedNotes.map((note, idx) => (
                    <div
                        key={note.id}
                        className="rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                        style={{ animationDelay: `${idx * 40}ms` }}
                    >
                      <NoteCard
                          note={note}
                          onEdit={handleEditNote}
                          onDelete={handleDeleteNote}
                      />
                    </div>
                ))}
              </div>
          )}
        </main>

        {/* Delete confirmation */}
        <AlertDialog open={!!noteToDelete} onOpenChange={() => setNoteToDelete(null)}>
          <AlertDialogContent className="max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg font-medium">Delete Note</AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-slate-600">
                Are you sure you want to delete "{noteToDelete?.title || "Untitled Note"}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="ml-2 bg-red-600 text-white hover:bg-red-700"
              >
                {isDeleting ? <LoadingSpinner size="sm" /> : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
}
