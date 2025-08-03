# Là t'abuses! 🎮

Un jeu d'apéro multijoueur en ligne où vous devez deviner des chiffres sans aller trop haut !

## 🎯 Règles du jeu

**Là t'abuses!** est un jeu de société d'ambiance super flexible où vous devinez des chiffres sans aller trop haut.

### Comment jouer :
1. Un joueur lit une question (toutes les réponses sont des chiffres)
2. Le joueur actif doit deviner un nombre proche – mais pas supérieur – de la bonne réponse
3. À tour de rôle, les joueurs font une supposition supérieure à celle du joueur précédent
4. Ou lancent un "Là t'abuses!" s'ils pensent que le joueur précédent a deviné trop élevé
5. Lorsqu'un défi est annoncé, la réponse est vérifiée
6. Le joueur qui s'est trompé doit conserver la carte pour les points "Imbécile"
7. Une fois qu'un joueur a collecté un certain nombre de cartes, la partie se termine
8. Le joueur avec le plus de points "Imbécile" perd et tous les autres joueurs gagnent !

## 🚀 Déploiement

Ce jeu est conçu pour être déployé sur **Vercel** en un seul clic !

### ✅ Compatible Vercel
- ✅ **Aucun serveur séparé** nécessaire
- ✅ **API Routes Next.js** pour la logique de jeu
- ✅ **Polling intelligent** pour les mises à jour en temps réel
- ✅ **Stockage en mémoire** pour les parties actives
- ✅ **Déploiement automatique** depuis GitHub

## 🛠️ Technologies

- **Frontend** : Next.js 15, React 19, TypeScript
- **Styling** : Tailwind CSS
- **Backend** : Next.js API Routes
- **Communication** : REST API avec polling
- **Déploiement** : Vercel

## 🎮 Fonctionnalités

- ✅ **Multijoueur en ligne** - Jouez avec vos amis depuis n'importe quel navigateur
- ✅ **Tours de jeu** - Chaque joueur joue à son tour dans l'ordre
- ✅ **Système de défis** - Lancez "Là t'abuses!" pour défier les autres
- ✅ **Interface moderne** - Design responsive avec Tailwind CSS
- ✅ **Gestion des parties** - Créez et rejoignez des parties avec un code
- ✅ **Scores en temps réel** - Suivez les points "Imbécile" de chaque joueur
- ✅ **Questions variées** - 15 questions dans différentes catégories

## 🚀 Installation et développement

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation
```bash
# Cloner le repository
git clone <votre-repo>
cd la-t-abuses

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
```

### Déploiement sur Vercel
1. Poussez votre code sur GitHub
2. Connectez votre repository à Vercel
3. Déployez automatiquement !

## 🎯 Comment jouer

1. **Rejoindre une partie** : Entrez votre nom et le code de la partie
2. **Attendre les joueurs** : Partagez le code avec vos amis
3. **Commencer** : L'hôte lance la partie quand tout le monde est prêt
4. **Jouer** : Devinez des chiffres à votre tour ou défiez les autres
5. **Gagner** : Évitez d'avoir le plus de points "Imbécile" !

## 🏗️ Architecture

### Structure du projet
```
la-t-abuses/
├── app/
│   ├── api/game/route.ts    # API Routes pour la logique de jeu
│   ├── components/          # Composants React
│   ├── types/              # Types TypeScript
│   ├── page.tsx            # Page principale
│   └── globals.css         # Styles globaux
├── package.json
└── README.md
```

### API Routes
- `GET /api/game?gameId=xxx` - Récupérer l'état d'une partie
- `POST /api/game` - Actions de jeu (rejoindre, jouer, défier, etc.)

### Polling intelligent
- Mise à jour automatique toutes les secondes
- Optimisation pour éviter les requêtes inutiles
- Gestion des erreurs et reconnexion automatique

## 🎨 Design

- **Interface moderne** avec Tailwind CSS
- **Responsive** pour mobile et desktop
- **Animations** pour une meilleure expérience utilisateur
- **Couleurs** : Thème indigo/bleu pour un look professionnel

## 🔧 Configuration

### Variables d'environnement
Aucune configuration spéciale nécessaire pour Vercel !

### Personnalisation
- Modifiez les questions dans `app/api/game/route.ts`
- Ajustez les styles dans `app/globals.css`
- Personnalisez les règles dans la logique de jeu

## 🐛 Dépannage

### Problèmes courants
- **Connexion échouée** : Vérifiez que l'URL est correcte
- **Partie non trouvée** : Vérifiez le code de la partie
- **Joueur déjà existant** : Utilisez un nom différent

### Logs
Les erreurs sont affichées dans la console du navigateur et dans les logs Vercel.

## 📝 Licence

Ce projet est open source. N'hésitez pas à contribuer !

---

**Amusez-vous bien avec Là t'abuses! 🎉**
