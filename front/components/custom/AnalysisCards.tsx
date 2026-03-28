"use client";

import { useEffect } from "react";
import {
    useWorkflowResults,
    type WorkflowResults
} from "@/hooks/useWorkflowResults";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EntitiesCard from "@/components/custom/analysis/EntitiesCard";
import SummaryCard from "@/components/custom/analysis/SummaryCard";
import MediaCard from "@/components/custom/analysis/MediaCard";
import OtherMediaCard from "@/components/custom/analysis/OtherMediaCard";
import CognitiveBiasCard from "@/components/custom/analysis/CognitiveBiasCard";
import BlindSpotsCard from "@/components/custom/analysis/BlindSpotsCard";
import SynthesisCard from "@/components/custom/analysis/SynthesisCard";
import type {
    ArticleData,
    EntitiesResult,
    KeywordsResult,
    SummaryResult,
    MediaResult,
    OtherMediaArticle,
    CognitiveBiasResult,
    BlindSpotsResult,
    SynthesisResult
} from "@/lib/types";

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
            {results.synthesis.status !== "idle" && (
                <SynthesisCard
                    status={results.synthesis.status}
                    points={
                        (results.synthesis.data as SynthesisResult | null)
                            ?.points
                    }
                    error={results.synthesis.error}
                />
            )}
            <div className="sm:col-span-2">
                <SummaryCard
                    status={results.summary.status}
                    summary={
                        (results.summary.data as SummaryResult | null)?.summary
                    }
                    keywords={
                        (results.keywords.data as KeywordsResult | null)
                            ?.keywords
                    }
                    error={results.summary.error}
                />
            </div>
            <BlindSpotsCard
                status={results.blindspots.status}
                blindspots={
                    (results.blindspots.data as BlindSpotsResult | null)
                        ?.blindspots
                }
                error={results.blindspots.error}
            />
            <CognitiveBiasCard
                status={results.cognitiveBias.status}
                cognitiveBias={
                    (results.cognitiveBias
                        .data as CognitiveBiasResult | null) ?? undefined
                }
                error={results.cognitiveBias.error}
            />
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <OtherMediaCard
                    status={results.otherMedia.status}
                    otherMedia={
                        (
                            results.otherMedia.data as {
                                otherMedia: OtherMediaArticle[];
                            } | null
                        )?.otherMedia
                    }
                    error={results.otherMedia.error}
                />
                <MediaCard
                    status={results.media.status}
                    media={
                        (results.media.data as MediaResult | null) ?? undefined
                    }
                    error={results.media.error}
                />
            </div>
            <EntitiesCard
                status={results.entities.status}
                entities={
                    (results.entities.data as EntitiesResult | null)?.entities
                }
                error={results.entities.error}
            />
        </div>
    );
}
