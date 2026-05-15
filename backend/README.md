# Café Ordering — Backend

Node.js + Express + TypeScript + MongoDB Atlas backend for the café/restaurant ordering system.

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- MongoDB Atlas cluster (or local MongoDB instance)

## Setup

```bash
# Install dependencies
npm install

# Copy environment file and fill in your values
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/cafe-ordering?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
```

## Scripts

| Command             | Description                               |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Start dev server with ts-node-dev (watch) |
| `npm run build`     | Compile TypeScript to `dist/`             |
| `npm start`         | Run compiled JS from `dist/`              |
| `npm run lint`      | Run ESLint                                |
| `npm run typecheck` | Run TypeScript type checking              |
| `npm run format`    | Format with Prettier                      |

## Project Structure

```
backend/
├── tsconfig.json
├── .eslintrc.cjs
├── .prettierrc
├── .env.example
└── src/
    ├── server.ts          # Entry point — loads env, connects DB, starts server
    ├── app.ts             # Express app setup (middleware, health route)
    ├── config/
    │   └── db.ts          # MongoDB Atlas connection
    ├── controllers/       # Route handlers (empty — add as needed)
    ├── models/            # Mongoose schemas (empty — add as needed)
    └── routes/            # Express routers (empty — add as needed)
```
