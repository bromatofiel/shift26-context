"use client";

import {
    useWorkflowResults,
    type WorkflowResults
} from "@/hooks/useWorkflowResults";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ArticleData } from "@/lib/types";

const WORKFLOW_LABELS: Record<keyof WorkflowResults, string> = {
    keywords: "Mots-clefs",
    summary: "Résumé",
    entities: "Entités",
    blindspots: "Angles manquants",
    media: "Analyse du média",
    otherMedia: "Autres médias"
};

function WorkflowCard({
    title,
    state
}: {
    title: string;
    state: WorkflowResults[keyof WorkflowResults];
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {state.status === "idle" && (
                    <p className="text-xs text-gray-400">En attente…</p>
                )}
                {state.status === "loading" && (
                    <p className="text-xs text-gray-400 animate-pulse">
                        Chargement…
                    </p>
                )}
                {state.status === "error" && (
                    <p className="text-xs text-red-500">{state.error}</p>
                )}
                {state.status === "success" && (
                    <pre className="text-xs whitespace-pre-wrap break-all">
                        {JSON.stringify(state.data, null, 2)}
                    </pre>
                )}
            </CardContent>
        </Card>
    );
}

export default function AnalysisCards({
    articleData
}: {
    articleData: ArticleData;
}) {
    const { results, start } = useWorkflowResults(articleData);
    const hasStarted = Object.values(results).some((s) => s.status !== "idle");

    return (
        <div className="space-y-4">
            {!hasStarted && <Button onClick={start}>Analyser l'article</Button>}
            {hasStarted && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(
                        Object.keys(
                            WORKFLOW_LABELS
                        ) as (keyof WorkflowResults)[]
                    ).map((key) => (
                        <WorkflowCard
                            key={key}
                            title={WORKFLOW_LABELS[key]}
                            state={results[key]}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
