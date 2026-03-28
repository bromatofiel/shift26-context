import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { articleDataSchema } from "../schemas/article";

const extractArticleStep = createStep({
    id: "extract-article",
    description:
        "Fetches a news article URL and returns its structured content",
    inputSchema: z.object({ url: z.string() }),
    outputSchema: articleDataSchema,
    execute: async ({ inputData, mastra }) => {
        const agent = mastra?.getAgent("articleExtractorAgent");
        if (!agent) throw new Error("articleExtractorAgent not found");
        const result = await agent.generate(inputData.url, {
            structuredOutput: {
                schema: articleDataSchema
            }
        });
        return result.object;
    }
});

export const articleExtractorWorkflow = createWorkflow({
    id: "article-extractor",
    description:
        "Fetches a news article from a URL and returns structured content",
    inputSchema: z.object({ url: z.string() }),
    outputSchema: articleDataSchema
})
    .then(extractArticleStep)
    .commit();
