"use client";

import { useRouter } from "next/navigation";
import SearchInput from "@/components/custom/SearchInput";
import ExampleArticleCard from "@/components/custom/ExampleArticleCard";
import { inputExample } from "@/lib/input-example";

export default function SearchPage() {
    const router = useRouter();

    const navigateTo = (url: string) => {
        router.push(`/results?url=${encodeURIComponent(url)}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">
                    Un meilleur contexte pour tous vos articles de presse.
                </h1>
                <SearchInput onSubmit={navigateTo} />
                <div className="mt-8">
                    <p className="text-sm text-gray-500 mb-3">Exemples</p>
                    <div className="flex flex-col gap-3">
                        {inputExample.map((article) => (
                            <ExampleArticleCard
                                key={article.url}
                                title={article.title}
                                source={article.source}
                                authors={article.authors}
                                onClick={() => navigateTo(article.url)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
