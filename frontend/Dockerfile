# ─── Stage 1: Build Angular ──────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ─── Stage 2: Serve with nginx ────────────────────────────────────────
FROM nginx:alpine
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html
# nginx SPA fallback — route all 404s back to index.html for Angular Router
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; try_files $uri $uri/ /index.html; } }' \
    > /etc/nginx/conf.d/default.conf
EXPOSE 80
