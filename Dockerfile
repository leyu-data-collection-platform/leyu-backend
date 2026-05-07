# ---------- Stage 1: Build ----------
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Copy package files first (better caching)
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

COPY .env .env
# Build the app
RUN npm run build


# ---------- Stage 2: Production ----------
FROM node:22-alpine AS production

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install pnpm
RUN npm install -g pnpm
# Install only production dependencies
RUN pnpm install --prod

# Copy built files from builder
COPY --from=builder /usr/src/app ./

# Expose port
EXPOSE 3000

# Start the app
CMD ["sh", "-c", "sleep 4 && pnpm run migration:run:prod && pnpm run start"]