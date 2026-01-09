#!/bin/bash
# ==============================================================================
# ENTRYPOINT.SH - Script de inicio para Gunicorn con Workers Dinámicos
# ==============================================================================
# Este script calcula automáticamente el número óptimo de workers basado en
# los núcleos de CPU disponibles, usando la fórmula recomendada por Gunicorn.
# ==============================================================================

set -e  # Salir inmediatamente si un comando falla

# --- CÁLCULO DINÁMICO DE WORKERS ---
# Fórmula: (2 x núcleos de CPU) + 1
# Puede ser sobrescrito con la variable de entorno WEB_CONCURRENCY
if [ -z "$WEB_CONCURRENCY" ]; then
    # nproc retorna el número de núcleos de CPU disponibles
    CPU_CORES=$(nproc 2>/dev/null || echo 1)
    WORKERS=$((2 * CPU_CORES + 1))
    echo "🔧 Workers calculados automáticamente: $WORKERS (basado en $CPU_CORES núcleos)"
else
    WORKERS=$WEB_CONCURRENCY
    echo "🔧 Workers configurados via WEB_CONCURRENCY: $WORKERS"
fi

# --- PUERTO ---
# Cloud Run, Heroku, Railway usan la variable PORT
PORT=${PORT:-8000}
echo "🌐 Puerto configurado: $PORT"

# --- INICIO DE GUNICORN ---
echo "🚀 Iniciando Gunicorn con UvicornWorker..."
echo "   - Workers: $WORKERS"
echo "   - Bind: 0.0.0.0:$PORT"

exec gunicorn main:app \
    --workers "$WORKERS" \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind "0.0.0.0:$PORT" \
    --access-logfile - \
    --error-logfile - \
    --capture-output \
    --log-level info
