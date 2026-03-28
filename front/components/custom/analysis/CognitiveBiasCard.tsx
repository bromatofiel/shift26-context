import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BiasFamily, BiasSignal, CognitiveBiasResult } from "@/lib/types";
import AnimatedCardContent from "@/components/custom/AnimatedCardContent";

const FAMILY_LABELS: Record<BiasFamily, string> = {
    selection_faits: "Sélection des faits",
    cadrage_lexical: "Cadrage lexical",
    causalite_fragile: "Causalité fragile",
    usage_chiffres: "Usage des chiffres",
    structure_recit: "Structure du récit",
    qualite_argumentative: "Qualité argumentative"
};

const CONFIDENCE_STYLES: Record<BiasSignal["confidence"], string> = {
    low: "bg-green-50 text-green-700",
    medium: "bg-orange-50 text-orange-700",
    high: "bg-red-50 text-red-700"
};

const CONFIDENCE_LABELS: Record<BiasSignal["confidence"], string> = {
    low: "faible",
    medium: "moyen",
    high: "élevé"
};

function ScoreGauge({ score }: { score: number }) {
    const color =
        score <= 40
            ? "bg-green-500"
            : score <= 65
              ? "bg-orange-400"
              : "bg-red-500";

    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${color}`}
                    style={{ width: `${score}%` }}
                />
            </div>
            <span className="text-sm font-semibold tabular-nums w-8 text-right">
                {score}
            </span>
        </div>
    );
}

export default function CognitiveBiasCard({
    cognitiveBias,
    status,
    error
}: {
    cognitiveBias?: CognitiveBiasResult;
    status: "idle" | "loading" | "success" | "error";
    error?: string | null;
}) {
    return (
        <Card className="sm:col-span-2">
            <CardHeader>
                <CardTitle className="text-sm font-medium">
                    Biais cognitifs
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    {status === "success" && cognitiveBias && (
                        <>
                            {/* Score global */}
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500 font-medium">
                                    Score de biais
                                </p>
                                <ScoreGauge score={cognitiveBias.globalScore} />
                            </div>

                            {/* Résumé */}
                            <div className="py-4">
                                <p className="text-sm text-gray-600 leading-relaxed border-l-2 border-gray-200 pl-3">
                                    {cognitiveBias.summary}
                                </p>
                            </div>

                            {/* Signaux */}
                            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                                {cognitiveBias.signals.map((signal, i) => (
                                    <div
                                        key={i}
                                        className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-1.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-800">
                                                {signal.bias}
                                            </span>
                                            <span
                                                className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${CONFIDENCE_STYLES[signal.confidence]}`}>
                                                {
                                                    CONFIDENCE_LABELS[
                                                        signal.confidence
                                                    ]
                                                }
                                            </span>
                                            <span className="text-[10px] text-gray-400 ml-auto">
                                                {FAMILY_LABELS[signal.family]}
                                            </span>
                                        </div>
                                        {signal.excerpt && (
                                            <p className="text-[11px] text-gray-500 italic leading-snug">
                                                {signal.excerpt}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            {signal.explanation}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </AnimatedCardContent>
            </CardContent>
        </Card>
    );
}
