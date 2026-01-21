---
name: auditar-proyecto-sst
description: Ejecuta auditorías de producción para proyectos SST. Úsese cuando el usuario mencione "auditoría", "revisar proyecto", "pre-producción", "verificar seguridad", "optimizar rendimiento" o "preparar para deploy".
---

# Auditor Senior de Proyecto SST

Skill de auditoría integral que evalúa rendimiento, escalabilidad, UX, seguridad e integraciones externas siguiendo estándares de producción.

## Cuándo usar esta skill

- Usuario solicita revisión pre-producción
- Se requiere validar rendimiento bajo carga
- Antes de desplegar a producción
- Verificar seguridad de endpoints y secretos
- Auditar integraciones con servicios externos (Make.com)

## Checklist Maestro de Auditoría

Copia y actualiza este checklist durante la ejecución:

```markdown
## Estado de Auditoría CM-V12

### Fase 1: Rendimiento y Capacidad de Tráfico
- [ ] 1.1 Verificar funciones async en FastAPI
- [ ] 1.2 Confirmar uso de httpx.AsyncClient
- [ ] 1.3 Ejecutar benchmark con Locust (50 usuarios)
- [ ] 1.4 Analizar bundle size (npm run build)
- [ ] 1.5 Implementar Code Splitting si JS > 500kb

### Fase 2: Escalabilidad y Contenerización
- [ ] 2.1 Verificar/crear Dockerfile multietapa
- [ ] 2.2 Auditar estado stateless del backend
- [ ] 2.3 Validar configuración de workers en Procfile

### Fase 3: Responsividad y UX
- [ ] 3.1 Probar componentes en iPhone SE (375px)
- [ ] 3.2 Verificar inputMode en campos numéricos
- [ ] 3.3 Ejecutar Lighthouse y evaluar LCP

### Fase 4: Seguridad de Extremo a Extremo
- [ ] 4.1 Validar schemas Pydantic (extra='forbid')
- [ ] 4.2 Auditar CORS (no wildcards en producción)
- [ ] 4.3 Verificar .env en .gitignore

### Fase 5: Integración Segura con Make.com
- [ ] 5.1 Implementar X-Webhook-Token en headers
- [ ] 5.2 Verificar HTTPS en URLs de webhooks
- [ ] 5.3 Implementar manejo de errores 500/429
```

---

## Fase 1: Rendimiento y Capacidad de Tráfico

### 1.1 Auditoría de FastAPI

**Archivo objetivo:** `mi_backend_python/main.py`

Buscar y verificar:
```python
# ✅ CORRECTO: Función async con AsyncClient
async def enviar_a_make(data: dict):
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=data)

# ❌ INCORRECTO: Bloquea el event loop
def enviar_a_make(data: dict):
    response = httpx.post(url, json=data)  # Síncrono
```

### 1.2 Benchmark de Carga

```bash
# Instalar Locust
pip install locust

# Crear archivo de prueba
cat > locustfile.py << 'EOF'
from locust import HttpUser, task, between

class DiagnosticoUser(HttpUser):
    wait_time = between(1, 3)
    
    @task
    def enviar_diagnostico(self):
        payload = {
            "empresa": "Test Corp",
            "trabajadores": 50,
            "actividad_economica": "Manufactura"
        }
        self.client.post("/api/diagnostico", json=payload)
EOF

# Ejecutar prueba: 50 usuarios, spawn rate 10/s
locust -f locustfile.py --headless -u 50 -r 10 -t 60s --host=http://localhost:8000
```

**Criterios de éxito:**
- P95 latencia < 500ms
- 0% errores bajo 50 usuarios concurrentes
- No memory leaks observados

### 1.3 Análisis de Bundle

```bash
npm run build
# Revisar dist/assets/*.js
# Si algún chunk > 500kb, implementar lazy loading
```

**Implementar Code Splitting si es necesario:**
```tsx
// src/App.tsx
import { lazy, Suspense } from 'react';

const SSTDiagnosis = lazy(() => import('./pages/SSTDiagnosis'));
const ConfirmationPage = lazy(() => import('./pages/ConfirmationPage'));

// En el Router, envolver con Suspense
<Suspense fallback={<LoadingSpinner />}>
  <SSTDiagnosis />
</Suspense>
```

---

## Fase 2: Escalabilidad y Contenerización

### 2.1 Dockerfile Multietapa

**Archivo:** `Dockerfile` (raíz del proyecto)

```dockerfile
# Etapa 1: Build del Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 2: Backend + Estáticos
FROM python:3.11-slim
WORKDIR /app

COPY mi_backend_python/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY mi_backend_python/ .
COPY --from=frontend-builder /app/dist ./static

ENV PORT=8000
EXPOSE 8000

CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "main:app", "--bind", "0.0.0.0:8000"]
```

### 2.2 Auditoría de Estado Stateless

**Verificar en `main.py`:**
- ❌ No debe existir: `sessions = {}` o `cache = []`
- ❌ No debe existir: escritura a archivos locales para sesiones
- ✅ Todo estado debe ir a Redis/DB externa si es necesario

```bash
# Buscar variables globales sospechosas
grep -n "^[a-z_]* = \[\]" mi_backend_python/main.py
grep -n "^[a-z_]* = {}" mi_backend_python/main.py
```

### 2.3 Configuración de Workers

**Archivo:** `Procfile`

```
web: gunicorn -w ${WEB_CONCURRENCY:-4} -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:$PORT
```

---

## Fase 3: Responsividad y UX

### 3.1 Componentes Críticos a Probar

| Componente | Archivo | Verificar |
|------------|---------|-----------|
| Cuestionario | `InteractiveQuestionnaire.tsx` | Scroll, botones táctiles |
| Dropdown | `CargoDropdown.tsx` | Selección en touch |
| Formulario | `CompanyDataForm.tsx` | Inputs, validación |

**Viewport de prueba:** `375 x 667` (iPhone SE)

### 3.2 Validación de Inputs

```tsx
// ✅ CORRECTO para campos numéricos
<Input 
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  placeholder="Número de trabajadores"
/>

// ❌ INCORRECTO: abre teclado alfanumérico
<Input type="text" placeholder="Número de trabajadores" />
```

### 3.3 Lighthouse

```bash
# Servir build de producción
npx serve dist -l 3000

# En Chrome DevTools > Lighthouse
# Métricas objetivo:
# - LCP < 2.5s
# - FID < 100ms
# - CLS < 0.1
```

---

## Fase 4: Seguridad de Extremo a Extremo

### 4.1 Schemas Pydantic

```python
# ✅ CORRECTO: Rechaza campos extra
from pydantic import BaseModel, ConfigDict

class DiagnosticoRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    empresa: str
    trabajadores: int
    # ... campos definidos
```

### 4.2 Auditoría CORS

```python
# ❌ PELIGROSO en producción
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # NUNCA en prod
)

# ✅ SEGURO
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://tu-dominio.com",
        "https://www.tu-dominio.com",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

### 4.3 Gestión de Secretos

```bash
# Verificar que .env está ignorado
cat .gitignore | grep -E "^\.env$|^\.env\."

# Verificar que no hay secretos en el repo
git log --all --full-history -- "*.env"
git log --all --full-history -- "**/secrets*"
```

---

## Fase 5: Integración Segura con Make.com

### 5.1 Firma del Webhook

```python
import os
import httpx

async def enviar_a_make(data: dict):
    webhook_url = os.getenv("MAKE_WEBHOOK_URL")
    auth_token = os.getenv("MAKE_AUTH_TOKEN")
    
    # Validar HTTPS
    if not webhook_url.startswith("https://"):
        raise ValueError("Webhook URL debe usar HTTPS")
    
    headers = {
        "Content-Type": "application/json",
        "X-Webhook-Token": auth_token
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            webhook_url,
            json=data,
            headers=headers,
            timeout=30.0
        )
        return response
```

### 5.2 Manejo de Errores y Reintentos

```python
from fastapi import BackgroundTasks

async def enviar_a_make_con_reintentos(data: dict, intentos: int = 3):
    for intento in range(intentos):
        try:
            response = await enviar_a_make(data)
            
            if response.status_code == 200:
                return {"status": "enviado"}
            elif response.status_code == 429:
                # Rate limit - esperar y reintentar
                await asyncio.sleep(2 ** intento)
                continue
            elif response.status_code >= 500:
                # Error de Make - reintentar
                await asyncio.sleep(1)
                continue
                
        except httpx.TimeoutException:
            if intento == intentos - 1:
                # Último intento fallido
                return {
                    "status": "encolado",
                    "mensaje": "Tu informe se procesará en unos minutos"
                }
    
    return {"status": "error", "mensaje": "Servicio temporalmente no disponible"}
```

### 5.3 Configuración en Make.com

1. Añadir módulo **Filter** después del Webhook
2. Condición: `{{1.headers.x-webhook-token}}` igual a `{{MAKE_AUTH_TOKEN}}`
3. Si no coincide, detener el escenario

---

## Recursos

- [scripts/locustfile.py](scripts/locustfile.py) - Archivo de pruebas de carga
- [scripts/audit-security.sh](scripts/audit-security.sh) - Script de auditoría de seguridad

## Reporte Final

Al completar la auditoría, generar reporte en:
`walkthrough.md` con:
- Estado de cada fase (✅ Aprobado / ⚠️ Requiere atención / ❌ Crítico)
- Métricas obtenidas (latencia, bundle size, Lighthouse scores)
- Cambios implementados
- Recomendaciones pendientes
