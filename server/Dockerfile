# Server Node + Express + Ollama client — Dockerfile
FROM node:20-alpine

WORKDIR /app

# Instalar deps (capa cacheable)
COPY package*.json ./
RUN npm install --omit=optional

# Copiar el resto del código
COPY . .

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3002/api/health || exit 1

CMD ["node", "index.js"]
