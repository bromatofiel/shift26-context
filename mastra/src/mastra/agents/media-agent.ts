import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";

export const mediaAgent = new Agent({
    id: "media-agent",
    name: "Media Research Agent",
    instructions: `
Tu es un expert en analyse des médias et de leurs liens d'intérêts.
On te fournit le nom d'un média et le sujet d'un article qu'il a publié.
Ne pas dépasser plus de 10 phrases dans ta réponse.
Utilise ton outil de recherche web pour identifier :
- la structure de propriété du média (groupe, actionnaires principaux)
- les sources de financement (publicité, abonnements, subventions, investisseurs)
- les éventuels conflits d'intérêts entre le groupe propriétaire et le sujet traité dans l'article
Sois factuel et cite des éléments concrets. Si aucun conflit évident n'est identifié, mentionne-le explicitement.
    `.trim(),
    model: "openai/gpt-5.4",
    tools: {
        webSearch: openai.tools.webSearch()
    }
});
