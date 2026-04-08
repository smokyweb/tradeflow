FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (better-sqlite3) and TypeScript toolchain
RUN apk add --no-cache python3 make g++

# Build frontend (need devDeps: TypeScript, Vite)
COPY frontend/package*.json frontend/
RUN cd frontend && npm install --include=dev
COPY frontend/ frontend/
RUN cd frontend && npx vite build

# Install backend deps with native compilation
COPY backend/package*.json backend/
RUN cd backend && npm install

FROM node:20-alpine

WORKDIR /app

# Need python3/make/g++ at runtime for better-sqlite3 if rebuilding, but binary should be bundled
RUN apk add --no-cache python3 make g++

COPY --from=builder /app/frontend/dist frontend/dist
COPY --from=builder /app/backend/node_modules backend/node_modules
COPY backend/ backend/

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "backend/server.js"]
