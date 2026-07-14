# Procédure de déploiement ANOUANZÊ ERP

## Pré-requis
- VPS : root@185.98.139.38
- Docker + Docker Compose installés
- PostgreSQL accessible via Docker

## Commandes VPS (dans l'ordre)

```bash
# 1. Connexion VPS
ssh root@185.98.139.38

# 2. Aller dans le répertoire app
cd /app   # ou le répertoire d'installation

# 3. Pull des derniers changements
git pull origin master

# 4. Migration Prisma (CRITIQUE — nouveaux modèles)
cd apps/api
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# 5. Regénérer le client Prisma
DATABASE_URL="postgresql://..." npx prisma generate

# 6. Rebuild et redémarrage Docker
cd /app
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# 7. Vérification santé
curl http://localhost:4000/api/v1/health
curl http://localhost:3099

# 8. Voir les logs
docker-compose -f docker-compose.prod.yml logs -f api
```

## Nouveaux modèles à migrer

Les modèles suivants ont été ajoutés au schéma Prisma et nécessitent une migration :

- `OrganeGouvernance` + enum `TypeOrgane`
- `Reunion`
- `Resolution` + enum `StatutResolution`
- `Notification` + enum `TypeNotification`
- `TicketSupport` + enums `PrioriteTicket`, `StatutTicket`
- `MessageTicket`

## Nouvelles routes API

- `GET/POST /api/v1/gouvernance/organes`
- `GET/POST /api/v1/gouvernance/reunions`
- `GET/POST/PATCH /api/v1/gouvernance/resolutions`
- `GET /api/v1/gouvernance/stats`
- `GET/PATCH/DELETE /api/v1/notifications`
- `GET/POST/PATCH /api/v1/tickets`
- `GET /api/v1/import/template/:type`
- `POST /api/v1/import/valider/:type`
- `POST /api/v1/import/membres`
- `POST /api/v1/import/donateurs`
- `GET /api/v1/documents/:id/qr`
- `GET /api/v1/documents/verifier/:id` (public)

## Nouvelles pages frontend

- `/gouvernance` — Organes, réunions, résolutions
- `/notifications` — Notifications temps réel
- `/tickets` — Support utilisateur
- `/import` — Import Excel en masse
- `/paiements` — Paiements mobiles (Orange Money, MTN MoMo, CinetPay, Wave)
