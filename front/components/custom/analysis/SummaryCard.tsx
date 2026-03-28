import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SummaryCard({
    summary,
    status,
    error
}: {
    summary?: string;
    status: "idle" | "loading" | "success" | "error";
    error?: string | null;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Résumé</CardTitle>
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
                {status === "success" && summary && (
                    <p className="text-sm text-gray-700 leading-relaxed">
                        {summary}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
