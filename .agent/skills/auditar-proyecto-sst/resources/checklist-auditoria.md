# Checklist de Auditoría Pre-Producción

> Copia este archivo y actualiza el estado según avances.

**Proyecto:** CM-V12  
**Fecha de Auditoría:** ____________________  
**Auditor:** ____________________

---

## Fase 1: Rendimiento y Capacidad de Tráfico

| # | Verificación | Estado | Notas |
|---|-------------|--------|-------|
| 1.1 | Funciones async en FastAPI | ⬜ | |
| 1.2 | Uso de httpx.AsyncClient | ⬜ | |
| 1.3 | Benchmark Locust (50 usuarios) | ⬜ | P95: ___ms |
| 1.4 | Bundle size < 500kb | ⬜ | Tamaño: ___kb |
| 1.5 | Code Splitting implementado | ⬜ | |

**Resultado Fase 1:** ⬜ Aprobado / ⬜ Requiere trabajo

---

## Fase 2: Escalabilidad y Contenerización

| # | Verificación | Estado | Notas |
|---|-------------|--------|-------|
| 2.1 | Dockerfile multietapa existe | ⬜ | |
| 2.2 | Backend es stateless | ⬜ | |
| 2.3 | Procfile con workers configurado | ⬜ | Workers: ___ |

**Resultado Fase 2:** ⬜ Aprobado / ⬜ Requiere trabajo

---

## Fase 3: Responsividad y UX

| # | Verificación | Estado | Notas |
|---|-------------|--------|-------|
| 3.1 | Componentes probados en iPhone SE | ⬜ | |
| 3.2 | inputMode="numeric" en campos | ⬜ | |
| 3.3 | Lighthouse LCP < 2.5s | ⬜ | LCP: ___s |
| 3.4 | Lighthouse CLS < 0.1 | ⬜ | CLS: ___ |

**Resultado Fase 3:** ⬜ Aprobado / ⬜ Requiere trabajo

---

## Fase 4: Seguridad de Extremo a Extremo

| # | Verificación | Estado | Notas |
|---|-------------|--------|-------|
| 4.1 | Pydantic extra='forbid' | ⬜ | |
| 4.2 | CORS sin wildcards | ⬜ | |
| 4.3 | .env en .gitignore | ⬜ | |
| 4.4 | Sin secretos en código | ⬜ | |
| 4.5 | Sin .env en historial Git | ⬜ | |

**Resultado Fase 4:** ⬜ Aprobado / ⬜ Requiere trabajo

---

## Fase 5: Integración Segura con Make.com

| # | Verificación | Estado | Notas |
|---|-------------|--------|-------|
| 5.1 | X-Webhook-Token implementado | ⬜ | |
| 5.2 | URL webhook usa HTTPS | ⬜ | |
| 5.3 | Manejo de errores 500/429 | ⬜ | |
| 5.4 | Filtro configurado en Make | ⬜ | |

**Resultado Fase 5:** ⬜ Aprobado / ⬜ Requiere trabajo

---

## Resumen Ejecutivo

| Fase | Estado |
|------|--------|
| 1. Rendimiento | ⬜ |
| 2. Escalabilidad | ⬜ |
| 3. UX/Responsividad | ⬜ |
| 4. Seguridad | ⬜ |
| 5. Integraciones | ⬜ |

**Decisión Final:** ⬜ LISTO PARA PRODUCCIÓN / ⬜ BLOQUEOS PENDIENTES

---

## Notas Adicionales

```
[Espacio para observaciones, recomendaciones y próximos pasos]
```
