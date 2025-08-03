# Guide de Déploiement Vercel

## 🚀 Déploiement

### 1. Configuration requise

Le projet est configuré pour fonctionner sur Vercel avec les fichiers suivants :

- `vercel.json` - Configuration Vercel
- `next.config.ts` - Configuration Next.js
- Variables d'environnement (optionnelles)

### 2. Variables d'environnement

Si vous utilisez des fonctionnalités avancées, ajoutez ces variables dans Vercel :

```bash
NEXT_PUBLIC_BASE_URL=https://votre-domaine.vercel.app
```

### 3. Déploiement automatique

Connectez votre repository GitHub à Vercel pour un déploiement automatique.

## 🔧 Résolution des problèmes

### Erreur 404 sur les API routes

Si vous obtenez une erreur 404 sur `/api/game`, vérifiez :

1. **Fichiers présents** :
   ```
   app/api/game/route.ts ✅
   app/api/health/route.ts ✅
   app/api/test/route.ts ✅
   ```

2. **Test de l'API** :
   ```bash
   # Testez l'endpoint de test
   curl https://votre-domaine.vercel.app/api/test
   
   # Testez l'endpoint de santé
   curl https://votre-domaine.vercel.app/api/health
   ```

3. **Logs Vercel** :
   - Allez dans le dashboard Vercel
   - Cliquez sur votre projet
   - Onglet "Functions" pour voir les logs

### Problèmes courants

#### 1. **Fonction non trouvée**
```
Error: Function not found
```
**Solution** : Vérifiez que `app/api/game/route.ts` existe et est correctement exporté.

#### 2. **Timeout de fonction**
```
Error: Function execution timeout
```
**Solution** : La configuration dans `vercel.json` augmente la durée maximale à 30 secondes.

#### 3. **Erreur de mémoire**
```
Error: Function memory limit exceeded
```
**Solution** : Le stockage en mémoire est limité sur Vercel. Considérez une base de données.

## 📊 Monitoring

### Logs de débogage

Les API routes incluent des logs détaillés :

```typescript
console.log('GET /api/game called');
console.log(`Game ID from params: ${gameId}`);
console.log(`Available games: ${Array.from(games.keys()).join(', ')}`);
```

### Endpoints de test

- `/api/test` - Test simple GET/POST
- `/api/health` - État du serveur
- `/api/game` - API principale du jeu

## 🔄 Redéploiement

### Déclenchement manuel

1. **Via Vercel Dashboard** :
   - Allez dans votre projet
   - Cliquez "Redeploy"

2. **Via Git** :
   ```bash
   git add .
   git commit -m "Fix API routes"
   git push
   ```

### Cache Vercel

Si les changements ne s'appliquent pas :

1. **Purge du cache** :
   - Dashboard Vercel → Settings → General
   - "Clear Build Cache"

2. **Redéploiement forcé** :
   - Ajoutez un paramètre de build : `?v=2`
   - Ou utilisez "Redeploy" avec "Clear cache"

## 🛠️ Configuration avancée

### Optimisations Vercel

Le fichier `vercel.json` configure :

```json
{
  "functions": {
    "app/api/game/route.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```

### Limitations Vercel

- **Mémoire** : 1024 MB par fonction
- **Durée** : 30 secondes max (configuré)
- **Stockage** : Pas de persistance entre déploiements

## 🎯 Tests de déploiement

### 1. Test local
```bash
npm run dev
curl http://localhost:3000/api/test
```

### 2. Test Vercel
```bash
curl https://votre-domaine.vercel.app/api/test
```

### 3. Test du jeu
1. Créez une partie
2. Rejoignez avec un autre navigateur
3. Démarrez la partie
4. Testez les suppositions

## 📞 Support

Si les problèmes persistent :

1. **Vérifiez les logs** dans le dashboard Vercel
2. **Testez les endpoints** un par un
3. **Vérifiez la configuration** dans `vercel.json`
4. **Redéployez** avec cache vidé 