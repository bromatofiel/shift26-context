type SharePageProps = {
    searchParams: Promise<{
        title?: string;
        text?: string;
        url?: string;
    }>;
};

export default async function SharePage({ searchParams }: SharePageProps) {
    const { title, text, url } = await searchParams;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Contenu partage recu</h1>
            <p>Titre : {title ?? "-"}</p>
            <p>Lien : {url ?? "-"}</p>
            <p>Texte : {text ?? "-"}</p>
        </div>
    );
}
