# Fridoce Design and Trade Center — Website

Site officiel de Fridoce Design and Trade Center, solution digitale complète (graphisme, sites web, e-commerce, automatisation IA, publicités, contenu, support technique).

## 📋 Structure

```
├── index.html              # Page d'accueil (hero, promesses, à propos, témoignages)
├── services.html           # Catalogue des 7 services avec tarifs
├── paiement.html           # Paiement sécurisé + formulaire contact + FAQ + CGU
├── style.css               # Design système unifié (variables CSS, layouts responsifs)
├── dynamic.js              # Interactivité (menu mobile, animations, GA tracking, sticky WhatsApp)
├── assets/
│   ├── countries.json      # Liste allégée des pays (80+ pays + "Autre")
│   ├── logo.png            # Logo principal
│   ├── logo_icon.png       # Favicon/mini logo
│   └── photo.jpg           # Photo du fondateur (à personnaliser)
└── README.md               # Ce fichier
```

## 🚀 Déploiement

### Hébergement recommandé
- **Netlify** (gratuit, déploiement depuis Git)
- **Vercel** (gratuit, performances optimales)
- **GitHub Pages** (gratuit)

### Étapes rapides (Netlify)

1. **Pousser le code sur GitHub** :
   ```bash
   git push origin feature/improve-conversion
   ```

2. **Connecter à Netlify** :
   - Aller sur [netlify.com](https://netlify.com)
   - Cliquer "New site from Git"
   - Sélectionner le repo GitHub
   - Laisser les paramètres par défaut (aucune build nécessaire)
   - Déployer

3. **Configurer le domaine personnalisé** :
   - Dans Netlify : Domain settings → Custom domain
   - Ajouter `fridocedesign.com` (ou votre domaine)
   - Mettre à jour les DNS chez votre registrar

### Alternative : hébergement classique (cPanel, OVH, etc.)

1. Télécharger tous les fichiers
2. Les uploader via FTP dans le dossier `/public_html`
3. S'assurer que `index.html` est le fichier par défaut

## ⚙️ Configuration

### 1. Google Analytics

L'ID Google Analytics est déjà configuré dans les 3 pages HTML :

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-367284844"></script>
```

**À changer** si vous avez un compte GA différent :
- Remplacer `G-367284844` par votre ID GA4

### 2. FedaPay (Paiement)

La clé publique de production est intégrée dans `paiement.html` :

```javascript
public_key: 'pk_live_sn9Mz2n2xQALrVjJbaT08LYS'
```

**Pour vos tests** :
- Remplacer par votre clé FedaPay personnelle (compte test ou production)
- Lire la doc FedaPay : [fedapay.com](https://fedapay.com)

### 3. WhatsApp (Sticky button & contact)

Le numéro WhatsApp est intégré partout. **À personnaliser** :

Chercher `+22995250774` dans les fichiers et remplacer par votre numéro.

Exemple pour paiement.html :
```html
<a href="https://wa.me/22995250774?text=...">
```

### 4. Réseaux sociaux & Facebook

Lien vers la page Facebook : `https://www.facebook.com/dtacademy2`

**À mettre à jour** dans :
- `index.html` (footer, about section)
- `services.html` (portfolio)
- `paiement.html` (footer, contact info)

### 5. Photo du fondateur

Remplacer `assets/photo.jpg` par votre photo personnelle.

### 6. Logo & favicon

Remplacer `assets/logo.png` et `assets/logo_icon.png` par vos logos.

## 🎨 Design & Personnalisation

### Variables CSS

Tous les couleurs et espacements sont centralisés dans `style.css` (section `:root`) :

```css
:root {
  --ink-black: #1A1A1A;     /* Noir principal */
  --orange: #FF7F00;        /* Orange primaire */
  --gold: #FDB830;          /* Or/accent */
  --sand: #F4F4F9;          /* Arrière-plan clair */
  /* ... autres variables */
}
```

### Adapter les couleurs
Modifier directement les valeurs hex dans `:root`.

### Ajouter une page
1. Créer un fichier HTML basé sur le template `index.html`
2. Inclure les mêmes `<link rel="stylesheet">` et `<script src="dynamic.js">`
3. Inclure la nav et le footer

## 📱 Responsive & Performance

- ✅ Mobile-first design
- ✅ Breakpoints : 860px (tablette), 560px (mobile)
- ✅ Animations fluides (Intersection Observer)
- ✅ Fichiers CSS/JS minifiés
- ✅ Images optimisées (lazy loading)

## 🔍 SEO

### Déjà inclus :
- Meta descriptions de 160 caractères
- Open Graph tags (partage réseaux sociaux)
- Schema.org JSON-LD (LocalBusiness)
- Google Analytics 4
- Sitemap recommandé (voir ci-dessous)

### Avant le déploiement :
1. Ajouter un `sitemap.xml` :

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://fridocedesign.com/index.html</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://fridocedesign.com/services.html</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://fridocedesign.com/paiement.html</loc>
    <priority>0.8</priority>
  </url>
</urlset>
```

2. Soumettre le sitemap à Google Search Console
3. Ajouter robots.txt (optionnel mais recommandé)

## 🧪 Tests avant déploiement

- [ ] Tester sur mobile (Chrome DevTools, iPhone, Android)
- [ ] Vérifier tous les liens (services → paiement → contact)
- [ ] Tester le bouton sticky WhatsApp
- [ ] Tester le paiement FedaPay (mode test si disponible)
- [ ] Vérifier l'affichage des témoignages et portfolio
- [ ] Charger la liste des pays en devtools (vérifier `assets/countries.json`)
- [ ] Vérifier Google Analytics (créer un événement de test)

## 📊 Suivi analytique

### Événements GA4 configurés :

| Événement | Déclencheur |
|-----------|-------------|
| `cta_click` | Clic sur "Démarrer un projet" |
| `contact_click` | Clic sur le bouton sticky WhatsApp |
| `contact_form_submit` | Soumission du formulaire contact |
| `payment_initiated` | Initiation d'un paiement FedaPay |
| `purchase` | Paiement réussi |

Consultable dans Google Analytics > Événements.

## 🔐 Sécurité

- ✅ Pas de données sensibles en dur (clés FedaPay publiques uniquement)
- ✅ Formulaires sans soumission backend (traitement côté client / WhatsApp)
- ✅ HTTPS recommandé (Netlify fourni automatiquement)
- ✅ Pas de cookies de tracking (Google Analytics uniquement)

## 📞 Support & contact

**Email** : contact@fridocedesign.com  
**WhatsApp** : +229 95 25 07 74  
**Facebook** : [Fridoce Design and Trade Center](https://www.facebook.com/dtacademy2)

---

**Dernière mise à jour** : 25 juin 2026  
**Version** : 1.0 (feature/improve-conversion)
