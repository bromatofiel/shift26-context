// Per 02-CONTEXT.md: Few-shot with 2-3 representative examples
// Per 02-CONTEXT.md: Detailed prompt with bias definitions and scoring criteria

export const BIAS_DEFINITIONS = `
## Definitions des biais

1. **Ton (tone)**: Langage emotionnel, sensationnaliste, ou oriente. Exemple: "scandaleusement", "enfin!", adjectifs charges.

2. **Cadrage (framing)**: Selection et ordre des faits qui orientent l'interpretation. Exemple: commencer par les critiques avant les arguments, ou l'inverse.

3. **Omission (omission)**: Faits pertinents absents qui changeraient la comprehension. Exemple: ne pas mentionner le contexte historique, ignorer une partie des acteurs.

4. **Selection de sources (source_selection)**: Desequilibre dans les voix citees. Exemple: 5 experts d'un bord, 1 de l'autre.

## Echelle de score (0-10)

- **0-3 (green)**: Factuel, equilibre, sources variees, contexte complet
- **4-6 (orange)**: Cadrage perceptible, quelques omissions, ton parfois oriente
- **7-10 (red)**: Cadrage fort, omissions significatives, ton militant ou sensationnaliste
`;

export const SCORING_CRITERIA = `
## Criteres de scoring

Pour chaque signal detecte, evaluer la severite:
- **low**: Subtil, n'affecte pas significativement la comprehension
- **medium**: Notable, influence l'interpretation du lecteur
- **high**: Flagrant, deforme substantiellement la realite

Le score global (0-10) est une synthese:
- Nombre de signaux
- Severite moyenne
- Impact sur la comprehension globale

La confiance (0-1) reflete:
- Clarte des signaux (0.8+ si evidents)
- Difficulte de l'analyse (0.5-0.7 si ambigu)
`;

// Few-shot examples per 02-CONTEXT.md
export const FEW_SHOT_EXAMPLES = [
  {
    role: 'user',
    content: `Article: "Le gouvernement annonce une reforme des retraites. Le ministre a presente les details lors d'une conference de presse. Les syndicats ont exprime leur opposition. Les economistes sont divises sur l'impact."`
  },
  {
    role: 'model',
    content: JSON.stringify({
      bias_score: { score: 2, color: 'green', confidence: 0.85 },
      main_signals: [
        { type: 'tone', description: 'Langage neutre et factuel tout au long de l article', severity: 'low' }
      ],
      counter_perspectives: [
        { title: 'Reforme des retraites: le point de vue des syndicats', source: 'L Humanite', url: 'https://humanite.fr/reforme', key_differences: ['Focus sur impact social', 'Temoignages de travailleurs'] },
        { title: 'Retraites: pourquoi la reforme est necessaire', source: 'Les Echos', url: 'https://lesechos.fr/retraites', key_differences: ['Analyse economique detaillee', 'Comparaisons internationales'] }
      ],
      global_context: {
        summary: 'Article equilibre presentant les positions des differentes parties sans prendre parti explicitement.',
        missing_angles: ['Impact sur les femmes', 'Situation des carrieres longues']
      }
    }, null, 2)
  },
  {
    role: 'user',
    content: `Article: "SCANDALE: Le gouvernement impose sa reforme des retraites! Malgre la colere legitime de millions de Francais, le pouvoir reste sourd. Les experts independants denoncent unanimement ce passage en force anti-democratique."`
  },
  {
    role: 'model',
    content: JSON.stringify({
      bias_score: { score: 8, color: 'red', confidence: 0.9 },
      main_signals: [
        { type: 'tone', description: 'Vocabulaire sensationnaliste: SCANDALE, colere legitime, sourd, passage en force', severity: 'high' },
        { type: 'framing', description: 'Presentation unilaterale opposant le peuple au pouvoir', severity: 'high' },
        { type: 'source_selection', description: 'Seuls les experts critiques sont cites, sans nuance', severity: 'medium' },
        { type: 'omission', description: 'Aucune mention des arguments en faveur de la reforme', severity: 'high' }
      ],
      counter_perspectives: [
        { title: 'Reforme des retraites: comprendre les enjeux', source: 'Le Monde', url: 'https://lemonde.fr/retraites-enjeux', key_differences: ['Presentation factuelle', 'Arguments des deux camps'] },
        { title: 'Ce que prevoit vraiment la reforme', source: 'France Info', url: 'https://franceinfo.fr/reforme-details', key_differences: ['Details techniques', 'Impact chiffre par categorie'] }
      ],
      global_context: {
        summary: 'Article fortement oriente qui presente la reforme uniquement sous l angle de l opposition, avec un ton militant et des generalisations abusives.',
        missing_angles: ['Arguments economiques de la reforme', 'Position des partenaires sociaux moderes', 'Comparaisons avec systemes europeens']
      }
    }, null, 2)
  }
];

export const BIAS_ANALYSIS_PROMPT = `
Tu es un analyste de medias expert en detection de biais journalistiques. Tu analyses les articles en francais.

${BIAS_DEFINITIONS}

${SCORING_CRITERIA}

## Instructions

Analyse l'article fourni et produis une evaluation structuree:
1. Score de biais (0-10) avec couleur et confiance
2. Signaux principaux detectes (1-5 signaux)
3. 2-3 contre-perspectives depuis des sources differentes (recherche web)
4. Contexte global avec angles manquants

Sois factuel et argumente. Cite des elements precis de l'article pour justifier chaque signal.
`;

export const SYSTEM_INSTRUCTION = `${BIAS_ANALYSIS_PROMPT}

Tu reponds UNIQUEMENT avec un objet JSON valide suivant le schema fourni. Pas de texte avant ou apres le JSON.`;
