# shift26-context

## Installation

### Installer `just`

`just` est utilisé pour lancer les commandes utilitaires du projet, notamment le déploiement.

Exemples d'installation :

- macOS : `brew install just`
- Ubuntu / Debian : `sudo apt install just`
- Avec Cargo : `cargo install just`

Vérification :

```bash
just --version
```

### Utilisation

Déployer le service Mastra sur Clever Cloud :

```bash
just deploy-mastra
```

Déployer une autre branche que `main` :

```bash
just deploy-mastra my-branch
```
