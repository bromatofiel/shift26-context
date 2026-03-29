import Link from "next/link";

export default function Home() {
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
                <div className="blindspot-home-grid lg:grid-cols-[1.2fr_0.8fr]">
                    <section className="flex min-h-[70vh] flex-col justify-center gap-6">
                        <span className="blindspot-chip">
                            PWA Android via partage natif
                        </span>
                        <h1 className="blindspot-title">
                            Installe BlindSpot, puis partage ce que tu veux
                            vraiment comprendre.
                        </h1>
                        <p className="blindspot-lead">
                            BlindSpot n&apos;est pas une app qu&apos;on ouvre pour
                            chercher de l&apos;info. Elle s&apos;active au moment
                            ou tu tombes sur un article, une video ou un contenu
                            qui merite plus de contexte.
                        </p>
                        <div className="blindspot-actions">
                            <Link
                                href="/search"
                                className="blindspot-button blindspot-button-primary">
                                Tester avec une URL
                            </Link>
                            <a
                                href="#installation"
                                className="blindspot-button blindspot-button-secondary">
                                Voir l&apos;installation
                            </a>
                        </div>
                    </section>

                    <aside
                        id="installation"
                        className="blindspot-glass-panel blindspot-step-card self-center">
                        <div className="mb-6 space-y-2">
                            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-black/55">
                                Comment ca marche
                            </p>
                            <h2 className="text-2xl font-semibold text-black">
                                Le bon geste d&apos;usage
                            </h2>
                            <p className="text-sm leading-7 text-black/70">
                                L&apos;experience cible est mobile. On installe la
                                PWA, puis on envoie vers BlindSpot un contenu
                                depuis le menu de partage du navigateur ou d&apos;une
                                app sociale.
                            </p>
                        </div>

                        <div className="blindspot-step-list">
                            <div className="blindspot-glass-panel blindspot-step-card">
                                <span className="blindspot-step-index">01</span>
                                <h3 className="mt-4 text-lg font-semibold text-black">
                                    Installer la web app
                                </h3>
                                <p className="mt-2 text-sm leading-7 text-black/70">
                                    Depuis Android, ouvre BlindSpot dans le
                                    navigateur puis choisis &quot;Ajouter a
                                    l&apos;ecran d&apos;accueil&quot;.
                                </p>
                            </div>
                            <div className="blindspot-glass-panel blindspot-step-card">
                                <span className="blindspot-step-index">02</span>
                                <h3 className="mt-4 text-lg font-semibold text-black">
                                    Partager un contenu
                                </h3>
                                <p className="mt-2 text-sm leading-7 text-black/70">
                                    Depuis un article, YouTube, Google News ou
                                    un lien recu, utilise la feuille de partage
                                    et choisis BlindSpot.
                                </p>
                            </div>
                            <div className="blindspot-glass-panel blindspot-step-card">
                                <span className="blindspot-step-index">03</span>
                                <h3 className="mt-4 text-lg font-semibold text-black">
                                    Lire les 7 couches d&apos;analyse
                                </h3>
                                <p className="mt-2 text-sm leading-7 text-black/70">
                                    Tu recuperes une vue synthese, les biais
                                    detectes, les angles manquants, les autres
                                    medias et les acteurs cites.
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
