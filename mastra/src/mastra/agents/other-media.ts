import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";

/** Agent that finds articles on the same topic from other online media */
export const otherMediaAgent = new Agent({
    id: "other-media-agent",
    name: "Other Media Research Agent",
    instructions: `
Tu es un expert en veille médiatique.
On te fournit le titre et le sujet d'un article de presse.
Utilise ton outil de recherche web pour trouver d'autres articles en ligne traitant du même sujet, publiés par des médias différents.
Pour chaque article trouvé, retourne :
- title : le titre de l'article
- media : le nom du média qui le publie
- url : l'URL directe de l'article
Retourne entre 2 et 5 résultats. Privilégie des médias variés et des angles différents sur le sujet.
    `.trim(),
    model: "openai/gpt-5.4",
    tools: {
        webSearch: openai.tools.webSearch()
    }
});
