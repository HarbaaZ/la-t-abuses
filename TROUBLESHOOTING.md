# Dépannage - Erreur "Game not found"

## Problème

L'erreur "Game not found" se produit lorsque le serveur ne trouve plus la partie en mémoire. Cela peut arriver dans plusieurs situations :

### Causes possibles

1. **Redémarrage du serveur** : Le stockage en mémoire est perdu lors du redémarrage
2. **Déploiement sur Vercel** : Les fonctions serverless sont stateless et ne partagent pas la mémoire
3. **Nettoyage automatique** : Les parties anciennes (plus de 2 heures) sont automatiquement supprimées
4. **Problème de réseau** : Perte de connexion temporaire

## Solutions implémentées

### 1. Gestion d'erreurs améliorée

- Détection automatique quand une partie est perdue
- Redirection automatique vers l'écran de connexion
- Messages d'erreur plus clairs pour l'utilisateur

### 2. Logs de débogage

- Logs détaillés côté serveur pour diagnostiquer les problèmes
- Composant de débogage en mode développement
- Endpoint de santé du serveur (`/api/health`)

### 3. Nettoyage automatique

- Suppression automatique des parties anciennes (2+ heures)
- Nettoyage toutes les 10 minutes pour éviter l'accumulation

## Solutions futures recommandées

### Base de données persistante

Pour une solution permanente, il est recommandé d'utiliser une base de données :

```bash
# Exemple avec PostgreSQL
npm install @prisma/client prisma
npm install pg
```

### Stockage Redis

Pour un stockage en mémoire distribué :

```bash
npm install redis
npm install @upstash/redis
```

### Stockage de fichiers

Pour un stockage simple :

```bash
npm install fs-extra
```

## Comment tester

1. **Mode développement** : Le composant DebugInfo affiche les informations en temps réel
2. **Logs serveur** : Vérifiez les logs dans la console du serveur
3. **Endpoint de santé** : Testez `/api/health` pour vérifier l'état du serveur

## Actions utilisateur

Si vous rencontrez l'erreur "Game not found" :

1. **Attendez quelques secondes** et réessayez
2. **Rejoignez une nouvelle partie** avec le même code
3. **Vérifiez votre connexion internet**
4. **Contactez l'administrateur** si le problème persiste

## Prévention

- **Sauvegardez régulièrement** l'état de vos parties importantes
- **Utilisez des codes de partie courts** pour faciliter la reconnexion
- **Évitez les parties très longues** (plus de 2 heures) 