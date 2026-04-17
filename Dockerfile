# Build stage
FROM node:20-alpine AS builder

WORKDIR /workspace

# Copy package files and install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy application sources and build
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /workspace

ENV NODE_ENV=production
ENV PORT=8080

# RUN mkdir -p public

COPY --from=builder /workspace/package.json ./
COPY --from=builder /workspace/node_modules ./node_modules
COPY --from=builder /workspace/.next ./.next
# COPY --from=builder /workspace/public ./public
COPY --from=builder /workspace/next.config.ts ./
COPY --from=builder /workspace/next-env.d.ts ./

EXPOSE 8080
CMD ["npm", "start"]
