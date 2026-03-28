import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SummaryCard({
    summary,
    keywords,
    status,
    error
}: {
    summary?: string;
    keywords?: string[];
    status: "idle" | "loading" | "success" | "error";
    error?: string | null;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Résumé</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[300px] overflow-y-auto space-y-3">
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
                {status === "success" && summary && (
                    <p className="text-sm text-gray-700 leading-relaxed">
                        {summary}
                    </p>
                )}
                {keywords && keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {keywords.map((kw) => (
                            <span
                                key={kw}
                                className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                                {kw}
                            </span>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
