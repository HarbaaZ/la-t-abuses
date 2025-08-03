# Configuration Vercel KV

## Problème résolu

L'erreur "An error occurred in the Server Components render" était causée par l'utilisation de stockage en mémoire (`Map`) dans les Server Actions. Sur Vercel, les Server Actions s'exécutent dans des environnements serverless isolés, ce qui signifie que le stockage en mémoire n'est pas partagé entre les requêtes.

## Solution : Vercel KV avec Fallback

Nous avons migré vers Vercel KV (Redis) pour le stockage persistant des jeux, avec un fallback automatique pour le développement local.

### Configuration requise

1. **Installer Vercel KV** :
   ```bash
   npm install @vercel/kv
   ```

2. **Configurer Vercel KV dans votre projet Vercel** :
   - Allez sur [vercel.com](https://vercel.com)
   - Sélectionnez votre projet
   - Allez dans l'onglet "Storage"
   - Cliquez sur "Create Database"
   - Sélectionnez "KV"
   - Suivez les instructions de configuration

3. **Variables d'environnement** :
   Vercel configurera automatiquement ces variables :
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

### Déploiement

Après avoir configuré Vercel KV, redéployez votre application :

```bash
vercel --prod
```

### Fonctionnalités

- **Stockage persistant** : Les jeux sont maintenant stockés dans Redis
- **TTL automatique** : Les jeux sont automatiquement supprimés après 2 heures
- **Haute disponibilité** : Fonctionne sur tous les environnements serverless de Vercel
- **Fallback automatique** : En développement local, utilise le stockage en mémoire
- **Migration transparente** : Aucun changement dans le code des Server Actions

### Migration

Le code a été migré pour utiliser les fonctions suivantes au lieu du stockage en mémoire :
- `getGame(gameId)` - Récupérer un jeu
- `setGame(gameId, game)` - Sauvegarder un jeu
- `deleteGame(gameId)` - Supprimer un jeu
- `cleanupOldGames()` - Nettoyer les jeux anciens

### Alternative

Si vous préférez ne pas utiliser Vercel KV, vous pouvez aussi :
1. Utiliser Supabase (PostgreSQL)
2. Utiliser PlanetScale (MySQL)
3. Utiliser MongoDB Atlas
4. Utiliser une autre base de données compatible avec Vercel 