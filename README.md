# FitTrack

FitTrack est une application web de suivi sportif. Elle permet de logger ses séances, suivre sa progression, créer des programmes d'entraînement et se connecter avec d'autres athlètes.

**Stack :** FastAPI (Python) · React + TypeScript · MySQL · MongoDB

---

## Lancement rapide

### Prérequis

- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Créer un fichier `.env` dans `backend/` à partir de `.env.example` :

```
MYSQL_HOST=...
MYSQL_PORT=3307
MYSQL_USER=...
MYSQL_PASSWORD=...
MYSQL_DB=fittrack

MONGO_URI=mongodb://user:password@host:27017/?authSource=admin
MONGO_DB=fittrack
```

```bash
uvicorn main:app --reload
```

API disponible sur `http://localhost:8000`  
Documentation Swagger sur `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App disponible sur `http://localhost:5173`

---

## Comptes de démo

| Nom | Email | Mot de passe |
|-----|-------|--------------|
| Alice Martin | alice@demo.com | demo |
| Bob Dupont | bob@demo.com | demo |
| Clara Lefevre | clara@demo.com | demo |

---

## Base de données

### MySQL — initialisation

```bash
# Exécuter dans DBeaver ou MySQL CLI
db/sql/INIT.sql
```

Contient : toutes les tables, vues, triggers, procédures stockées et données de démo.

### MongoDB

Les données sont insérées automatiquement lors de la création de séances via l'application. Les index (TTL, full-text) sont créés automatiquement au démarrage du backend.

---

## Structure du projet

```
fittrack/
├── backend/
│   ├── main.py           # Point d'entrée FastAPI
│   ├── database.py       # Connexions MySQL + MongoDB
│   ├── requirements.txt
│   ├── .env.example
│   └── routes/
│       ├── auth.py       # POST /login
│       ├── users.py      # CRUD utilisateurs
│       ├── sessions.py   # CRUD séances
│       ├── exercises.py  # GET exercices + muscles
│       ├── program.py    # CRUD programmes + procédures stockées
│       ├── muscle.py     # CRUD muscles
│       ├── follow.py     # Follow / Unfollow
│       └── stats.py      # Stats MongoDB (progression, volume, recherche)
├── frontend/
│   └── src/
│       ├── pages/        # Login, Register, Sessions, Profile, Stats...
│       └── components/   # Navbar
└── db/
    └── sql/
        ├── INIT.sql      # Script complet reproductible
        └── exercises_seed.sql
```

---

## Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/login` | Connexion |
| POST | `/users` | Inscription |
| GET | `/users?page=1&limit=10` | Liste des utilisateurs (paginée) |
| GET | `/users/{id}` | Profil utilisateur |
| GET | `/sessions?user_id=X&page=1&limit=10` | Séances (paginées) |
| POST | `/sessions` | Créer une séance |
| GET | `/sessions/{id}` | Détail d'une séance |
| DELETE | `/sessions/{id}` | Supprimer une séance |
| GET | `/exercises` | Liste des exercices avec muscles |
| POST | `/follow` | Suivre un utilisateur |
| DELETE | `/follow` | Ne plus suivre |
| GET | `/users/{id}/followers` | Liste des followers |
| GET | `/users/{id}/following` | Liste des abonnements |
| GET | `/stats/progression?user_id=X&exercise=NAME` | Progression du poids (MongoDB) |
| GET | `/stats/volume?user_id=X` | Volume total par séance (MongoDB) |
| GET | `/stats/search?user_id=X&q=bench` | Recherche full-text (MongoDB) |
| POST | `/programs/{id}/join?user_id=X` | Rejoindre un programme (procédure stockée) |
| POST | `/programs/{id}/deactivate` | Désactiver un programme (procédure stockée) |
| GET | `/programs/user/{id}/count` | Nombre de programmes (procédure stockée) |
