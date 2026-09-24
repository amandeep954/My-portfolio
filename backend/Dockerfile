# ==========================================
# Production Dockerfile for Backend (Node.js/Express)
# ==========================================
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy package management files first for efficient docker caching
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application source code
COPY . .

# Set Environment Variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose backend service port
EXPOSE 5000

# Switch to non-root user for security best practice
USER node

# Healthcheck configuration
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/skills || exit 1

# Start the production server
CMD ["node", "src/server.js"]
