import { redirect } from "next/navigation";
import AnalysisCards from "@/components/custom/AnalysisCards";
import UrlAnalysisCards from "@/components/custom/UrlAnalysisCards";
import ArticleContent from "@/components/custom/ArticleContent";
import { inputExample } from "@/lib/input-example";

export default async function ResultsPage({
    searchParams
}: {
    searchParams: Promise<{ url?: string }>;
}) {
    const { url } = await searchParams;

    if (!url) redirect("/search");

    const exampleArticle = inputExample.find((a) => a.url === url);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-[66%] mx-auto px-4 gap-8 flex flex-col">
                <h2>Analyse de votre article</h2>
                <h1 className="text-2xl font-bold text-gray-900 mb-2 max-w-2xl wrap-break-word">
                    {exampleArticle?.title ?? url}
                </h1>
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
