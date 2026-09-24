# ==========================================
# Multi-Stage Dockerfile for Frontend (React/Vite)
# ==========================================

# ------------------------------------------
# Stage 1: Build Stage
# ------------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install all dependencies (including devDependencies required for vite build)
RUN npm ci

# Copy application source files
COPY . .

# Accept build arguments for environment variables
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

# Build static bundle to dist directory
RUN npm run build

# ------------------------------------------
# Stage 2: Serve Stage (Nginx Alpine)
# ------------------------------------------
FROM nginx:alpine AS serve

# Clean default Nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx SPA routing configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from Stage 1 to Nginx HTML directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP port 80
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
