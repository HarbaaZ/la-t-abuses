# Là t'abuses! - Jeu d'apéro multijoueur

Un jeu d'apéro amusant où vous devez deviner des chiffres sans aller trop haut ! Basé sur le jeu de société "Là t'abuses!", cette version web permet de jouer en temps réel avec vos amis.

## 🎮 Règles du jeu

### Règles classiques
1. Un joueur lit une question (toutes les réponses sont des chiffres)
2. Le joueur actif doit deviner un nombre proche – mais pas supérieur – de la bonne réponse
3. À tour de rôle, les joueurs font une supposition supérieure à celle du joueur précédent
4. Ou lancent un "Là t'abuses!" s'ils pensent que le joueur précédent a deviné trop élevé
5. Lorsqu'un défi est annoncé, la réponse est vérifiée
6. Le joueur qui s'est trompé doit conserver la carte pour les points "Imbécile"
7. Une fois qu'un joueur a collecté un certain nombre de cartes, la partie se termine
8. Le joueur avec le plus de points "Imbécile" perd et tous les autres joueurs gagnent

## 🚀 Installation et démarrage

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn

### Installation
```bash
# Cloner le repository
git clone <repository-url>
cd la-t-abuses

# Installer les dépendances
npm install
```

### Démarrage
```bash
# Démarrer l'application Next.js
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 🎯 Comment jouer

1. **Rejoindre une partie** :
   - Entrez votre nom
   - Entrez le code de la partie (ou créez-en un nouveau)
   - Cliquez sur "Rejoindre la partie"

2. **Créer une partie** :
   - Le premier joueur à rejoindre devient l'hôte
   - L'hôte peut configurer le score maximum pour perdre
   - Cliquez sur "Commencer la partie" quand tous les joueurs sont prêts

3. **Pendant le jeu** :
   - Lisez la question affichée
   - Entrez votre supposition (doit être supérieure à la précédente)
   - Ou cliquez sur "Là t'abuses!" pour défier le joueur précédent

4. **Fin de partie** :
   - Le premier joueur à atteindre le score maximum perd
   - Tous les autres joueurs gagnent !

## 🛠️ Technologies utilisées

- **Frontend** : Next.js 15, React 19, TypeScript
- **Styling** : Tailwind CSS
- **Architecture** : Application monolithique compatible Vercel

## 📁 Structure du projet

```
la-t-abuses/
├── app/
│   ├── components/          # Composants React
│   ├── types/              # Types TypeScript
│   ├── data/               # Données du jeu (questions)
│   └── page.tsx            # Page principale
├── server.js               # Serveur WebSocket
├── package.json
└── README.md
```

## 🎨 Fonctionnalités

- ✅ Multijoueur local (même navigateur)
- ✅ Interface moderne et responsive
- ✅ Gestion des salles de jeu
- ✅ Système de points
- ✅ Questions variées par catégorie
- ✅ Modal de résultats de manche
- ✅ Compatible Vercel (déploiement simple)

## 🔧 Configuration

### Variables d'environnement
Aucune variable d'environnement requise pour le déploiement sur Vercel.

### Personnalisation
- Modifiez les questions dans `app/data/questions.ts`
- Ajustez les styles dans `app/globals.css`
- Configurez le serveur WebSocket dans `server.js`

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer de nouvelles fonctionnalités
- Ajouter de nouvelles questions
- Améliorer l'interface utilisateur

## 📄 Licence

Ce projet est sous licence MIT.

---

**Amusez-vous bien avec Là t'abuses! 🎉**
