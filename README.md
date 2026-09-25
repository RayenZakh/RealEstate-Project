# Dari — Real Estate Platform

Dari ("home" in Tunisian Arabic) is a MERN-stack web application that lets people browse, publish, and manage real estate listings across Tunisia — houses, apartments, villas, and land, for sale or for rent — on an interactive map.

This project was built as part of a first internship, covering both backend (Node.js/Express/MongoDB) and frontend (React) development.

## Features

- **Authentication** — account registration and login secured with JWT and hashed passwords (bcrypt).
- **Browse properties** — view all listings on an interactive map (Leaflet/OpenStreetMap), with a searchable, filterable sidebar (by city/title, listing type, property type).
- **Property details** — full-page view with image gallery, specs, description, location map, and owner contact card.
- **Publish a listing** — authenticated users can add a property with details, photos, and an exact map location.
- **Photo uploads** — property images are uploaded and served from the backend.
- **Manage listings** — a property owner can edit or delete their own listings.
- **Real-time messaging** — authenticated users can contact a property owner directly from the listing page. Conversations are property-specific and messages are delivered in real time via Socket.IO.
- **Inbox** — a dedicated Messages page with a conversation list, unread badges, and a chat window.
- **Protected routes** — pages that require login (e.g. Add Property, Messages) redirect unauthenticated visitors to the login page.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, React Hook Form, Axios, React-Leaflet, Socket.IO Client |
| Backend | Node.js, Express, Socket.IO |
| Database | MongoDB (Mongoose) |
| Auth | JSON Web Tokens (JWT), bcrypt |
| Maps | Leaflet + OpenStreetMap tiles |
| File uploads | Multer |

## Project structure

```
RealEstate-Project/
├── backend/
│   ├── config/            # Database connection
│   ├── controllers/       # Business logic (auth, properties, conversations)
│   ├── middleware/        # JWT auth guard, error handling, file upload
│   ├── models/            # Mongoose schemas (User, Property, Conversation, Message)
│   ├── routes/            # Express route definitions
│   ├── socket/            # Socket.IO event handlers (real-time messaging)
│   ├── uploads/           # Uploaded property images
│   ├── app.js             # Express app configuration
│   └── server.js          # Entry point — HTTP server + Socket.IO + DB connection
│
└── frontend/
    └── src/
        ├── components/    # Reusable UI (Navbar, Footer, ProtectedRoute)
        ├── context/       # Global auth state (AuthContext)
        ├── hooks/         # Custom hooks (useAuth)
        ├── layouts/       # Page layout wrapper (Navbar + Footer)
        ├── pages/         # Route-level pages (Home, Login, Register, AddProperty, PropertyMap, PropertyDetails, Profile, Messages)
        ├── services/      # Centralized API calls (Axios, Socket.IO client)
        ├── styles/        # Per-page CSS
        └── utils/         # Helper utilities (image URLs)
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

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create a new account |
| POST | `/api/auth/login` | Public | Log in and receive a JWT |
| GET | `/api/auth/me` | Authenticated | Get current user profile |

### Properties

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/properties` | Public | List all properties |
| GET | `/api/properties/:id` | Public | Get one property |
| POST | `/api/properties` | Authenticated | Create a property |
| PUT | `/api/properties/:id` | Authenticated, owner only | Update a property |
| DELETE | `/api/properties/:id` | Authenticated, owner only | Delete a property |

### Conversations & Messaging

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/conversations` | Authenticated | List user's conversations |
| POST | `/api/conversations` | Authenticated | Find or create a conversation for a property |
| GET | `/api/conversations/:id` | Authenticated, participant only | Get a single conversation |
| GET | `/api/conversations/:id/messages` | Authenticated, participant only | Get all messages in a conversation |
| POST | `/api/conversations/:id/read` | Authenticated, participant only | Mark unread messages as read |

### Socket.IO events

| Event | Direction | Description |
|---|---|---|
| `join_conversation` | Client → Server | Join a conversation room |
| `leave_conversation` | Client → Server | Leave a conversation room |
| `send_message` | Client → Server | Send a message (server determines sender from JWT) |
| `message_read` | Client → Server | Mark messages as read |
| `new_message` | Server → Client | New message broadcast to room |
| `messages_marked_read` | Server → Client | Notify that messages were read |
| `conversation_updated` | Server → Client | Inbox-level update (last message changed) |
| `error_message` | Server → Client | Error notification |

## Real-time messaging architecture

1. User clicks **Send Message** on a property detail page.
2. A REST call finds or creates a conversation (user + owner + property).
3. User is redirected to the Messages page with the conversation open.
4. The frontend connects to Socket.IO with the user's JWT token.
5. The server authenticates the socket and the user joins the conversation room.
6. Messages are sent via socket, saved to MongoDB, and broadcast to the room in real time.
7. Both participants see new messages immediately without refreshing.

## Roadmap / possible improvements

- Role-based accounts (e.g. distinguishing buyers, owners, and admins).
- Pagination for the property list and messages as data grows.
- Push notifications for new messages.
- Automated tests (backend routes, frontend components).

## Author

Built by Rayen Zakhama as part of an internship project.
