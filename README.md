# FitTrack

FitTrack is a fitness web app where you can log and track your workouts, create custom training routines, and connect with other athletes. Think of it as your training journal meets social network.

---

## Tech Stack

**Backend**
- Python + FastAPI
- MySQL (remote server)
- mysql-connector-python

**Frontend**
- React + TypeScript
- Vite

---

## Project Structure

```
fittrack/
├── backend/
│   ├── main.py           # App entry point, router registration
│   ├── database.py       # MySQL connection
│   ├── requirements.txt
│   └── routes/
│       ├── users.py      # User endpoints
│       ├── muscle.py     # Muscle endpoints
│       └── program.py    # Program endpoints
├── frontend/
│   └── src/
│       ├── components/
│       └── pages/
└── db/
    ├── sql/              # MySQL scripts
    └── nosql/            # NoSQL scripts
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Access to the MySQL server

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file inside `backend/` using `.env.example` as reference:

```
DB_HOST=your_host
DB_NAME=fittrack
DB_USER=your_user
DB_PASSWORD=your_password
DB_PORT=3307
```

Run the server:

```bash
uvicorn main:app --reload
```

API available at `http://localhost:8000`  
Interactive docs at `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:5173`

---

## API Endpoints

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users |
| GET | `/users/{id}` | Get user by ID |
| POST | `/users` | Create a new user |
| PUT | `/users/{id}` | Update a user |
| DELETE | `/users/{id}` | Delete a user |

### Muscles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/muscles` | Get all muscles |
| GET | `/muscles/{id}` | Get muscle by ID |
| POST | `/muscles` | Create a new muscle |
| PUT | `/muscles/{id}` | Update a muscle |
| DELETE | `/muscles/{id}` | Delete a muscle |

### Programs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/programs` | Get all programs |
| GET | `/programs/{id}` | Get program by ID |
| POST | `/programs` | Create a new program |
| PUT | `/programs/{id}` | Update a program |
| DELETE | `/programs/{id}` | Delete a program |
