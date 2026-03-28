import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import {
    articleSchema,
    entitySchema,
    mediaSchema,
    otherMediaArticleSchema,
    cognitiveBiasSchema,
    analysisResultSchema,
    articleToText
} from "../schemas/article";

// ── Parallel steps ─────────────────────────────────────────────────────────────

const extractEntitiesStep = createStep({
    id: "extract-entities",
    description:
        "Extrait les personnes et organisations mentionnées dans l'article",
    inputSchema: articleSchema,
    outputSchema: z.object({
        entities: z.array(entitySchema)
    }),
    execute: async ({ inputData, mastra }) => {
        const agent = mastra?.getAgent("entityAgent");
        if (!agent) throw new Error("entityAgent not found");
        const result = await agent.generate(articleToText(inputData), {
            structuredOutput: {
                schema: z.object({ entities: z.array(entitySchema) })
            }
        });
        return result.object;
    }
});

const summarizeStep = createStep({
    id: "summarize",
    description: "Produit un résumé de l'article",
    inputSchema: articleSchema,
    outputSchema: z.object({
        summary: z.string()
    }),
    execute: async ({ inputData, mastra }) => {
        const agent = mastra?.getAgent("summaryAgent");
        if (!agent) throw new Error("summaryAgent not found");
        const result = await agent.generate(articleToText(inputData), {
            structuredOutput: {
                schema: z.object({ summary: z.string() })
            }
        });
        return result.object;
    }
});

const extractKeywordsStep = createStep({
    id: "extract-keywords",
    description: "Extrait les mots-clefs de l'article",
    inputSchema: articleSchema,
    outputSchema: z.object({
        keywords: z.array(z.string())
    }),
    execute: async ({ inputData, mastra }) => {
        const agent = mastra?.getAgent("keywordsAgent");
        if (!agent) throw new Error("keywordsAgent not found");
        const result = await agent.generate(articleToText(inputData), {
            structuredOutput: {
                schema: z.object({ keywords: z.array(z.string()) })
            }
        });
        return result.object;
    }
});

const blindspotsStep = createStep({
    id: "blindspots",
    description: "Identifie les angles manquants de l'article",
    inputSchema: articleSchema,
    outputSchema: z.object({
        blindspots: z.array(z.string())
    }),
    execute: async ({ inputData, mastra }) => {
        const agent = mastra?.getAgent("blindspotsAgent");
        if (!agent) throw new Error("blindspotsAgent not found");
        const result = await agent.generate(articleToText(inputData), {
            structuredOutput: {
                schema: z.object({ blindspots: z.array(z.string()) })
            }
        });
        return result.object;
    }
});

const mediaResearchStep = createStep({
    id: "media-research",
    description:
        "Recherche le média source et ses conflits d'intérêts potentiels",
    inputSchema: articleSchema,
    outputSchema: mediaSchema,
    execute: async ({ inputData, mastra }) => {
        const agent = mastra?.getAgent("mediaAgent");
        if (!agent) throw new Error("mediaAgent not found");
        const prompt = `Média : "${inputData.source}"\nSujet de l'article : "${inputData.title}"\n\nRecherche ce média, son propriétaire et ses actionnaires, et identifie les conflits d'intérêts potentiels avec le sujet traité.`;
        const result = await agent.generate(prompt, {
            structuredOutput: { schema: mediaSchema }
        });
        return result.object;
    }
});

const otherMediaStep = createStep({
    id: "other-media",
    description:
        "Recherche des articles sur le même sujet dans d'autres médias",
    inputSchema: articleSchema,
    outputSchema: z.object({
        otherMedia: z.array(otherMediaArticleSchema)
    }),
    execute: async ({ inputData, mastra }) => {
        const agent = mastra?.getAgent("otherMediaAgent");
        if (!agent) throw new Error("otherMediaAgent not found");
        const prompt = `Sujet : "${inputData.title}"\n\nRecherche des articles en ligne traitant du même sujet, publiés par des médias différents de "${inputData.source}".`;
        const result = await agent.generate(prompt, {
            structuredOutput: {
                schema: z.object({
                    otherMedia: z.array(otherMediaArticleSchema)
                })
            }
        });
        return result.object;
    }
});

const cognitiveBiasStep = createStep({
    id: "cognitive-bias",
    description: "Détecte les biais cognitifs présents dans l'article",
    inputSchema: articleSchema,
    outputSchema: cognitiveBiasSchema,
    execute: async ({ inputData, mastra }) => {
        const agent = mastra?.getAgent("cognitiveBiasAgent");
        if (!agent) throw new Error("cognitiveBiasAgent not found");
        const result = await agent.generate(articleToText(inputData), {
            structuredOutput: { schema: cognitiveBiasSchema }
        });
        return result.object;
    }
});

// ── Aggregate step ─────────────────────────────────────────────────────────────

const aggregateStep = createStep({
    id: "aggregate",
    description: "Consolide les résultats de toutes les branches d'analyse",
    inputSchema: z.object({
        "extract-entities": z.object({ entities: z.array(entitySchema) }),
        summarize: z.object({ summary: z.string() }),
        "extract-keywords": z.object({ keywords: z.array(z.string()) }),
        blindspots: z.object({ blindspots: z.array(z.string()) }),
        "media-research": mediaSchema,
        "other-media": z.object({
            otherMedia: z.array(otherMediaArticleSchema)
        }),
        "cognitive-bias": cognitiveBiasSchema
    }),
    outputSchema: analysisResultSchema,
    execute: async ({ inputData }) => {
        return {
            entities: inputData["extract-entities"].entities,
            summary: inputData["summarize"].summary,
            keywords: inputData["extract-keywords"].keywords,
            blindspots: inputData["blindspots"].blindspots,
            media: inputData["media-research"],
            otherMedia: inputData["other-media"].otherMedia,
            cognitiveBias: inputData["cognitive-bias"]
        };
    }
});

// ── Workflow ───────────────────────────────────────────────────────────────────

export const fullArticleAnalysisWorkflow = createWorkflow({
    id: "full-article-analysis",
    description: "Full Article Analysis Workflow",
    inputSchema: articleSchema,
    outputSchema: analysisResultSchema
})
    .parallel([
        extractEntitiesStep,
        summarizeStep,
        extractKeywordsStep,
        blindspotsStep,
        mediaResearchStep,
        otherMediaStep,
        cognitiveBiasStep
    ])
    .then(aggregateStep)
    .commit();
