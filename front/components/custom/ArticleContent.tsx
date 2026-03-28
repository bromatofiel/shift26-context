import type { ArticleData } from "@/lib/types";

export default function ArticleContent({ article }: { article: ArticleData }) {
    return (
        <div className="w-full">
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
                        <p key={j} className="text-sm text-gray-700 mb-2">
                            {p}
                        </p>
                    ))}
                </div>
            ))}
        </div>
    );
}
