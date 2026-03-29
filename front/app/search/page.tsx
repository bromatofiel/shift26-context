"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, X } from "lucide-react";
import { inputExample } from "@/lib/input-example";

export default function SearchPage() {
    const router = useRouter();
    const [value, setValue] = useState("");

    const navigateTo = (url: string) => {
        router.push(`/results?url=${encodeURIComponent(url)}`);
    };

    const canSubmit = value.trim().length > 0;

    return (
        <main className="blindspot-video-page">
            <video
                autoPlay
                muted
                loop
                playsInline
                className="blindspot-video"
                src="/video-accueil-v02.mp4"
            />
            <div className="blindspot-video-mask" />

            <div className="blindspot-page-content">
                <section className="blindspot-search-shell">
                    <div className="space-y-6">
                        <span className="blindspot-chip">
                            Recherche manuelle / mode demo
                        </span>
                        <div className="space-y-4">
                            <h1 className="blindspot-title">
                                Colle un lien et ouvre l&apos;analyse en 7
                                pastilles.
                            </h1>
                            <p className="blindspot-lead">
                                Cette page sert de raccourci quand tu veux
                                tester BlindSpot sans passer par le partage
                                natif. Sur mobile, l&apos;usage ideal reste
                                l&apos;ouverture depuis une app ou un navigateur.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="blindspot-search-bar blindspot-glass-panel">
                            <Search className="ml-2 h-5 w-5 shrink-0 text-black/45" />
                            <input
                                type="url"
                                value={value}
                                onChange={(event) => setValue(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" && canSubmit) {
                                        navigateTo(value.trim());
                                    }
                                }}
                                placeholder="Colle ici un article, une video ou une URL de news"
                                className="blindspot-search-input"
                            />
                            {canSubmit && (
                                <button
                                    type="button"
                                    onClick={() => setValue("")}
                                    aria-label="Effacer l'URL"
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-black/55 transition hover:bg-black/5 hover:text-black">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                            <button
                                type="button"
                                className="blindspot-search-submit"
                                onClick={() => navigateTo(value.trim())}
                                disabled={!canSubmit}
                                aria-label="Lancer l'analyse">
                                <ArrowRight className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="blindspot-glass-panel rounded-[2rem] p-5 sm:p-6">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-black/50">
                                        Exemples
                                    </p>
                                    <p className="mt-1 text-sm text-black/65">
                                        Utilise un article de demo pour ouvrir
                                        directement l&apos;experience.
                                    </p>
                                </div>
                            </div>

                            <div className="blindspot-example-grid">
                                {inputExample.map((article) => (
                                    <button
                                        key={article.url}
                                        type="button"
                                        onClick={() => navigateTo(article.url)}
                                        className="blindspot-example-card blindspot-glass-panel">
                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                            {article.source}
                                        </p>
                                        <h2 className="mt-3 text-left text-lg font-semibold leading-snug text-black">
                                            {article.title}
                                        </h2>
                                        <p className="mt-4 text-sm leading-6 text-black/65">
                                            {article.authors.join(", ") || "Article exemple"}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
