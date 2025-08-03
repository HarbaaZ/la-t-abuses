# Configuration de la génération de questions par IA

## Prérequis

Pour utiliser la génération de questions par IA, vous devez configurer une clé API OpenAI.

## Configuration

1. Créez un fichier `.env.local` à la racine du projet avec le contenu suivant :

```env
# Configuration OpenAI pour la génération de questions
OPENAI_API_KEY=your_openai_api_key_here

# URL de base pour les appels API internes
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

2. Remplacez `your_openai_api_key_here` par votre vraie clé API OpenAI.

## Obtention d'une clé API OpenAI

1. Allez sur [OpenAI Platform](https://platform.openai.com/)
2. Créez un compte ou connectez-vous
3. Allez dans la section "API Keys"
4. Créez une nouvelle clé API
5. Copiez la clé et collez-la dans votre fichier `.env.local`

## Fonctionnement

- Au début de chaque partie, le système génère automatiquement 25 questions uniques par IA
- Si l'IA n'est pas disponible, le système utilise des questions de fallback
- Chaque question a un ID unique basé sur le timestamp
- Les questions sont variées et couvrent différentes catégories

## Sécurité

- Ne partagez jamais votre clé API
- Ajoutez `.env.local` à votre `.gitignore`
- La clé API n'est utilisée que côté serveur

## Coûts

L'utilisation de l'API OpenAI génère des coûts. Consultez la [tarification OpenAI](https://openai.com/pricing) pour plus d'informations. 