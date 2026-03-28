"use client";

import dynamic from "next/dynamic";
import type { ArticleData } from "@/lib/types";

const AnalysisCards = dynamic(
    () => import("@/components/custom/AnalysisCards"),
    {
        ssr: false,
        loading: () => (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-xl border bg-card animate-pulse h-32"
                    />
                ))}
            </div>
        )
    }
);

export default function AnalysisCardsLoader({
    articleData
}: {
    articleData: ArticleData;
}) {
    return <AnalysisCards articleData={articleData} />;
}
