# Administration Prowatt

Espace réservé à l'équipe : `https://votre-site/admin`.

## Ce que l'on peut gérer

| Module | Contenu |
| --- | --- |
| Tableau de bord | Encaissements des 6 derniers mois, factures à encaisser et en retard, commandes à traiter, devis en attente, produits les plus vendus, activité récente. |
| Commandes | Commandes passées sur le site (enregistrées automatiquement), statuts, paiements, création de la facture en un clic. |
| Devis | Devis personnalisés (lignes libres ou catalogue, remise, TVA HT/TTC), numérotation `DV-AAAA-0001`, statuts, conversion en facture, duplication, impression PDF. |
| Factures | Brouillons, émission (numéro légal `FA-AAAA-0001` attribué sans trou), paiements partiels ou totaux, états automatiques (à payer, en retard, payée), annulation, impression PDF. |
| Clients | Fiches, historique (commandes, devis, factures), solde dû. Créés automatiquement à chaque commande du site. |
| Produits | Catalogue de la boutique : noms FR/EN, prix, ancien prix (promotion), stock, image, visibilité. |
| Motos Ecooter | Page dédiée de chaque modèle : textes, photo, fiche technique, points forts, prix. |
| Avis et partenaires | Témoignages et logos du bandeau de l'accueil, avec envoi d'images. |
| Mise en avant | Onglets « Meilleures ventes / Nouveautés / Promotions » de l'accueil. |
| Paramètres | Coordonnées de l'entreprise, coordonnées de paiement (MVola, banque, lien carte), mentions légales et règles de facturation. |
| Utilisateurs | Comptes et rôles, désactivation, réinitialisation de mot de passe. |
| Journal | Qui a fait quoi, et quand. |

Toute modification de produit, de moto, d'avis, de partenaire ou de coordonnée est visible sur le site public immédiatement.

## Rôles

| Rôle | Droits |
| --- | --- |
| Propriétaire | Tout, y compris utilisateurs et paramètres. |
| Gestionnaire | Tout sauf la gestion des utilisateurs. |
| Commercial | Clients, commandes, devis ; consultation des produits et factures. |
| Comptable | Factures et paiements ; consultation des clients, commandes et devis. |
| Éditeur | Produits, motos Ecooter et contenu du site. |

Les droits sont vérifiés côté serveur à chaque page et à chaque action.

## Mise en route (développement)

```bash
npm install
npm run dev
```

Ouvrez `http://localhost:3000/admin` : une base Postgres locale embarquée est créée dans `.data/` (ignorée par git), migrée et remplie avec le catalogue actuel. Le premier écran propose de créer le compte propriétaire.

## Mise en production

1. Créez une base Postgres hébergée (Neon, Supabase…) et copiez son adresse de connexion.
2. Définissez les variables d'environnement du serveur :
   - `DATABASE_URL` : adresse de la base ;
   - `ADMIN_SETUP_CODE` : code d'installation pour créer le premier compte propriétaire ;
   - `MVOLA_*` si vous activez le paiement MVola (voir `.env.example`).
3. Créez les tables et chargez le contenu initial :

   ```bash
   npm run db:migrate
   ```

4. Ouvrez `/admin/setup`, saisissez le code d'installation et créez le compte propriétaire.
5. Renseignez **Paramètres** : coordonnées, NIF/STAT, numéro MVola, banque, préfixes de numérotation.

Après une mise à jour du schéma (`lib/db/schema.ts`) : `npm run db:generate` puis `npm run db:migrate`.

## Sécurité

- Mots de passe hachés avec scrypt ; sessions en base (le jeton n'est jamais stocké), cookie `httpOnly`, `SameSite=Lax`, `Secure` en production, durée 7 jours.
- Verrouillage du compte 15 min après 5 échecs de connexion ; limitation par IP ; message d'erreur identique pour un e-mail inconnu.
- Les montants des commandes et des paiements sont recalculés côté serveur à partir du catalogue : le navigateur n'envoie que des identifiants et des quantités.
- Une commande n'est marquée « payée » (MVola) que sur le statut lu auprès de MVola par le serveur.
- Les images envoyées sont vérifiées (signature PNG/JPEG/WebP, 2 Mo) et servies avec `nosniff` et une politique restrictive ; le SVG est refusé.
- Une facture émise n'est plus modifiable ni supprimable : elle s'annule et conserve son numéro.
- En-têtes de sécurité (HSTS, CSP en production, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).

## Limites connues

- Pas de base de données en mode statique : sans `DATABASE_URL`, le site public fonctionne avec ses données d'origine, mais l'admin et l'enregistrement des commandes sont indisponibles.
- Les devis et factures s'impriment en PDF via le navigateur (« Enregistrer au format PDF ») ; l'envoi se fait par e-mail ou WhatsApp en joignant le PDF.
- Le rappel MVola (`/api/mvola/callback`) accuse réception sans rien enregistrer : le statut est interrogé auprès de MVola tant que le client garde la page ouverte.
- Pas d'avoir (facture rectificative) : une facture émise se marque « annulée ».
