import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AnimatedCardContent from "@/components/custom/AnimatedCardContent";
import type { SynthesisPoint, WorkflowStatus } from "@/lib/types";

const severityStyles: Record<SynthesisPoint["severity"], string> = {
    green: "bg-green-100 text-green-800",
    orange: "bg-orange-100 text-orange-800",
    red: "bg-red-100 text-red-800"
};

export default function SynthesisCard({
    points,
    status,
    error
}: {
    points?: SynthesisPoint[];
    status: WorkflowStatus;
    error?: string | null;
}) {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-sm font-medium">Synthèse</CardTitle>
            </CardHeader>
            <CardContent>
                <AnimatedCardContent contentKey={status}>
                    {status === "idle" && (
                        <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-orange-400 animate-pulse" />
                            <p className="text-xs text-gray-400">
                                En attente des analyses…
                            </p>
                        </div>
                    )}
                    {status === "loading" && (
                        <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-blue-400 animate-pulse" />
                            <p className="text-xs text-gray-400">
                                Synthèse en cours…
                            </p>
                        </div>
                    )}
                    {status === "error" && (
                        <p className="text-xs text-red-500">{error}</p>
                    )}
                    {status === "success" && points && (
                        <div className="flex flex-col gap-2">
                            {points.map((point, i) => (
                                <span
                                    key={i}
                                    className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${severityStyles[point.severity]}`}>
                                    {point.label}
                                </span>
                            ))}
                        </div>
                    )}
                </AnimatedCardContent>
            </CardContent>
        </Card>
    );
}
