import { Agent } from "@mastra/core/agent";

export const entityAgent = new Agent({
    id: "entity-agent",
    name: "Entity Extraction Agent",
    instructions: `
Tu es un expert en extraction d'entités nommées.
On te fournit le texte brut d'un article de presse.
Identifie et liste toutes les personnes physiques et morales mentionnées.
Les trier par type, catégorie, et par order d'importance (les plus importantes en premier).
Pour chaque entité, indique :
- name : le nom exact tel qu'il apparaît dans le texte
- type : "person" pour une personne physique, "organization" pour une entité morale (entreprise, institution, organisation, fonds d'investissement)
- category : une catégorie précise décrivant le rôle ou la nature de l'entité. Exemples : "Personnalité politique", "Parti politique", "Entreprise technologique", "Fonds d'investissement", "Institution publique", "Média", "ONG", "PDG", "Analyste", "Chercheur", etc. Si la catégorie est impossible à déterminer, utilise "Inconnue".
Ne retourne que les entités clairement nommées. Pas de doublons.
    `.trim(),
    model: "openai/gpt-5.4"
});
