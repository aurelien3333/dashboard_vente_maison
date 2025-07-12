# 💰 Application de Gestion des Crédits - Vente Maison

Une application web simple et moderne pour gérer vos crédits et estimer le montant net lors de la vente de votre maison.

## 🚀 Fonctionnalités

### Gestion des Crédits
- ✅ **Ajout de crédits** : Nom, capital restant dû, mensualité
- ✅ **Modification de crédits** : Interface intuitive de modification
- ✅ **Suppression de crédits** : Avec confirmation de sécurité
- ✅ **Liste des crédits actifs** : Affichage en temps réel

### Calculs Automatiques
- ✅ **Total des capitaux restant dus** : Somme de tous les crédits
- ✅ **Total des mensualités** : Somme de toutes les mensualités
- ✅ **Montant net après vente** : Prix de vente - Total des capitaux
- ✅ **Estimation future** : Calcul du capital restant à une date donnée

### Interface Utilisateur
- ✅ **Design responsive** : Compatible mobile et desktop
- ✅ **Interface moderne** : Design épuré avec animations
- ✅ **Mise à jour temps réel** : Calculs automatiques
- ✅ **Notifications** : Feedback utilisateur pour toutes les actions

## 🛠️ Technologies Utilisées

- **Frontend** : HTML5, CSS3, JavaScript (Vanilla ES6+)
- **Base de données** : Supabase PostgreSQL
- **Bibliothèques** : Supabase JS Client
- **Design** : CSS Grid, Flexbox, animations CSS

## 🗄️ Structure de la Base de Données

### Table `credits`
```sql
CREATE TABLE credits (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    capital_restant_du DECIMAL(10,2) NOT NULL,
    mensualite DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Installation et Démarrage

### Prérequis
- Navigateur web moderne
- Serveur web local (Python, Node.js, ou autre)

### Démarrage rapide

1. **Serveur Python** (recommandé) :
   ```bash
   cd /Users/aurelienverdeau/Documents/projet_perso/vente_maison
   python3 -m http.server 8000
   ```
   Puis ouvrir : http://localhost:8000

2. **Serveur Node.js** :
   ```bash
   npx http-server -p 8000
   ```

3. **Live Server** (VS Code) :
   - Installer l'extension Live Server
   - Clic droit sur `index.html` → "Open with Live Server"

## 📱 Utilisation

### Ajouter un Crédit
1. Remplir le formulaire en haut de page
2. Saisir le nom du crédit (ex: "Crédit immobilier principal")
3. Indiquer le capital restant dû en euros
4. Indiquer la mensualité en euros
5. Cliquer sur "Ajouter le crédit"

### Configurer la Vente
1. Dans la section "Paramètres de vente"
2. Saisir le prix de vente estimé de votre maison
3. (Optionnel) Sélectionner une date future pour l'estimation

### Interpréter les Résultats
- **Total des capitaux** : Somme de tous vos crédits actuels
- **Total des mensualités** : Charge mensuelle totale
- **Montant net après vente** : Ce qu'il vous restera après remboursement
- **Estimation future** : Projection à la date sélectionnée

### Modifier/Supprimer un Crédit
- Cliquer sur "✏️ Modifier" pour éditer un crédit
- Cliquer sur "🗑️ Supprimer" pour supprimer (avec confirmation)

## 🔒 Configuration Supabase

L'application utilise Supabase pour le stockage des données :
- **URL du projet** : `https://aurtzeinxytjshxodnxv.supabase.co`
- **Clé publique** : Configurée dans `app.js`
- **Pas d'authentification** : Accès libre pour simplifier l'usage personnel

## 📁 Structure des Fichiers

```
vente_maison/
├── index.html          # Page principale de l'application
├── styles.css          # Styles CSS responsive
├── app.js             # Logique JavaScript et intégration Supabase
└── README.md          # Documentation
```

## 🎨 Personnalisation

### Couleurs
Les couleurs principales peuvent être modifiées dans `styles.css` :
- Primaire : `#4facfe` (bleu)
- Succès : `#28a745` (vert)
- Erreur : `#dc3545` (rouge)
- Avertissement : `#ffc107` (jaune)

### Calculs
La logique de calcul se trouve dans `app.js` :
- `updateCalculations()` : Calculs en temps réel
- `updateFutureEstimation()` : Estimation future

## 🔧 Fonctionnalités Avancées

### Sauvegarde Locale
- Le prix de vente est sauvegardé automatiquement dans le navigateur
- Les données des crédits sont synchronisées avec Supabase

### Notifications
- Messages de confirmation pour toutes les actions
- Messages d'erreur en cas de problème
- Animation fluide des notifications

### Calcul d'Estimation Future
L'application calcule automatiquement le capital restant à une date future en tenant compte :
- Du nombre de mois entre aujourd'hui et la date sélectionnée
- Des mensualités fixes pour chaque crédit
- De la réduction progressive du capital

## 🐛 Dépannage

### Problèmes Courants

1. **Les crédits ne s'affichent pas** :
   - Vérifier la connexion internet
   - Ouvrir les outils de développement (F12) pour voir les erreurs

2. **Erreur de sauvegarde** :
   - Vérifier que tous les champs sont remplis
   - Vérifier que les montants sont positifs

3. **Interface non responsive** :
   - Vider le cache du navigateur (Ctrl+F5)
   - Tester sur un autre navigateur

### Console de Développement
Pour déboguer, ouvrir les outils de développement (F12) et vérifier :
- L'onglet Console pour les erreurs JavaScript
- L'onglet Network pour les requêtes réseau

## 📊 Exemple d'Utilisation

Supposons que vous ayez :
- Crédit immobilier : 150 000€ restants, 1 200€/mois
- Crédit travaux : 25 000€ restants, 300€/mois
- Prix de vente estimé : 220 000€

**Résultats** :
- Total capitaux : 175 000€
- Total mensualités : 1 500€
- Montant net : 45 000€ ✅

**Estimation dans 2 ans** :
- Capital restant estimé : 139 000€ (175 000 - 36 × 1 500)
- Montant net futur : 81 000€ ✅

## 🚀 Déploiement

### Hébergement Local
L'application fonctionne parfaitement en local avec n'importe quel serveur web.

### Hébergement en Ligne
Peut être déployée sur :
- Netlify (gratuit)
- Vercel (gratuit)
- GitHub Pages
- Tout hébergeur supportant les fichiers statiques

## 📄 Licence

Projet personnel - Libre d'utilisation et de modification.

## 👨‍💻 Support

Pour toute question ou suggestion d'amélioration, n'hésitez pas à ouvrir une issue ou à contacter le développeur.
