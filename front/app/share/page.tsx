import { redirect } from "next/navigation";

type SharePageProps = {
    searchParams: Promise<{
        title?: string;
        text?: string;
        url?: string;
    }>;
};

export default async function SharePage({ searchParams }: SharePageProps) {
    const { url } = await searchParams;

    console.log("Received share data:", { url });
    console.log("Redirecting to results page with URL:", url);

    if (url) {
        redirect(`/results?url=${encodeURIComponent(url)}`);
    }

    redirect("/");
}
