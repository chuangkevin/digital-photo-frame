# Stage 1: Build with dependencies
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Use npm ci for reproducible builds and omit dev dependencies
RUN npm ci --omit=dev

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /app

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application source
COPY . .

# Create directories and set permissions
RUN mkdir -p uploads/media uploads/thumbnails data && \
    chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

EXPOSE 3001

# Start the application
CMD ["node", "server.js"]
