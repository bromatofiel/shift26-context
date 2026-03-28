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
            <div className="max-w-480 mx-auto px-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Analyse de votre article
                </h1>
                <p className="text-sm text-gray-500 mb-8">
                    {exampleArticle?.title ?? url}
                </p>
                {exampleArticle ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                        <div className="w-full min-w-0">
                            <ArticleContent article={exampleArticle} />
                        </div>
                        <div className="w-full min-w-0">
                            <AnalysisCards articleData={exampleArticle} />
                        </div>
                    </div>
                ) : (
                    <UrlAnalysisCards url={url} />
                )}
            </div>
        </div>
    );
}
