import { z } from "zod";

export const articleSchema = z.object({
    source: z.string(),
    title: z.string(),
    authors: z.array(z.string()),
    sections: z.array(
        z.object({
            heading: z.string().optional(),
            paragraphs: z.array(z.string())
        })
    )
});

export const articleDataSchema = articleSchema.extend({
    url: z.string()
});

export const entitySchema = z.object({
    name: z.string(),
    type: z.enum(["person", "organization"]),
    category: z
        .string()
        .describe(
            "Ex: Personnalité politique, Entreprise tech, Parti politique, Média, Institution, Investisseur, Inconnue…"
        )
});

export const mediaSchema = z.object({
    mediaName: z.string(),
    description: z.string(),
    conflicts: z.array(z.string())
});

export const otherMediaArticleSchema = z.object({
    title: z.string(),
    media: z.string(),
    url: z.string()
});

export const biasFamilyEnum = z.enum([
    "selection_faits",
    "cadrage_lexical",
    "causalite_fragile",
    "usage_chiffres",
    "structure_recit",
    "qualite_argumentative"
]);

export const biasSignalSchema = z.object({
    family: biasFamilyEnum,
    bias: z
        .string()
        .describe(
            "Nom du biais détecté, ex: survivorship, monocausalité, ancrage…"
        ),
    confidence: z.enum(["low", "medium", "high"]),
    excerpt: z
        .string()
        .optional()
        .describe("Extrait de l'article illustrant le biais"),
    explanation: z
        .string()
        .describe("Explication factuelle et constructive du biais détecté")
});

export const cognitiveBiasSchema = z.object({
    signals: z.array(biasSignalSchema),
    globalScore: z
        .number()
        .min(0)
        .max(100)
        .describe(
            "Score de biais global de 0 (aucun biais notable) à 100 (biais majeurs multiples)"
        ),
    summary: z
        .string()
        .describe(
            "Synthèse globale de la qualité argumentative et des principaux biais détectés"
        )
});

export const synthesisPointSchema = z.object({
    label: z.string().describe("Point clé en 12 mots maximum"),
    severity: z
        .enum(["green", "orange", "red"])
        .describe(
            "green = élément positif, orange = risque modéré, red = biais fort ou conflit critique"
        )
});

export const synthesisResultSchema = z.object({
    points: z
        .array(synthesisPointSchema)
        .max(3)
        .describe(
            "1 à 3 points de synthèse, les plus importants pour le lecteur"
        )
});

export const analysisResultSchema = z.object({
    entities: z.array(entitySchema),
    summary: z.string(),
    keywords: z.array(z.string()),
    blindspots: z.array(z.string()),
    media: mediaSchema,
    otherMedia: z.array(otherMediaArticleSchema),
    cognitiveBias: cognitiveBiasSchema,
    synthesis: synthesisResultSchema.optional()
});

export function articleToText(article: z.infer<typeof articleSchema>): string {
    const parts: string[] = [
        `Titre : ${article.title}`,
        `Auteurs : ${article.authors.join(", ") || "Non précisé"}`,
        `Source : ${article.source}`,
        ""
    ];
    for (const section of article.sections) {
        if (section.heading) parts.push(`## ${section.heading}`);
        parts.push(...section.paragraphs);
        parts.push("");
    }
    return parts.join("\n");
}
