import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold mb-4">Welcome to the App</h1>
            <p className="text-lg mb-8">
                This is the home page of your Next.js application.
            </p>
            <Button variant="default">Get Started</Button>
        </div>
    );
}
