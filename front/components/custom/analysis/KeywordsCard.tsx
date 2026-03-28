import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AnimatedCardContent from "@/components/custom/AnimatedCardContent";

export default function KeywordsCard({
    keywords,
    status,
    error
}: {
    keywords?: string[];
    status: "idle" | "loading" | "success" | "error";
    error?: string | null;
}) {
    return (
        <Card className="max-h-75 overflow-y-auto">
            <CardHeader>
                <CardTitle className="text-sm font-medium">
                    Mots-clefs
                </CardTitle>
            </CardHeader>
            <CardContent>
                <AnimatedCardContent contentKey={status}>
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
                    {status === "success" && keywords && (
                        <div className="flex flex-wrap gap-2">
                            {keywords.map((kw) => (
                                <span
                                    key={kw}
                                    className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    )}
                </AnimatedCardContent>
            </CardContent>
        </Card>
    );
}
