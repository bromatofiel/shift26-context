import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import {
    Observability,
    DefaultExporter,
    CloudExporter,
    SensitiveDataFilter
} from "@mastra/observability";
import { weatherWorkflow } from "./workflows/weather-workflow";
import { articleAnalysisWorkflow } from "./workflows/article-analysis-workflow";
import { weatherAgent } from "./agents/weather-agent";
import { articleAgent } from "./agents/article-agent";
import { entityAgent } from "./agents/entity-agent";
import { summaryAgent } from "./agents/summary-agent";
import { keywordsAgent } from "./agents/keywords-agent";
import { blindspotsAgent } from "./agents/blindspots-agent";
import { mediaAgent } from "./agents/media-agent";
import { otherMediaAgent } from "./agents/other-media";
import {
    toolCallAppropriatenessScorer,
    completenessScorer,
    translationScorer
} from "./scorers/weather-scorer";

export const mastra = new Mastra({
    workflows: { weatherWorkflow, articleAnalysisWorkflow },
    agents: {
        weatherAgent,
        articleAgent,
        entityAgent,
        summaryAgent,
        keywordsAgent,
        blindspotsAgent,
        mediaAgent,
        otherMediaAgent
    },
    scorers: {
        toolCallAppropriatenessScorer,
        completenessScorer,
        translationScorer
    },
    storage: new LibSQLStore({
        id: "mastra-storage",
        // stores observability, scores, ... into persistent file storage
        url: "file:./mastra.db"
    }),
    logger: new PinoLogger({
        name: "Mastra",
        level: "info"
    }),
    observability: new Observability({
        configs: {
            default: {
                serviceName: "mastra",
                exporters: [
                    new DefaultExporter(), // Persists traces to storage for Mastra Studio
                    new CloudExporter() // Sends traces to Mastra Cloud (if MASTRA_CLOUD_ACCESS_TOKEN is set)
                ],
                spanOutputProcessors: [
                    new SensitiveDataFilter() // Redacts sensitive data like passwords, tokens, keys
                ]
            }
        }
    })
});
