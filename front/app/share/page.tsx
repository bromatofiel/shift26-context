import { redirect } from "next/navigation";

type SharePageProps = {
    searchParams: Promise<{
        title?: string;
        text?: string;
        url?: string;
    }>;
};

export default async function SharePage({ searchParams }: SharePageProps) {
    const { title, text, url } = await searchParams;

    console.log("Received share data:", { url });
    console.log("Redirecting to results page with URL:", url);

    if (url) {
        redirect(`/results?url=${encodeURIComponent(url)}`);
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Contenu partage recu</h1>
            <p>Titre : {title ?? "-"}</p>
            <p>Lien : {url ?? "-"}</p>
            <p>Texte : {text ?? "-"}</p>
        </div>
    );
}
