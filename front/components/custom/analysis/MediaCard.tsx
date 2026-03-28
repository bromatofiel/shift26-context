import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MediaResult } from "@/lib/types";

// Parses markdown links like ([text](url)) or [text](url) into <a> tags
function RichText({ text }: { text: string }) {
    const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
    return (
        <>
            {parts.map((part, i) => {
                const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                if (match) {
                    return (
                        <a
                            key={i}
                            href={match[2]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline">
                            {match[1]}
                        </a>
                    );
                }
                return <span key={i}>{part}</span>;
            })}
        </>
    );
}

export default function MediaCard({
    media,
    status,
    error
}: {
    media?: MediaResult;
    status: "idle" | "loading" | "success" | "error";
    error?: string | null;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">
                    Analyse du média
                </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[300px] overflow-y-auto">
                {status === "idle" && (
                    <p className="text-xs text-gray-400">En attente…</p>
                )}
                {status === "loading" && (
                    <p className="text-xs text-gray-400 animate-pulse">
                        Chargement…
                    </p>
                )}
                {status === "error" && (
                    <p className="text-xs text-red-500">{error}</p>
                )}
                {status === "success" && media && (
                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-gray-800">
                            {media.mediaName}
                        </p>
                        {media.conflicts.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                                {media.conflicts.map((c, i) => (
                                    <div
                                        key={i}
                                        className="flex gap-2 text-xs text-orange-700 bg-orange-50 rounded-md px-2 py-1.5">
                                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                        <span>{c}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="text-xs text-gray-600 leading-relaxed">
                            <RichText text={media.description} />
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
