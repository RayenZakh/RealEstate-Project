# Dari — Real Estate Platform

Dari ("home" in Tunisian Arabic) is a MERN-stack web application that lets people browse, publish, and manage real estate listings across Tunisia — houses, apartments, villas, and land, for sale or for rent — on an interactive map.

This project was built as part of a first internship, covering both backend (Node.js/Express/MongoDB) and frontend (React) development.

## Features

- **Authentication** — account registration and login secured with JWT and hashed passwords (bcrypt).
- **Browse properties** — view all listings on an interactive map (Leaflet/OpenStreetMap), with a searchable, filterable sidebar (by city/title, listing type, property type).
- **Publish a listing** — authenticated users can add a property by filling in its details and placing its exact location by clicking on a map.
- **Manage listings** — a property owner can delete their own listings; other users cannot.
- **Contact the owner** — each listing's map popup shows the owner's name and phone number.
- **Protected routes** — pages that require login (e.g. Add Property) redirect unauthenticated visitors to the login page.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, React Hook Form, Axios, React-Leaflet |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Auth | JSON Web Tokens (JWT), bcrypt |
| Maps | Leaflet + OpenStreetMap tiles |

## Project structure

```
RealEstate-Project/
├── backend/
│   ├── config/            # Database connection
│   ├── controllers/       # Business logic (auth, properties)
│   ├── middleware/        # JWT authentication guard
│   ├── models/            # Mongoose schemas (User, Property)
│   ├── routes/            # Express route definitions
│   ├── app.js              # Express app configuration
│   └── server.js           # Entry point — connects DB and starts the server
│
└── frontend/
    └── src/
        ├── components/     # Reusable UI (Navbar, Footer, ProtectedRoute)
        ├── context/        # Global auth state (AuthContext)
        ├── hooks/          # Custom hooks (useAuth)
        ├── layouts/        # Page layout wrapper (Navbar + Footer)
        ├── pages/          # Route-level pages (Home, Login, Register, AddProperty, PropertyMap)
        ├── services/       # Centralized API calls (Axios)
        └── styles/         # Per-page CSS
```

## Getting started

### Prerequisites

- Node.js (v18 or later recommended)
- A MongoDB database (local install or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### 1. Clone and install dependencies

```bash
git clone https://github.com/RayenZakh/RealEstate-Project.git
cd RealEstate-Project

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

**`backend/.env`**
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

**`frontend/.env`**
```
VITE_API_URL=http://localhost:5000/api
```

Never commit either `.env` file — only `.env.example` should be tracked in version control.

### 3. Run the app

In two separate terminals:

```bash
# Terminal 1 — backend
cd backend
npm run dev

# Terminal 2 — frontend
cd frontend
npm run dev
```

The frontend runs at `http://localhost:5173` (Vite's default) and talks to the backend at `http://localhost:5000`.

## API overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create a new account |
| POST | `/api/auth/login` | Public | Log in and receive a JWT |
| GET | `/api/properties` | Public | List all properties |
| GET | `/api/properties/:id` | Public | Get one property |
| POST | `/api/properties` | Authenticated | Create a property |
| DELETE | `/api/properties/:id` | Authenticated, owner only | Delete a property |

## Roadmap / possible improvements

- Role-based accounts (e.g. distinguishing buyers, owners, and admins) rather than a single `User` type.
- Photo uploads for listings.
- Pagination for the property list as data grows.
- Automated tests (backend routes, frontend components).

## Author

Built by Rayen Zakhama as part of an internship project.
