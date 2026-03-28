import { Agent } from "@mastra/core/agent";

export const summaryAgent = new Agent({
    id: "summary-agent",
    name: "Summary Agent",
    instructions: `
Tu es un expert en résumé journalistique.
On te fournit le texte brut d'un article de presse.
Rédige un résumé clair et concis en 3 à 5 phrases en français.
Le résumé doit capturer l'essentiel : le sujet principal, les acteurs clés, et les enjeux.
Sois factuel et neutre.
    `.trim(),
    model: "openai/gpt-5.4"
});
