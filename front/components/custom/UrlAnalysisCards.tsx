"use client";

import { useFullAnalysis } from "@/hooks/useFullAnalysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SynthesisCard from "@/components/custom/analysis/SynthesisCard";
import { BiasScoreCard, BiasScoreSkeleton } from "@/components/custom/BiasScoreCard";
import { ExternalLink } from "lucide-react";
import type { FullAnalysisResult } from "@/lib/types";

const SECTION_LABELS = {
    summary: "Résumé",
    keywords: "Mots-clefs",
    entities: "Entités",
    blindspots: "Angles manquants",
    media: "Analyse du média",
    otherMedia: "Autres médias",
    cognitiveBias: "Biais cognitifs"
};

function AnalysisCard({
    title,
    children
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

function LoadingCards() {
    return (
        <div className="flex flex-col gap-4">
            <BiasScoreSkeleton />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.values(SECTION_LABELS).map((label) => (
                    <Card key={label}>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">
                                {label}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-gray-400 animate-pulse">
                                Chargement…
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default function UrlAnalysisCards({ url }: { url: string }) {
    const { status, data, error } = useFullAnalysis(url);

    if (status === "loading" || status === "idle") {
        return <LoadingCards />;
    }

    if (status === "error") {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-sm text-red-500">{error}</p>
                </CardContent>
            </Card>
        );
    }

    if (!data) return null;

    return (
        <div className="flex flex-col gap-4">
            {/* FIRST VISUAL: Bias Score */}
            <BiasScoreCard score={data.cognitiveBias.globalScore} />

            {/* Synthesis card full width */}
            {data.synthesis && (
                <SynthesisCard
                    status="success"
                    points={data.synthesis.points}
                />
            )}

            {/* Analysis cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnalysisCard title={SECTION_LABELS.summary}>
                <p className="text-xs">{data.summary}</p>
            </AnalysisCard>

            <AnalysisCard title={SECTION_LABELS.keywords}>
                <div className="flex flex-wrap gap-1">
                    {data.keywords.map((kw) => (
                        <span
                            key={kw}
                            className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {kw}
                        </span>
                    ))}
                </div>
            </AnalysisCard>

            <AnalysisCard title={SECTION_LABELS.entities}>
                <ul className="text-xs space-y-1">
                    {data.entities.map((e) => (
                        <li key={e.name}>
                            <span className="font-medium">{e.name}</span>{" "}
                            <span className="text-gray-400">
                                — {e.category ?? e.type}
                            </span>
                        </li>
                    ))}
                </ul>
            </AnalysisCard>

            <AnalysisCard title={SECTION_LABELS.blindspots}>
                <ul className="text-xs space-y-1 list-disc list-inside">
                    {data.blindspots.map((b, i) => (
                        <li key={i}>{b}</li>
                    ))}
                </ul>
            </AnalysisCard>

            <AnalysisCard title={SECTION_LABELS.media}>
                <p className="text-xs font-medium">{data.media.mediaName}</p>
                <p className="text-xs text-gray-600 mt-1">
                    {data.media.description}
                </p>
                {data.media.conflicts.length > 0 && (
                    <ul className="text-xs mt-2 space-y-1 list-disc list-inside text-orange-600">
                        {data.media.conflicts.map((c, i) => (
                            <li key={i}>{c}</li>
                        ))}
                    </ul>
                )}
            </AnalysisCard>

            <AnalysisCard title={SECTION_LABELS.otherMedia}>
                <ul className="text-xs space-y-2">
                    {data.otherMedia.map((item) => (
                        <li key={item.url} className="group">
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-gray-800 hover:text-blue-600 hover:underline flex items-center gap-1"
                                aria-label={`${item.title} (ouvre dans un nouvel onglet)`}
                            >
                                {item.title}
                                <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:text-blue-600" />
                            </a>
                            <span className="text-gray-400 block">
                                {item.media}
                            </span>
                        </li>
                    ))}
                </ul>
            </AnalysisCard>

            <AnalysisCard title={SECTION_LABELS.cognitiveBias}>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500">Score global</span>
                    <span
                        className={`text-xs font-bold ${
                            data.cognitiveBias.globalScore >= 66
                                ? "text-red-500"
                                : data.cognitiveBias.globalScore >= 33
                                  ? "text-orange-500"
                                  : "text-green-600"
                        }`}>
                        {data.cognitiveBias.globalScore}/100
                    </span>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                    {data.cognitiveBias.summary}
                </p>
                <ul className="text-xs space-y-1">
                    {data.cognitiveBias.signals.map((s, i) => (
                        <li key={i} className="text-gray-700">
                            <span className="font-medium">{s.bias}</span>{" "}
                            <span className="text-gray-400">
                                ({s.confidence})
                            </span>
                        </li>
                    ))}
                </ul>
            </AnalysisCard>
            </div>
        </div>
    );
}
