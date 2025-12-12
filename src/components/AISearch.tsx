// Unified AISearch — Only ONE button
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotes } from "@/contexts/NotesContext";
import { Button } from "@/components/ui/button";

export type SmallNote = {
    id: string;
    title: string;
    content: string;
};

interface Props {
    onResults: (notes: SmallNote[] | null) => void;  // null = clear
    onError?: (msg: string) => void;
}

export default function AISearch({ onResults, onError }: Props) {
    const { user } = useAuth();
    const { notes, aiSearch, searchNotes } = useNotes() as any;

    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(false);
    const [info, setInfo] = useState<string | null>(null);

    const unifiedSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setInfo(null);

        if (!q.trim()) {
            onResults(null);
            return;
        }

        setLoading(true);
        try {
            // 1️⃣ Try AI Search first
            if (user && typeof aiSearch === "function") {
                const response = await aiSearch(q);

                if (Array.isArray(response) && response.length > 0) {
                    const formatted = response.map((n: any) => ({
                        id: n.id,
                        title: n.title ?? "",
                        content: n.content ?? "",
                    }));
                    setInfo(`AI found ${formatted.length} results`);
                    onResults(formatted);
                    setLoading(false);
                    return;
                }
            }

            // 2️⃣ Fallback: local simple search
            const fallback = searchNotes(q);
            const formatted = fallback.map((n: any) => ({
                id: n.id,
                title: n.title,
                content: n.content,
            }));

            setInfo(`Local search found ${formatted.length} results`);
            onResults(formatted);
        } catch (err: any) {
            console.error("Unified search failed:", err);
            onError?.("AI search failed — using normal search");

            const fallback = searchNotes(q);
            const formatted = fallback.map((n: any) => ({
                id: n.id,
                title: n.title,
                content: n.content,
            }));

            setInfo(`Local search found ${formatted.length} results`);
            onResults(formatted);
        } finally {
            setLoading(false);
        }
    };

    const clearSearch = () => {
        setQ("");
        setInfo(null);
        onResults(null);
    };

    return (
        <form onSubmit={unifiedSearch} className="w-full max-w-2xl mx-auto">
            <div className="flex gap-3 items-center">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search your notes with AI..."
                    className="flex-1 px-4 py-2 rounded-md border border-slate-300"
                />

                <Button type="submit" disabled={loading || !q.trim()}>
                    {loading ? "Thinking..." : "Search with AI"}
                </Button>

                <Button type="button" variant="secondary" onClick={clearSearch}>
                    Clear
                </Button>
            </div>

            {info && <p className="mt-2 text-sm text-muted-foreground">{info}</p>}
        </form>
    );
}
