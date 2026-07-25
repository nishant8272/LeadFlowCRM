# LeadFlowCRM

LeadFlowCRM is a premium full-stack Client Relationship Management (CRM) platform built on Express, React 19, TypeScript, and MongoDB. It uses clean architectural layers (Routes &rarr; Controllers &rarr; Services &rarr; Repositories &rarr; Models) to separate business concerns, and handles advanced features like JWT access/refresh token rotation, historical activity timeline logging, note collaboration, and role-based access permissions.

---

## 🛠️ Technology Stack

### Backend
- **Core**: Node.js, Express, TypeScript
- **Database**: MongoDB & Mongoose ORM
- **Security**: JWT (Access + Refresh Token rotation), Bcrypt, Helmet, CORS, Cookie Parser, Express Rate Limiter
- **Logging**: Winston logger (JSON logs and console logs)
- **Validation**: Zod schema validation
- **Testing**: Jest, Supertest, MongoDB Memory Server

### Frontend
- **Core**: React 19, Vite, TypeScript
- **Routing**: React Router
- **State & Data Fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS v4, custom glassmorphism and animations
- **Forms**: React Hook Form + Zod resolvers
- **Visualizations**: Recharts (Pipeline distribution, top channels, monthly leads, and sales funnel)
- **Testing**: Vitest, React Testing Library, jsdom

---

## 🏗️ Folder Structure

```text
LeadFlowCRM/
├── client/              # React 19 SPA Frontend
│   ├── src/
│   │   ├── api/         # Axios instance with automatic token-refresh interceptors
│   │   ├── components/  # Shared layouts, footers, sidebars, and navbars
│   │   ├── context/     # AuthProvider recovery context
│   │   ├── pages/       # Landing, Login, Dashboard, Leads List, Leads Details, User Mgmt
│   │   ├── routes/      # React Router guards (ProtectedRoute, RoleRoute)
│   │   └── types/       # Global frontend type definitions
│   └── vite.config.ts   # Vite bundler and Vitest test config
│
├── server/              # Express + Mongoose Backend
│   ├── src/
│   │   ├── config/      # DB connection, Winston logging, and Zod env validator
│   │   ├── controllers/ # HTTP controller handlers
│   │   ├── middlewares/ # Auth verification, roles, validation, and error handles
│   │   ├── models/      # Mongoose Schemas (User, Lead, Note, Activity)
│   │   ├── repositories/# Database-layer encapsulations
│   │   ├── routes/      # Router configurations
│   │   ├── services/    # Business services (password hashing, log comparisons)
│   │   ├── types/       # TypeScript declarations
│   │   └── tests/       # Jest integration test suites (memory DB)
│   └── jest.config.js   # Jest runner configuration
│
└── docker-compose.yml   # Single-command local MongoDB setup
```

---

## 🚀 Local Setup Instructions

### Prerequisites
- **Node.js**: `v20.x` or later
- **Docker**: Optional, for running local MongoDB quickly

### 1. Boot up the MongoDB Database
If you have Docker installed, spin up MongoDB using the compose file in the root directory:
```bash
docker-compose up -d
```
Otherwise, ensure you have a local MongoDB daemon running at `mongodb://127.0.0.1:27017/leadflowcrm`.

### 2. Configure Backend Environment
Navigate to the `server/` directory and configure your `.env` file:
```bash
cd server
```
Review the `.env` settings:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/leadflowcrm
JWT_SECRET=supersecretjwtkeyforlocaldevelopmentonly123
JWT_REFRESH_SECRET=anotherrefreshsupersecretjwtkeyforlocaldevonly456
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Install & Start Backend
Run the server package installations and start the dev server:
```bash
npm install
npm run dev
```
The server will boot on `http://localhost:5000` and connect to your database.

### 4. Configure & Start Frontend
Open a new terminal window, navigate to the `client/` folder, and configure `.env`:
```bash
cd client
```
Review `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```
Install dependencies with peer-resolutions and run:
```bash
npm install --legacy-peer-deps
npm run dev
```
The frontend application will start on `http://localhost:3000`.

---

## 🔐 Core Workflows

### Bootstrap Admin User
When registering the very first user on the signup tab, they are automatically promoted to `ADMIN`. Subordinate users created by the Admin default to the `MEMBER` role.

### JWT Access & Refresh Token Rotation
- **Access Tokens**: Expire in 15 minutes, kept exclusively in React memory space.
- **Refresh Tokens**: Expire in 7 days, locked in an HTTP-Only, Secure, SameSite Cookie.
- **Interceptors**: When the frontend Axios client receives a `401 Unauthorized` indicating access token expiry, it catches the request, hits `/auth/refresh` to secure a fresh access token, and retries the failed call seamlessly.

### Roles & Access Matrix
- **Admin**: Create users, delete users, assign leads, view all workspace leads, view analytics dashboard.
- **Member**: View only assigned leads, update lead statuses, add annotations, write notes. Restricted from deleting or creating team users.

### Historical Activity Timber Logging
Every mutation generates an event log:
1. **Lead Created**: Logs initial entry.
2. **Status Pipeline Update**: Traces transition (e.g. from `NEW` to `WON`).
3. **Assignee Change**: Logs previous and new owners.
4. **Note Annotation**: Records note author and excerpt.

---

## 🧪 Testing and Verification

### Backend Tests
Jest executes integration tests inside an in-memory virtual MongoDB engine (`mongodb-memory-server`):
```bash
cd server
npm test
```

### Frontend Tests
Vitest executes client page rendering tests:
```bash
cd client
npm run test
```

---
*Built for Digital Heroes Training Task* - linked to [digitalheroesco.com](https://digitalheroesco.com).
