"use client";

import { useEffect } from "react";
import {
    useWorkflowResults,
    type WorkflowResults
} from "@/hooks/useWorkflowResults";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EntitiesCard from "@/components/custom/analysis/EntitiesCard";
import KeywordsCard from "@/components/custom/analysis/KeywordsCard";
import SummaryCard from "@/components/custom/analysis/SummaryCard";
import type {
    ArticleData,
    EntitiesResult,
    KeywordsResult,
    SummaryResult
} from "@/lib/types";

const WORKFLOW_LABELS: Record<keyof WorkflowResults, string> = {
    keywords: "Mots-clefs",
    summary: "Résumé",
    entities: "Entités",
    blindspots: "Angles manquants",
    media: "Analyse du média",
    otherMedia: "Autres médias",
    cognitiveBias: "Biais cognitifs"
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
            <CardContent className="max-h-[300px] overflow-y-auto">
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

    useEffect(() => {
        start();
    }, [start]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Résumé + Mots-clefs empilés verticalement */}
            <div className="flex flex-col gap-4 sm:col-span-2">
                <SummaryCard
                    status={results.summary.status}
                    summary={
                        (results.summary.data as SummaryResult | null)?.summary
                    }
                    error={results.summary.error}
                />
                <KeywordsCard
                    status={results.keywords.status}
                    keywords={
                        (results.keywords.data as KeywordsResult | null)
                            ?.keywords
                    }
                    error={results.keywords.error}
                />
            </div>
            <EntitiesCard
                status={results.entities.status}
                entities={
                    (results.entities.data as EntitiesResult | null)?.entities
                }
                error={results.entities.error}
            />
            {(
                ["blindspots", "media", "otherMedia", "cognitiveBias"] as const
            ).map((key) => (
                <WorkflowCard
                    key={key}
                    title={WORKFLOW_LABELS[key]}
                    state={results[key]}
                />
            ))}
        </div>
    );
}
