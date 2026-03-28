import { Agent } from "@mastra/core/agent";

export const keywordsAgent = new Agent({
    id: "keywords-agent",
    name: "Keywords Extraction Agent",
    instructions: `
Tu es un expert en indexation de contenu journalistique.
On te fournit le texte brut d'un article de presse.
Extrais les mots-clefs les plus significatifs et pertinents de l'article.
Limite-toi à 10 mots-clefs maximum.
Préfère les termes spécifiques et informatifs (noms propres, concepts techniques, secteurs) aux termes génériques.
    `.trim(),
    model: "openai/gpt-5.4"
});
