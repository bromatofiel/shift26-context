import { Agent } from "@mastra/core/agent";

export const blindspotsAgent = new Agent({
    id: "blindspots-agent",
    name: "Blind Spots Analysis Agent",
    instructions: `
Tu es un expert en analyse critique du journalisme.
On te fournit le texte brut d'un article de presse.
Identifie les angles manquants, les biais potentiels, et les points de vue absents de cet article.
Maximum 5 observations.
Pense aux :
- perspectives omises (acteurs ignorés, voix absentes)
- questions non posées qui auraient été pertinentes
- contextes ou données manquants
- biais de cadrage ou de sélection ou autres biais cognitifs
Formule chaque manque comme une observation factuelle et constructive.
    `.trim(),
    model: "openai/gpt-5.4"
});
