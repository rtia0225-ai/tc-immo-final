# TC-Immo — Guide de déploiement (pas à pas)

Ce projet est une marketplace complète : inscription client/artisan,
profils artisans avec photos et avis, messagerie, structure de paiement
séquestré (escrow), et une page de flux caméra live prête à être branchée
sur un prestataire de streaming.

Stack : **Next.js** (frontend + backend) + **Supabase** (base de données,
authentification, stockage) + **Vercel** (hébergement).

Tu n'as besoin d'aucune carte bancaire pour démarrer — tout est gratuit à
ce stade.

---

## Étape 1 — Créer le projet Supabase (base de données)

1. Va sur https://supabase.com et crée un compte (gratuit).
2. Clique sur **New project**. Choisis un nom (ex: `tc-immo`), un mot de
   passe pour la base de données (garde-le précieusement), et une région
   proche (Europe de l'Ouest si tu es en France).
3. Une fois le projet créé, va dans **SQL Editor** (menu de gauche).
4. Ouvre le fichier `supabase/schema.sql` de ce projet, copie tout son
   contenu, colle-le dans l'éditeur SQL de Supabase, et clique sur **Run**.
   Cela crée toutes les tables (utilisateurs, artisans, avis, projets,
   messagerie, escrow, flux caméra) avec les règles de sécurité.
5. Va dans **Project Settings > API**. Note deux valeurs :
   - `Project URL`
   - `anon public key`
   Tu en auras besoin à l'étape 3.
6. (Optionnel mais recommandé) Va dans **Authentication > Providers** et
   vérifie que "Email" est activé — c'est le cas par défaut.
7. Va dans **Storage** et crée un bucket public nommé `avatars` et un
   autre nommé `artisan-photos`, si tu veux permettre l'upload de photos
   depuis l'app (à connecter plus tard, la structure est prête).

---

## Étape 2 — Créer un compte GitHub et y héberger le code

1. Crée un compte sur https://github.com si tu n'en as pas.
2. Crée un nouveau dépôt (bouton **New**), nomme-le `tc-immo`, laisse-le
   privé si tu préfères, ne coche aucune case d'initialisation.
3. Sur ton ordinateur, dans le dossier du projet, exécute :
   ```bash
   git init
   git add .
   git commit -m "Premier commit TC-Immo"
   git branch -M main
   git remote add origin https://github.com/TON-NOM-UTILISATEUR/tc-immo.git
   git push -u origin main
   ```
   (Remplace `TON-NOM-UTILISATEUR` par ton pseudo GitHub. Si tu n'as pas
   `git` installé, télécharge-le depuis https://git-scm.com — sinon,
   GitHub Desktop est une alternative avec interface graphique.)

---

## Étape 3 — Déployer sur Vercel

1. Va sur https://vercel.com et connecte-toi avec ton compte GitHub.
2. Clique sur **Add New > Project**, puis choisis le dépôt `tc-immo`.
3. Avant de cliquer sur Deploy, ouvre la section **Environment Variables**
   et ajoute :
   - `NEXT_PUBLIC_SUPABASE_URL` → l'URL notée à l'étape 1
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → la clé notée à l'étape 1
4. Clique sur **Deploy**. En 1 à 2 minutes, ton site est en ligne avec une
   URL du type `tc-immo.vercel.app`.
5. À chaque fois que tu pousses du nouveau code sur GitHub (`git push`),
   Vercel redéploie automatiquement.

---

## Étape 4 — Tester le site

1. Ouvre ton URL Vercel.
2. Crée un compte "artisan" et un compte "client" (deux emails
   différents) pour tester les deux parcours.
3. Va dans Supabase > **Table Editor > artisan_profiles** et mets
   `is_verified` à `true` pour ton compte artisan de test, pour voir le
   badge "Vérifié" apparaître.
4. Teste la messagerie en contactant l'artisan depuis son profil.

---

## Ce qui est fonctionnel dès maintenant

- Inscription / connexion avec deux rôles (client, artisan)
- Profils artisans (métier, bio, tarif, années d'expérience)
- Liste et fiche détaillée d'artisan avec avis clients
- Messagerie entre client et artisan
- Structure de projet avec statuts d'avancement (escrow) et historique
- Page de flux caméra (structure prête, vidéo à brancher)
- Prise de rendez-vous / appel vidéo : le client propose un créneau,
  l'artisan confirme et peut y joindre un lien (Meet, Zoom...)
- Chronogramme de projet ("espace de suivi général") : l'artisan ajoute
  et coche les étapes terminées, le client les consulte en lecture seule
- Page "Mes revenus" pour l'artisan (total perçu / en attente par projet)
- Dashboard différencié par rôle avec raccourcis "Nouveaux messages" et
  "Nouveaux rendez-vous" (compteurs)
- Structure de notification SMS (`lib/notifications.js`) déclenchée à
  chaque nouveau message et nouvelle demande de rendez-vous — voir
  ci-dessous pour la brancher sur un vrai prestataire

## Ce qu'il reste à connecter pour une vraie mise en production

1. **Paiement escrow réel** : la table `projects` et `escrow_events`
   trace les statuts, mais aucun argent ne bouge réellement. Il faut
   intégrer un prestataire :
   - **Stripe Connect** (comptes séparés + retenue de fonds) — le plus
     robuste techniquement, mais vérifie sa disponibilité et ses
     conditions pour la Côte d'Ivoire.
   - **CinetPay** ou **PayDunya** — solutions plus répandues en Afrique
     de l'Ouest, à intégrer via leur API dans
     `app/projects/actions.js`.
2. **Flux caméra live réel** : la table `camera_feeds` a une colonne
   `playback_url`. Il faut un prestataire de streaming (Mux, Daily.co,
   Agora, Livepeer) pour générer une vraie URL de diffusion à partir
   d'une caméra sur le chantier, puis la stocker ici.
3. **Upload de photos** : connecter les boutons d'upload aux buckets
   Supabase Storage créés à l'étape 1 (avatars, artisan-photos).
4. **SMS transactionnels réels** (nouveau message, nouveau RDV, rappel
   avant l'appel) : `lib/notifications.js` contient déjà la structure et
   les points d'appel ; il suffit de créer un compte chez un prestataire
   (Twilio, Vonage, ou un fournisseur local comme l'API SMS d'Orange/MTN)
   et de remplacer le `console.log` par le vrai appel API, en ajoutant
   les clés dans `.env.local` et sur Vercel. Le rappel automatique avant
   un RDV (`notifyAppointmentReminder`) nécessite en plus une tâche
   planifiée (ex: Vercel Cron) qui l'appelle un peu avant `scheduled_at`.
5. **Emails transactionnels** (confirmation, notifications de message) :
   Supabase envoie déjà l'email de confirmation de compte par défaut ;
   pour des emails personnalisés, ajoute un service comme Resend ou
   Postmark.
5. **Nom de domaine** : dans Vercel > Settings > Domains, tu peux
   remplacer `tc-immo.vercel.app` par ton propre nom de domaine une fois
   acheté (ex: chez Namecheap, OVH, ou Google Domains).

---

## Développement en local (optionnel)

Si tu veux tester sur ton ordinateur avant de pousser sur GitHub :

```bash
npm install
cp .env.local.example .env.local
# remplis .env.local avec tes clés Supabase
npm run dev
```

Le site sera visible sur http://localhost:3000
