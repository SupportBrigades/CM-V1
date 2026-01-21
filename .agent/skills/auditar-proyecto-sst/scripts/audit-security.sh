#!/bin/bash
# =============================================================================
# Script de Auditoría de Seguridad para Proyecto SST
# Uso: ./audit-security.sh [directorio_proyecto]
# =============================================================================

set -e

PROJECT_DIR="${1:-.}"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "🔐 Auditoría de Seguridad SST"
echo "========================================"
echo ""

# -----------------------------------------------------------------------------
# 1. Verificar .gitignore
# -----------------------------------------------------------------------------
echo "📋 [1/5] Verificando .gitignore..."

check_gitignore() {
    local pattern="$1"
    local file="$2"
    if grep -q "$pattern" "$file" 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} $pattern está ignorado"
        return 0
    else
        echo -e "  ${RED}✗${NC} $pattern NO está en .gitignore"
        return 1
    fi
}

GITIGNORE_OK=true
for gitignore in "$PROJECT_DIR/.gitignore" "$PROJECT_DIR/mi_backend_python/.gitignore"; do
    if [ -f "$gitignore" ]; then
        echo "  Revisando: $gitignore"
        check_gitignore "\.env" "$gitignore" || GITIGNORE_OK=false
        check_gitignore "\.env\.local" "$gitignore" || GITIGNORE_OK=false
    fi
done

# -----------------------------------------------------------------------------
# 2. Buscar secretos hardcodeados
# -----------------------------------------------------------------------------
echo ""
echo "🔍 [2/5] Buscando secretos hardcodeados..."

SECRETS_PATTERNS=(
    "api[_-]?key"
    "secret[_-]?key"
    "password\s*="
    "token\s*="
    "MAKE_WEBHOOK"
)

SECRETS_FOUND=false
for pattern in "${SECRETS_PATTERNS[@]}"; do
    matches=$(grep -rni "$pattern" "$PROJECT_DIR" \
        --include="*.py" \
        --include="*.ts" \
        --include="*.tsx" \
        --include="*.js" \
        --exclude-dir=node_modules \
        --exclude-dir=venv \
        --exclude-dir=.git \
        2>/dev/null | grep -v "os.getenv\|process.env\|\.env" || true)
    
    if [ -n "$matches" ]; then
        echo -e "  ${YELLOW}⚠${NC} Posible secreto encontrado (patrón: $pattern):"
        echo "$matches" | head -5
        SECRETS_FOUND=true
    fi
done

if [ "$SECRETS_FOUND" = false ]; then
    echo -e "  ${GREEN}✓${NC} No se encontraron secretos hardcodeados"
fi

# -----------------------------------------------------------------------------
# 3. Verificar CORS
# -----------------------------------------------------------------------------
echo ""
echo "🌐 [3/5] Auditando configuración CORS..."

MAIN_PY="$PROJECT_DIR/mi_backend_python/main.py"
if [ -f "$MAIN_PY" ]; then
    if grep -q 'allow_origins=\["\*"\]' "$MAIN_PY"; then
        echo -e "  ${RED}✗${NC} CORS permite TODOS los orígenes (wildcard)"
        echo "     Cambiar a dominios específicos en producción"
    elif grep -q "allow_origins" "$MAIN_PY"; then
        echo -e "  ${GREEN}✓${NC} CORS configurado con orígenes específicos"
        grep "allow_origins" "$MAIN_PY" | head -3
    else
        echo -e "  ${YELLOW}⚠${NC} No se encontró configuración CORS"
    fi
else
    echo -e "  ${YELLOW}⚠${NC} No se encontró main.py"
fi

# -----------------------------------------------------------------------------
# 4. Verificar HTTPS en URLs de webhooks
# -----------------------------------------------------------------------------
echo ""
echo "🔒 [4/5] Verificando uso de HTTPS..."

HTTP_URLS=$(grep -rn "http://" "$PROJECT_DIR" \
    --include="*.py" \
    --include="*.ts" \
    --include="*.env.example" \
    --exclude-dir=node_modules \
    --exclude-dir=venv \
    2>/dev/null | grep -v "localhost\|127.0.0.1\|http://schemas" || true)

if [ -n "$HTTP_URLS" ]; then
    echo -e "  ${RED}✗${NC} URLs HTTP encontradas (deben ser HTTPS):"
    echo "$HTTP_URLS" | head -5
else
    echo -e "  ${GREEN}✓${NC} No se encontraron URLs HTTP inseguras"
fi

# -----------------------------------------------------------------------------
# 5. Verificar historial de Git
# -----------------------------------------------------------------------------
echo ""
echo "📜 [5/5] Verificando historial de Git..."

if [ -d "$PROJECT_DIR/.git" ]; then
    ENV_IN_HISTORY=$(git -C "$PROJECT_DIR" log --all --full-history -- "*.env" 2>/dev/null | head -1 || true)
    
    if [ -n "$ENV_IN_HISTORY" ]; then
        echo -e "  ${RED}✗${NC} Archivos .env encontrados en historial de Git"
        echo "     Considera usar: git filter-branch o BFG Repo-Cleaner"
    else
        echo -e "  ${GREEN}✓${NC} No hay archivos .env en el historial"
    fi
else
    echo -e "  ${YELLOW}⚠${NC} No es un repositorio Git"
fi

# -----------------------------------------------------------------------------
# Resumen
# -----------------------------------------------------------------------------
echo ""
echo "========================================"
echo "📊 Resumen de Auditoría"
echo "========================================"

if [ "$GITIGNORE_OK" = true ] && [ "$SECRETS_FOUND" = false ]; then
    echo -e "${GREEN}Estado: APROBADO${NC}"
    echo "El proyecto cumple con los estándares básicos de seguridad."
else
    echo -e "${YELLOW}Estado: REQUIERE ATENCIÓN${NC}"
    echo "Revisar los puntos marcados con ✗ o ⚠ arriba."
fi

echo ""
echo "Auditoría completada: $(date)"
