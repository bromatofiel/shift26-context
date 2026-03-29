import { redirect } from "next/navigation";
import AnalysisCards from "@/components/custom/AnalysisCards";
import UrlAnalysisCards from "@/components/custom/UrlAnalysisCards";
import ArticleContent from "@/components/custom/ArticleContent";
import { inputExample } from "@/lib/input-example";

export default async function ResultsPage({
    searchParams
}: {
    searchParams: Promise<{ url?: string, title?: string }>;
}) {
    const { url, title } = await searchParams;

    if (!url) redirect("/search");

    const exampleArticle = inputExample.find((a) => a.url === url);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero vidéo */}
            <div className="relative h-64 overflow-hidden">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    src="/bg-video-hd.mp4"
                />
                <div className="absolute inset-0 bg-linear-to-t from-gray-50 via-gray-50/60 to-transparent" />
            </div>

            {/* Contenu */}
            <div className="max-w-[66%] mx-auto px-4 py-8 gap-8 flex flex-col">
                <div className="flex flex-col gap-1">
                    <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Analyse de votre article
                    </h2>
                    <h1 className="text-4xl font-bold text-gray-900 max-w-2xl wrap-break-word">
                        {exampleArticle?.title ?? title ?? url}
                    </h1>
                </div>
                {exampleArticle ? (
                    <div className="flex flex-col gap-8 w-full">
                        <ArticleContent article={exampleArticle} />
                        <AnalysisCards articleData={exampleArticle} />
                    </div>
                ) : (
                    <UrlAnalysisCards url={url} />
                )}
            </div>
        </div>
    );
}
