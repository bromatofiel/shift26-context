"use client";

import SearchInput from "@/components/custom/SearchInput";

export default function SearchPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">
                    Un meilleur contexte pour tous vos articles de presse.
                </h1>
                <SearchInput />
            </div>
        </div>
    );
}
