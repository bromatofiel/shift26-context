import {
    User,
    Building2,
    Newspaper,
    Flag,
    Radio,
    Landmark,
    HelpCircle,
    Star,
    type LucideIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Entity } from "@/lib/types";
import AnimatedCardContent from "@/components/custom/AnimatedCardContent";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
    "Personnalité politique": Star,
    Journaliste: Newspaper,
    "Parti politique": Flag,
    Média: Radio,
    "Institution publique": Landmark,
    Institution: Landmark
};

function EntityRow({ entity }: { entity: Entity }) {
    const CategoryIcon = entity.category
        ? (CATEGORY_ICONS[entity.category] ?? HelpCircle)
        : HelpCircle;

    return (
        <div className="flex items-center gap-2 py-1.5">
            <CategoryIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-sm font-medium text-gray-800 truncate">
                {entity.name}
            </span>
            {entity.category && (
                <span className="ml-auto text-xs text-gray-400 shrink-0 pl-2">
                    {entity.category}
                </span>
            )}
        </div>
    );
}

function EntityGroup({
    icon: Icon,
    label,
    entities
}: {
    icon: LucideIcon;
    label: string;
    entities: Entity[];
}) {
    if (entities.length === 0) return null;
    return (
        <div className="mb-6 last:mb-0">
            <div className="flex items-center gap-1.5 mb-2">
                <Icon className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {label}
                </span>
            </div>
            <div className="divide-y divide-gray-100">
                {entities.map((e) => (
                    <EntityRow key={e.name} entity={e} />
                ))}
            </div>
        </div>
    );
}

export default function EntitiesCard({
    entities,
    status,
    error
}: {
    entities?: Entity[];
    status: "idle" | "loading" | "success" | "error";
    error?: string | null;
}) {
    const persons =
        entities
            ?.filter((e) => e.type === "person")
            .sort(
                (a, b) =>
                    (a.category ?? "").localeCompare(b.category ?? "") ||
                    a.name.localeCompare(b.name)
            ) ?? [];
    const orgs =
        entities
            ?.filter((e) => e.type === "organization")
            .sort(
                (a, b) =>
                    (a.category ?? "").localeCompare(b.category ?? "") ||
                    a.name.localeCompare(b.name)
            ) ?? [];

    return (
        <Card className="sm:col-span-2">
            <CardHeader>
                <CardTitle className="text-sm font-medium">Entités</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[300px] overflow-y-auto">
                <AnimatedCardContent contentKey={status}>
                    {status === "idle" && (
                        <p className="text-xs text-gray-400">En attente…</p>
                    )}
                    {status === "loading" && (
                        <p className="text-xs text-gray-400 animate-pulse">
                            Chargement…
                        </p>
                    )}
                    {status === "error" && (
                        <p className="text-xs text-red-500">{error}</p>
                    )}
                    {status === "success" && entities && (
                        <>
                            <EntityGroup
                                icon={User}
                                label="Personnes"
                                entities={persons}
                            />
                            <EntityGroup
                                icon={Building2}
                                label="Organisations"
                                entities={orgs}
                            />
                        </>
                    )}
                </AnimatedCardContent>
            </CardContent>
        </Card>
    );
}
