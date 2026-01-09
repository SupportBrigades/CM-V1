# ==============================================================================
# DOCKERFILE MULTI-STAGE - CM-V8 Production Ready
# ==============================================================================
# Este Dockerfile combina el frontend React (Vite) y el backend FastAPI
# en una sola imagen optimizada para producción.
# ==============================================================================

# ------------------------------------------------------------------------------
# STAGE 1: Build del Frontend (React/Vite)
# ------------------------------------------------------------------------------
# Usamos node:20-alpine por su tamaño reducido (~50MB vs ~350MB de node:20)
FROM node:20-alpine AS frontend-builder

# Directorio de trabajo para el build
WORKDIR /app

# Copiamos primero los archivos de dependencias para aprovechar caché de Docker
# Si package.json no cambia, Docker reutiliza esta capa
COPY package.json package-lock.json ./

# Instalamos dependencias de producción y desarrollo (necesarias para build)
# --frozen-lockfile asegura reproducibilidad exacta
RUN npm ci

# Copiamos el resto del código fuente del frontend
COPY index.html vite.config.ts tsconfig*.json tailwind.config.ts postcss.config.js ./
COPY src/ ./src/
COPY public/ ./public/

# Ejecutamos el build de Vite - genera archivos estáticos en /app/dist
RUN npm run build

# ------------------------------------------------------------------------------
# STAGE 2: Runtime del Backend (Python/FastAPI)
# ------------------------------------------------------------------------------
# python:3.12-slim es la mejor opción: ~150MB, incluye todo lo necesario
# Evitamos alpine para Python porque compilar wheels es problemático
FROM python:3.12-slim AS runtime

# Variables de entorno para optimizar Python en contenedores
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Directorio de trabajo del backend
WORKDIR /app

# Copiamos requirements.txt primero (para caché de Docker)
COPY mi_backend_python/requirements.txt .

# Instalamos dependencias Python sin caché para reducir tamaño de imagen
# Añadimos gunicorn aquí para producción
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copiamos el código del backend
COPY mi_backend_python/*.py ./

# Copiamos el build del frontend desde Stage 1
# Los archivos estáticos quedan en /app/static
COPY --from=frontend-builder /app/dist ./static

# Copiamos el script de inicio
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Puerto expuesto (configurable via variable PORT)
EXPOSE 8000

# Comando de inicio - usa el entrypoint.sh que calcula workers dinámicamente
CMD ["./entrypoint.sh"]
