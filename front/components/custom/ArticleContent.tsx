"use client";

import { useState } from "react";
import type { ArticleData } from "@/lib/types";
import { Button } from "../ui/button";

export default function ArticleContent({ article }: { article: ArticleData }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="w-full flex flex-col justify-center">
            <div className="relative">
                <div
                    className={`overflow-hidden scroll-y-auto transition-[max-height] duration-300 ease-in-out ${
                        expanded ? "max-h-[700px]" : "max-h-[300px]"
                    }`}>
                    <p className="text-xs text-gray-400 mb-4">
                        {article.source}
                        {article.authors.length > 0 && (
                            <> · {article.authors.join(", ")}</>
                        )}
                    </p>
                    {article.sections.map((section, i) => (
                        <div key={i} className="mb-4">
                            {section.heading && (
                                <h2 className="text-sm font-semibold text-gray-800 mb-2">
                                    {section.heading}
                                </h2>
                            )}
                            {section.paragraphs.map((p, j) => (
                                <p
                                    key={j}
                                    className="text-sm text-gray-700 mb-2">
                                    {p}
                                </p>
                            ))}
                        </div>
                    ))}
                </div>
                {!expanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
                )}
            </div>
            <Button
                variant="outline"
                onClick={() => setExpanded(!expanded)}
                className="mt-2 mx-auto hover:cursor-pointer">
                {expanded
                    ? "Réduire l'article ↑"
                    : "Voir l'article en entier ↓"}
            </Button>
        </div>
    );
}
