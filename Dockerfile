FROM node:20-alpine AS builder

WORKDIR /app

# Build frontend (need devDeps for TypeScript + Vite)
COPY frontend/package*.json frontend/
RUN cd frontend && npm install --include=dev
COPY frontend/ frontend/
# Use vite directly to avoid tsc path issues
RUN cd frontend && npx vite build

# Install backend prod deps
COPY backend/package*.json backend/
RUN cd backend && npm install --omit=dev

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/frontend/dist frontend/dist
COPY --from=builder /app/backend/node_modules backend/node_modules
COPY backend/ backend/

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "backend/server.js"]
