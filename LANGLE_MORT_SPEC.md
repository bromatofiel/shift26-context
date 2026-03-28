# Blind Spot

## Document de cadrage produit, IA et technique

Version: `0.1`
Date: `2026-03-28`
Mode: `Hackathon 48h`

---

## 1. Vision

`Blind Spot` est une application mobile de contexte augmenté.

Son usage est simple:

1. L'utilisateur lit un article.
2. Il clique sur `Partager`.
3. Il choisit `Blind Spot`.
4. En moins de `5 secondes`, l'application affiche:
   - un indicateur simple `Vert / Orange / Rouge`
   - ce que l'article couvre bien
   - ce qui manque ou diffère
   - `2 à 3` perspectives contradictoires ou complémentaires

Le système ne dit jamais qu'un article est "vrai" ou "faux". Il produit un `indice de cadrage` et des `angles complémentaires`.

---

## 2. Contraintes critiques

- `Stateless`: aucun stockage lourd d'article, tout est traité à la volée.
- `Rapide`: premier écran utile en moins de `3 secondes`, résultat complet cible en moins de `5 secondes`.
- `Simple`: UI compréhensible par un enfant de `10 ans`.
- `Lisible`: code couleur unique `Vert / Orange / Rouge`.
- `Faisable`: stack légère, coûts faibles, déploiement direct.
- `Crédible`: l'IA doit rester prudente et explicable.

---

## 3. Brainstorming synchronisé des agents

### Agent 1: Product Owner

#### 3 cas d'usage majeurs

1. `Curiosité`
   L'utilisateur veut savoir rapidement si l'article qu'il lit montre tout le sujet ou seulement un angle.

2. `Fact-checking`
   L'utilisateur veut comparer un article avec d'autres médias pour repérer ce qui est confirmé, nuancé ou absent.

3. `Alerte Biais`
   L'utilisateur sent qu'un article est très orienté et veut immédiatement voir des lectures opposées ou plus complètes.

#### Parcours utilisateur cible en moins de 5 secondes

1. L'utilisateur ouvre un article dans Safari, Chrome, X, WhatsApp ou une app média.
2. Il choisit `Partager > L'Angle Mort`.
3. L'app affiche un écran de chargement ultra-simple:
   - `Analyse de l'article`
   - `Recherche d'autres angles`
   - `Synthèse en cours`
4. L'écran résultat s'affiche avec:
   - une couleur dominante
   - une phrase courte d'explication
   - `2 à 3` cartes "Autres angles"
5. Un tap sur une carte ouvre le lien source ou une vue résumée.

#### User stories prioritaires

1. En tant qu'utilisateur, je veux partager un lien vers l'app en un geste, pour éviter tout copier-coller.
2. En tant qu'utilisateur, je veux un verdict visuel immédiat, pour comprendre le résultat sans lire une longue analyse.
3. En tant qu'utilisateur, je veux savoir pourquoi un score est affiché, pour faire confiance au système.
4. En tant qu'utilisateur, je veux voir des perspectives alternatives proches du sujet, pour comparer vite.
5. En tant qu'utilisateur, je veux qu'on me signale les points manquants, pour repérer une couverture incomplète.
6. En tant qu'utilisateur, je veux que l'analyse reste rapide sur mobile, pour ne pas casser ma lecture.
7. En tant qu'utilisateur, je veux un message simple si l'article n'est pas analysable, pour comprendre la limite.
8. En tant qu'utilisateur, je veux un langage non technique, pour comprendre sans culture média.
9. En tant qu'utilisateur, je veux pouvoir ouvrir les sources proposées, pour vérifier moi-même.
10. En tant qu'utilisateur, je veux pouvoir relancer une analyse, pour comparer un autre lien rapidement.

#### Product backlog

`MVP`

- Réception d'URL via `share intent` ou `deep link`
- Extraction de texte d'article
- Recherche de sources alternatives
- Analyse LLM structurée
- Score `Vert / Orange / Rouge`
- `2 à 3` contre-perspectives
- Résumé global en `3 phrases max`
- Gestion des erreurs et du mode dégradé

`Nice-to-have`

- Historique local récent
- Mode `simple` / `expert`
- Favoris
- Personnalisation des médias
- Comparaison de plusieurs articles sur un même sujet
- Partage du résultat

#### KPIs de succès

- `P80 temps jusqu'au résultat complet < 5s`
- `Temps jusqu'au premier écran utile < 3s`
- `Taux de compréhension du code couleur > 85%`
- `CTR sur une perspective alternative > 40%`
- `Pertinence perçue des sources >= 4/5`
- `Taux d'articles analysables > 90%`
- `Taux d'abandon avant résultat < 10%`

#### Risques UX

- Le score couleur peut être perçu comme un verdict absolu.
- Trop de texte tue l'effet instantané.
- Des perspectives non pertinentes détruisent la confiance.
- Au-delà de `5s`, l'usage perd son caractère magique.

### Agent 2: Solution Architect / CTO

#### Stack recommandée

- `Mobile`: `Flutter`
- `Backend`: `FastAPI`
- `Extraction`: `httpx + trafilatura`, fallback `readability-lxml`
- `Search`: `Serper`
- `LLM`: `Gemini Flash`
- `Analytics`: `Firebase Analytics + Crashlytics`
- `Hosting backend`: `Railway`
- `Landing / démo web`: `Vercel`

#### Pourquoi cette stack

- `Flutter` permet une UI mobile propre et cohérente sur iOS et Android avec un seul codebase.
- `FastAPI` est le meilleur compromis pour livrer vite une API propre et testable.
- `Serper` évite de construire un moteur de recherche et répond vite.
- `trafilatura` retire une grande partie du bruit HTML sans navigateur headless.
- `Gemini Flash` est adapté à un traitement rapide avec sortie structurée JSON.
- `Railway` et `Vercel` réduisent fortement la friction de déploiement.

#### Architecture logique

```text
Article partagé
  -> Share Intent / Deep Link mobile
  -> App Flutter
  -> POST /v1/analyze
  -> Backend FastAPI
      -> Fetch URL
      -> Extract article
      -> Search alternatives via Serper
      -> Build analysis prompt
      -> Gemini Flash
      -> Validate JSON
  -> App mobile
  -> Affichage résultat Vert/Orange/Rouge + cartes alternatives
```

#### Workflow technique détaillé

##### Ingestion

- Android: `Share Intent`
- iOS: `Share Extension` ou `Universal Link` selon le temps disponible
- Fallback MVP: ouverture de lien dans l'app via `deep link`

##### Scraping

- Faire un `GET` HTTP classique
- Extraire le contenu principal avec `trafilatura`
- Fallback `readability-lxml` si extraction vide
- Ne pas utiliser de navigateur headless en MVP
- Si paywall ou page cassée:
  - basculer sur `titre + snippets search + metadata`
  - marquer le résultat comme `partial`

##### Search

La recherche doit produire des angles proches, pas juste des articles sur le même mot-clé.

Requêtes types:

- `"<titre exact de l'article>"`
- `"<sujet principal>" "<entité principale>" actualité`
- `"<événement>" site:lemonde.fr OR site:lefigaro.fr OR site:liberation.fr OR site:francetvinfo.fr`
- `"<titre simplifié>" analyse OR réaction OR contexte`

Règles:

- Limiter à `2 à 4` requêtes
- Dédupliquer les domaines
- Garder `2 à 3` résultats finaux maximum
- Prioriser les résultats récents, proches sémantiquement, exploitables sans paywall dur

#### Risques techniques et contournements

- `Paywalls`: mode dégradé basé sur titre et snippets
- `Latence`: extraction et search en parallèle
- `JSON cassé`: validation stricte + second essai court
- `Sources faibles`: whitelist médias ou score simple de crédibilité
- `iOS Share Extension`: à déprioriser si elle ralentit la livraison

### Agent 3: Lead Media Analyst

#### Définition opérationnelle du biais

Dans `Blind Spot`, le biais n'est ni un mensonge ni une orientation politique. C'est un `écart de cadrage`.

Il peut venir de:

- la sélection des faits
- l'ordre de présentation
- le lexique utilisé
- la diversité des sources
- l'absence de contexte
- l'absence de contrepoint

Le système mesure donc un `indice de partialité journalistique`, pas une vérité.

#### Taxonomie simple des signaux

1. `Angle / cadrage`
   Quel point de vue domine ?

2. `Sélection des faits`
   Quels faits sont montrés et lesquels sont absents ?

3. `Sources et attribution`
   Les affirmations sont-elles attribuées clairement ?

4. `Ton / lexique`
   Le vocabulaire est-il neutre, prudent, dramatique, valorisant ou accusatoire ?

5. `Équilibre des points de vue`
   Un contrepoint crédible est-il présent ?

6. `Contexte et temporalité`
   L'article situe-t-il l'événement dans un cadre plus large ?

7. `Causalité et certitude`
   Le texte distingue-t-il faits, hypothèses et interprétations ?

8. `Chiffres et comparaisons`
   Les chiffres sont-ils datés, sourcés et bien contextualisés ?

#### Comment identifier une omission

Une omission ne doit être signalée que si elle est:

- présente dans au moins une source alternative crédible
- ou attendue structurellement pour ce sujet
- et absente du texte source

Catégories:

- `omission probable`
- `contexte manquant`
- `hors périmètre`
- `non vérifiable`

Le système ne doit jamais:

- inventer une intention
- accuser un média de mentir
- conclure sans corroboration minimale

#### Méthode de comparaison

1. `Normaliser`
   Extraire titre, média, date, sujet, entités, lieu, événement.

2. `Cartographier`
   Lister les faits, acteurs, chiffres, citations et thèse implicite.

3. `Comparer`
   Repérer ce que la source couvre et ce que les autres sources ajoutent, nuancent ou contestent.

4. `Conclure prudemment`
   Employer des formulations comme `plus complet`, `plus critique`, `plus contextualisé`, `contexte insuffisant`.

#### Barème Vert / Orange / Rouge

Score total sur `10` à partir de `5` dimensions notées `0 à 2`:

- diversité des sources
- neutralité du ton
- présence du contrepoint
- contexte manquant
- solidité des attributions

Interprétation:

- `Vert = 0 à 2`
  Peu de signaux de cadrage fort.

- `Orange = 3 à 5`
  Couverture partielle ou contexte incomplet.

- `Rouge = 6 à 10`
  Cadrage marqué, sources unilatérales ou omission importante.

Règle non négociable:

- `Rouge` ne veut jamais dire `faux`.

### Agent 4: Tech Lead / DEV

#### Endpoints MVP

##### `GET /health`

Rôle: vérifier que l'API répond.

Réponse:

```json
{
  "status": "ok",
  "version": "0.1.0",
  "uptime_ms": 12345
}
```

##### `POST /v1/analyze`

Rôle: pipeline principal.

Request:

```json
{
  "url": "https://example.com/article",
  "locale": "fr-FR",
  "source_app": "browser_share",
  "timeout_ms": 4500
}
```

Response:

```json
{
  "request_id": "uuid",
  "status": "ok",
  "source_article": {
    "title": "string",
    "media": "string",
    "published_at": "string|null",
    "bias": {
      "score": 4,
      "color": "orange",
      "main_signals": [
        "peu de contrepoint",
        "contexte chiffré limité",
        "ton légèrement orienté"
      ]
    },
    "tone": "plutôt descriptif mais incomplet",
    "coverage": [
      "annonce",
      "déclarations officielles",
      "mesures principales"
    ],
    "limits": [
      "impact social peu traité",
      "historique absent"
    ]
  },
  "counter_perspectives": [
    {
      "media": "Le Monde",
      "url": "https://example.com/alt-1",
      "stance": "plus contextualisé",
      "missing_fact": "la source originale ne détaille pas le contexte budgétaire",
      "why_relevant": "ajoute l'historique et les chiffres"
    },
    {
      "media": "France Info",
      "url": "https://example.com/alt-2",
      "stance": "plus contradictoire",
      "missing_fact": "la source originale ne donne pas la réaction des opposants",
      "why_relevant": "ajoute un contrepoint direct"
    }
  ],
  "global_context": "L'article source couvre surtout l'annonce principale. Les autres médias ajoutent un contexte chiffré et des objections absentes. Le sujet semble traité, mais avec un cadrage incomplet.",
  "confidence": {
    "level": "medium",
    "reason": "plusieurs sources convergent, mais certaines informations restent partielles"
  },
  "timings_ms": {
    "fetch": 800,
    "search": 1200,
    "llm": 1500,
    "total": 3900
  }
}
```

##### `POST /v1/analyze/preview`

Rôle: variante courte si le temps de calcul doit rester sous `3s`.

Usage:

- moins de résultats search
- prompt plus court
- message: `première lecture`

##### `GET /v1/config`

Rôle: pousser de petits paramètres à l'app:

- couleurs UI
- microcopy
- feature flags

#### Modèle d'erreur

```json
{
  "request_id": "uuid",
  "status": "error",
  "code": "FETCH_FAILED",
  "message": "Impossible d'analyser cet article pour le moment.",
  "retryable": true
}
```

Codes prévus:

- `FETCH_FAILED`
- `PAYWALL`
- `TIMEOUT`
- `NO_ARTICLE`
- `SEARCH_EMPTY`
- `LLM_INVALID_JSON`

#### Pipeline backend minimal

1. Valider et normaliser l'URL
2. Suivre les redirections
3. Télécharger le HTML
4. Extraire le contenu principal
5. En parallèle, lancer la recherche d'articles alternatifs
6. Filtrer et dédupliquer les résultats
7. Construire le prompt JSON
8. Interroger le LLM
9. Valider la sortie selon le schéma attendu
10. Retourner le JSON au mobile

#### Intégration mobile

##### Flutter

- package de lien profond
- point d'entrée `share intent`
- écran de chargement
- écran résultat simple avec:
  - badge couleur
  - `Pourquoi ?`
  - `Autres angles`

Flux UI:

1. Réception du lien
2. Appel API
3. Loader
4. Résultat
5. Ouverture source alternative

##### React Native

Option acceptable seulement si l'équipe maîtrise déjà le stack.

Sinon, `Flutter` reste le meilleur choix pour tenir `48h`.

---

## 4. Cahier des charges consolidé

### Proposition de valeur

Permettre à n'importe qui de vérifier en quelques secondes si un article:

- est globalement équilibré
- oublie un contexte important
- privilégie un angle fort
- mérite d'être comparé à d'autres sources

### Fonctionnalités prioritaires MVP

1. Réception de lien partagé
2. Extraction propre de l'article
3. Recherche de perspectives proches
4. Analyse structurée par LLM
5. Affichage d'un score couleur
6. Explication courte du score
7. `2 à 3` liens alternatifs
8. Gestion des erreurs et du mode partiel

### Cas d'usage majeurs

1. `Curiosité`
2. `Fact-checking`
3. `Alerte Biais`

---

## 5. Workflow technique consolidé

### Vue d'ensemble

```text
Utilisateur partage un article
  -> App mobile capture l'URL
  -> Backend récupère le contenu
  -> Backend cherche 2 à 4 résultats comparables
  -> LLM compare source et alternatives
  -> JSON normalisé
  -> App affiche score + explication + liens utiles
```

### Stratégie d'extraction propre

- préférer une extraction HTML simple
- éviter les navigateurs headless en MVP
- retirer menus, footers, pop-ups et bloc cookie via extraction de contenu principal
- fallback vers snippets de recherche si le texte n'est pas récupérable

### Logique de search

Objectif: trouver non pas "d'autres pages sur les mêmes mots", mais de `vraies perspectives comparables`.

Construction des requêtes:

1. `titre exact`
2. `titre simplifié + entités`
3. `événement + réaction + analyse`
4. `événement + sites de médias ciblés`

Exemple:

```text
"Titre exact de l'article"
"Nom réforme" "nom ministre" analyse
"Titre simplifié" site:lefigaro.fr OR site:lemonde.fr OR site:liberation.fr OR site:francetvinfo.fr
```

Critères de sélection:

- proximité du sujet
- fraîcheur si sujet d'actualité
- sources identifiables
- diversité de cadrage
- déduplication des domaines

---

## 6. Spécifications IA

### Prompt master JSON

```text
Tu es un analyste éditorial neutre. Ta mission est d'analyser un article source et des perspectives alternatives afin d'identifier des signaux de cadrage, de partialité journalistique et d'omission probable.

Contraintes absolues:
- N'invente aucun fait.
- N'affirme jamais qu'un média ment.
- N'évalue pas une orientation politique.
- N'utilise que les textes fournis: article source, snippets de recherche, et extraits des articles alternatifs.
- Si une information manque, marque-la comme "non vérifiable".
- Le résultat doit être strictement conforme au schéma JSON demandé.
- Le ton doit rester journalistique, prudent et explicable.

Définition de travail:
- Le biais est un écart de cadrage, de sélection, de lexique, de source ou de contexte.
- Une omission est un élément important absent du texte source mais présent dans au moins une source alternative crédible, ou fortement attendu pour ce sujet.
- Une perspective alternative doit être proche du sujet, pertinente, et issue d'une source exploitable.

Tâche:
1. Analyse l'article source.
2. Identifie les signaux de biais selon ces dimensions:
   - angle/cadrage
   - sélection des faits
   - ton/lexique
   - sources et attribution
   - équilibre des points de vue
   - contexte et temporalité
   - causalité et certitude
   - chiffres et comparaisons
3. Compare l'article source avec les articles alternatifs fournis.
4. Repère les divergences factuelles ou de cadrage.
5. Repère les omissions probables sans spéculation.
6. Produis un score couleur:
   - Vert: faible biais apparent
   - Orange: biais modéré ou contexte incomplet
   - Rouge: biais marqué ou omission importante
7. Retourne une réponse JSON uniquement, sans texte autour.

Règles de sortie:
- Chaque champ doit être court, concret et compréhensible par un grand public.
- Les missing_fact doivent être prudents, pas accusatoires.
- Les URLs doivent être celles des articles alternatifs fournis.
- Si tu n'as pas assez d'éléments, indique "non vérifiable" ou "contexte insuffisant".
- Ne donne pas de score extrême si les données sont trop faibles.
```

### Schéma de sortie attendu

```json
{
  "source_article": {
    "title": "string",
    "media": "string",
    "bias": {
      "score": 0,
      "color": "green|orange|red",
      "main_signals": ["string"]
    },
    "tone": "string",
    "coverage": ["string"],
    "limits": ["string"]
  },
  "counter_perspectives": [
    {
      "media": "string",
      "url": "string",
      "stance": "string",
      "missing_fact": "string",
      "why_relevant": "string"
    }
  ],
  "global_context": "string",
  "confidence": {
    "level": "low|medium|high",
    "reason": "string"
  }
}
```

### Exemple de sortie attendue

```json
{
  "source_article": {
    "title": "Le gouvernement annonce une nouvelle réforme",
    "media": "Exemple Média",
    "bias": {
      "score": 4,
      "color": "orange",
      "main_signals": [
        "ton légèrement valorisant",
        "peu de contrepoint",
        "contexte chiffré limité"
      ]
    },
    "tone": "globalement descriptif mais un peu orienté",
    "coverage": [
      "annonce officielle",
      "mesures principales",
      "réaction du gouvernement"
    ],
    "limits": [
      "opposition peu représentée",
      "impact concret peu détaillé"
    ]
  },
  "counter_perspectives": [
    {
      "media": "Média A",
      "url": "https://example.com/article-a",
      "stance": "plus critique",
      "missing_fact": "l'article source ne développe pas les objections des syndicats",
      "why_relevant": "apporte un contrepoint direct sur l'impact social"
    },
    {
      "media": "Média B",
      "url": "https://example.com/article-b",
      "stance": "plus contextualisé",
      "missing_fact": "le cadre budgétaire historique est absent de la source",
      "why_relevant": "replace l'annonce dans une évolution plus large"
    }
  ],
  "global_context": "L'article source met surtout en avant l'annonce gouvernementale. Les alternatives ajoutent des critiques sur l'impact social et un contexte budgétaire plus large. Le sujet semble couvert, mais avec un cadrage incomplet.",
  "confidence": {
    "level": "medium",
    "reason": "les sources alternatives convergent sur plusieurs points, mais le sujet reste partiellement interprétatif"
  }
}
```

### Garde-fous éditoriaux

- Ne jamais présenter le score comme une vérité.
- Ne jamais accuser un média de mentir.
- Ne jamais inférer une intention cachée.
- Préférer `contexte insuffisant` à une conclusion agressive.
- Limiter les conclusions à ce que les textes fournis permettent.

---

## 7. Architecture cloud recommandée

### Déploiement minimal

- `App mobile`: build Flutter local puis TestFlight / APK demo
- `API`: Railway
- `Landing ou demo web`: Vercel
- `Logs et crash`: Firebase

### Environnement

- `APP_ENV`
- `SERPER_API_KEY`
- `GEMINI_API_KEY`
- `ALLOWED_ORIGINS`
- `DEFAULT_TIMEOUT_MS`
- `MEDIA_WHITELIST`

### Principe d'exploitation

- aucune base de données obligatoire en MVP
- logs techniques courts seulement
- pas de persistance d'articles
- métriques de latence et taux d'erreur prioritaires

---

## 8. Roadmap Sprint 48h

### H0-H4

- figer le schéma JSON
- définir la microcopy UI
- créer le repo mobile et le repo backend
- stubber `GET /health` et `POST /v1/analyze`

### H4-H8

- brancher l'API FastAPI
- valider les payloads Pydantic
- renvoyer une réponse mock structurée

### H8-H12

- implémenter fetch URL
- intégrer `trafilatura`
- fallback `readability-lxml`
- tester `10` URLs réelles

### H12-H16

- intégrer Serper
- créer `2 à 4` templates de requêtes
- filtrer et dédupliquer les résultats

### H16-H20

- intégrer Gemini Flash
- construire le prompt maître
- imposer une validation JSON stricte

### H20-H24

- intégrer Flutter
- gérer l'entrée `share intent`
- afficher loader + état de résultat

### H24-H28

- ajouter timeouts
- ajouter erreurs métier
- ajouter mode dégradé `preview`

### H28-H32

- améliorer la qualité des perspectives alternatives
- limiter à `2 ou 3` cartes utiles
- optimiser la microcopy

### H32-H36

- polish UI
- finaliser les codes couleur
- ajouter l'écran `Pourquoi ?`

### H36-H40

- tests E2E sur `10 à 20` articles
- calibration rapide des scores
- corrections bugs majeurs

### H40-H44

- stabilisation latence
- robustesse sur paywalls et extractions vides
- instrumentation minimale

### H44-H48

- build de démo
- script de présentation
- jeu d'exemples
- répétition pitch

---

## 9. Dépendances minimales

### Backend

- `fastapi`
- `uvicorn`
- `httpx`
- `trafilatura`
- `readability-lxml`
- `pydantic`

### Search

- client HTTP simple pour `Serper`

### IA

- SDK Gemini ou appel HTTP direct

### Flutter

- package de deep links
- package de share intent
- client HTTP

---

## 10. Tests critiques

1. URL invalide
2. Redirection longue
3. Article très court
4. Paywall dur
5. Extraction vide
6. Search sans résultat pertinent
7. Réponse LLM non valide
8. Temps de réponse > `5s`
9. Mauvais score sur un article factuel
10. Contre-perspectives hors sujet

---

## 11. Ce qu'il faut couper pour tenir le délai

- comptes utilisateurs
- authentification
- historique serveur
- comparaison multi-articles
- moteur de recommandation
- scraping headless
- moteur de notation complexe
- personnalisation poussée
- dashboard admin

---

## 12. Décisions fermes pour le MVP

1. `Flutter` plutôt que React Native
2. `FastAPI` comme unique backend
3. `Serper` pour la recherche
4. `Gemini Flash` pour l'analyse structurée
5. `Railway` pour l'API
6. `Vercel` pour la démo web si utile
7. `Stateless` sans stockage d'articles
8. `Vert / Orange / Rouge` comme seule grammaire visuelle

---

## 13. Recommandation finale

Pour un hackathon, le meilleur produit n'est pas "un détecteur de biais parfait". C'est un `accélérateur de comparaison`.

Le MVP doit donc faire une seule chose très bien:

> transformer un lien partagé en un contexte lisible, nuancé et actionnable en moins de 5 secondes.

Si une fonctionnalité ralentit ce cœur de valeur, elle doit être retirée.

---

## 14. Sources techniques consultées

- Gemini models: https://ai.google.dev/gemini-api/docs/models/gemini
- Serper: https://serper.dev/
- Railway FastAPI guide: https://docs.railway.com/guides/fastapi
- FastAPI docs: https://fastapi.tiangolo.com/
