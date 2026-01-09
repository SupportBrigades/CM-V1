# main.py
import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Dict
from dotenv import load_dotenv

load_dotenv()


import pandas as pd
from constants import (
    BASE_DE_DATOS_INFRACCIONES,
    PREGUNTAS_EXENTAS_MYPE,
    TABLA_MULTAS_GENERAL,
    TABLA_MULTAS_MICRO,
    TABLA_MULTAS_PEQUENA,
    VALOR_UIT,
)
import httpx
from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ValidationError
from pathlib import Path

# --- CONFIGURACIÓN DEL LOGGING ---
# Esto configurará el logger para que los mensajes se muestren en la salida
# estándar, que es lo que servicios como Passenger leen para sus archivos de log.
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# --- CONFIGURACIÓN DE URL DE WEBHOOK (MAKE/INTEGROMAT) ---
MAKE_WEBHOOK_URL = os.environ.get("MAKE_WEBHOOK_URL")
if not MAKE_WEBHOOK_URL:
    logging.error("CRITICAL: MAKE_WEBHOOK_URL is missing or empty!")
else:
    logging.info(f"MAKE_WEBHOOK_URL loaded: {MAKE_WEBHOOK_URL[:10]}...")

# --- PEGA AQUÍ TODA TU LÓGICA DE CÁLCULO DE PYTHON ---
# --- PEGA AQUÍ TODA TU LÓGICA DE CÁLCULO DE PYTHON ---
# Los datos estáticos han sido movidos a constants.py
def calcular_multa_sunafil(datos_formulario):
    tipo_empresa = datos_formulario.get("tipo_empresa", "no_mype")
    numero_trabajadores = int(datos_formulario.get("numero_trabajadores", 0))
    respuestas = datos_formulario.get("respuestas", {})
    hallazgos = {'Leves': 0, 'Grave': 0, 'Muy Grave': 0}
    lista_hallazgos_detallada = []
    
    # Contar infracciones por severidad
    for pregunta_id, respuesta in respuestas.items():
        if respuesta.lower() == 'no':
            if (tipo_empresa in ['micro', 'pequena']) and pregunta_id in PREGUNTAS_EXENTAS_MYPE:
                continue
            infraccion = BASE_DE_DATOS_INFRACCIONES.get(pregunta_id)
            if infraccion:
                hallazgos[infraccion['severidad']] += 1
                lista_hallazgos_detallada.append(infraccion)
    
    # Determinar severidad máxima (para el diagnóstico)
    severidad_maxima = 'Ninguna'
    if hallazgos['Muy Grave'] > 0: severidad_maxima = 'Muy Grave'
    elif hallazgos['Grave'] > 0: severidad_maxima = 'Grave'
    elif hallazgos['Leves'] > 0: severidad_maxima = 'Leves'
    
    # NUEVO: Calcular multas ACUMULATIVAS
    monto_multa = 0
    if numero_trabajadores > 0 and sum(hallazgos.values()) > 0:
        if tipo_empresa == 'micro':
            if numero_trabajadores <= 9: columna = str(numero_trabajadores)
            else: columna = '10 y más'
            # Obtener multa unitaria por cada severidad
            multa_leve = TABLA_MULTAS_MICRO.loc['Leves', columna]
            multa_grave = TABLA_MULTAS_MICRO.loc['Grave', columna]
            multa_muy_grave = TABLA_MULTAS_MICRO.loc['Muy Grave', columna]
        elif tipo_empresa == 'pequena':
            if numero_trabajadores <= 5: columna = '1 a 5'
            elif numero_trabajadores <= 10: columna = '6 a 10'
            elif numero_trabajadores <= 20: columna = '11 a 20'
            elif numero_trabajadores <= 30: columna = '21 a 30'
            elif numero_trabajadores <= 40: columna = '31 a 40'
            elif numero_trabajadores <= 50: columna = '41 a 50'
            elif numero_trabajadores <= 60: columna = '51 a 60'
            elif numero_trabajadores <= 70: columna = '61 a 70'
            elif numero_trabajadores <= 99: columna = '71 a 99'
            else: columna = '100 y más'
            # Obtener multa unitaria por cada severidad
            multa_leve = TABLA_MULTAS_PEQUENA.loc['Leves', columna]
            multa_grave = TABLA_MULTAS_PEQUENA.loc['Grave', columna]
            multa_muy_grave = TABLA_MULTAS_PEQUENA.loc['Muy Grave', columna]
        else: # No MYPE
            if numero_trabajadores <= 10: rango = '1-10'
            elif numero_trabajadores <= 25: rango = '11-25'
            elif numero_trabajadores <= 50: rango = '26-50'
            elif numero_trabajadores <= 100: rango = '51-100'
            elif numero_trabajadores <= 200: rango = '101-200'
            elif numero_trabajadores <= 300: rango = '201-300'
            elif numero_trabajadores <= 400: rango = '301-400'
            elif numero_trabajadores <= 500: rango = '401-500'
            elif numero_trabajadores <= 600: rango = '501-600'
            elif numero_trabajadores <= 700: rango = '601-700'
            elif numero_trabajadores <= 800: rango = '701-800'
            elif numero_trabajadores <= 900: rango = '801-900'
            else: rango = '901-a-mas'
            # Obtener multa unitaria por cada severidad
            multa_leve = TABLA_MULTAS_GENERAL.loc[rango, 'Leves']
            multa_grave = TABLA_MULTAS_GENERAL.loc[rango, 'Grave']
            multa_muy_grave = TABLA_MULTAS_GENERAL.loc[rango, 'Muy Grave']
        
        # Sumar multas acumulativamente
        monto_multa = (
            hallazgos['Leves'] * multa_leve +
            hallazgos['Grave'] * multa_grave +
            hallazgos['Muy Grave'] * multa_muy_grave
        )
        
        # LOG de depuración
        logging.info(f"=== CÁLCULO MULTA ACUMULATIVA ===")
        logging.info(f"Tipo empresa: {tipo_empresa}, Trabajadores: {numero_trabajadores}")
        logging.info(f"Hallazgos: Leves={hallazgos['Leves']}, Grave={hallazgos['Grave']}, Muy Grave={hallazgos['Muy Grave']}")
        logging.info(f"Multas unitarias: Leve={multa_leve}, Grave={multa_grave}, Muy Grave={multa_muy_grave}")
        logging.info(f"MONTO TOTAL ACUMULATIVO: {monto_multa}")
    
    return {
        "lead": {"nombre": datos_formulario.get("nombre"), "empresa": datos_formulario.get("empresa"), "cargo": datos_formulario.get("cargo"), "numero_trabajadores": numero_trabajadores, "tipo_empresa": tipo_empresa.replace('_', ' ').title()},
        "diagnostico": {"severidad_maxima": severidad_maxima, "total_incumplimientos": sum(hallazgos.values()), "resumen_hallazgos": hallazgos, "detalle_hallazgos": lista_hallazgos_detallada},
        "multa": {"monto_final_soles": float(monto_multa)}
    }
# --- FIN DE TU LÓGICA ---

# --- LIFESPAN: Cliente HTTP compartido para mejor rendimiento ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestiona el ciclo de vida del cliente HTTP compartido.
    
    Beneficios de rendimiento:
    - Reutiliza conexiones TCP (connection pooling)
    - Evita overhead de crear cliente por cada request
    - Timeout configurado para evitar requests colgados
    """
    app.state.http_client = httpx.AsyncClient(
        timeout=httpx.Timeout(30.0, connect=10.0),
        limits=httpx.Limits(max_connections=100, max_keepalive_connections=20)
    )
    logging.info("Cliente HTTP compartido inicializado")
    yield
    await app.state.http_client.aclose()
    logging.info("Cliente HTTP compartido cerrado")

app = FastAPI(lifespan=lifespan)

# Permitir la comunicación con tu app de React (CORS)
origins = [ "https://calculadora.supportbrigades.com", "http://localhost:8080", "http://localhost:8081", "http://localhost:5173" ]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DatosFormulario(BaseModel):
    """Modelo de datos del formulario SST con protección contra inyección de campos."""
    model_config = {"extra": "forbid"}
    
    nombre: str
    email: str
    telefono: str
    empresa: str
    cargo: str
    numero_trabajadores: int
    tipo_empresa: str
    respuestas: Dict[str, str]


# --- HEALTH CHECK ENDPOINT ---
# Permite a los servicios cloud (Google Cloud Run, Kubernetes, etc.)
# verificar que la aplicación está funcionando antes de enviar tráfico
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


# --- CONFIGURACIÓN DE AUTENTICACIÓN DE WEBHOOK ---
MAKE_AUTH_TOKEN = os.environ.get("MAKE_AUTH_TOKEN")
if not MAKE_AUTH_TOKEN:
    logging.warning("⚠️ MAKE_AUTH_TOKEN no configurado - webhook sin autenticación")
else:
    logging.info("🔐 MAKE_AUTH_TOKEN cargado correctamente")

# --- VALIDACIÓN DE PROTOCOLO HTTPS ---
def validar_protocolo_https(url: str) -> bool:
    """Valida que la URL del webhook utilice protocolo HTTPS.
    
    Returns:
        bool: True si es HTTPS, False si es HTTP inseguro
    """
    if url and url.startswith("http://") and "localhost" not in url:
        logging.critical("🚨 ALERTA CRÍTICA: MAKE_WEBHOOK_URL usa HTTP inseguro!")
        logging.critical("🚨 Los datos se transmitirían sin cifrado TLS.")
        logging.critical("🚨 Cambie a https:// inmediatamente en su archivo .env")
        return False
    elif url and url.startswith("https://"):
        logging.info("✅ Protocolo HTTPS validado correctamente")
        return True
    return True  # localhost permitido para desarrollo


# Validar protocolo al inicio
if MAKE_WEBHOOK_URL:
    validar_protocolo_https(MAKE_WEBHOOK_URL)


# --- FUNCIÓN BACKGROUND: Envío asíncrono a Make.com ---
async def enviar_a_make_background(
    data: dict, 
    http_client: httpx.AsyncClient,
    empresa: str
):
    """Envía datos a Make.com en background con seguridad reforzada.
    
    Esta función se ejecuta DESPUÉS de que el usuario recibe su respuesta,
    eliminando la latencia del webhook de la experiencia del usuario.
    
    Características de seguridad:
    - Encabezado X-Webhook-Token para autenticación
    - Validación de protocolo HTTPS
    - Reintentos con backoff exponencial
    - Manejo específico de errores 500 (Make Down) y 429 (Rate Limit)
    """
    import asyncio
    
    max_retries = 3
    base_delay = 2  # segundos
    
    # Validación de seguridad del protocolo
    if MAKE_WEBHOOK_URL and MAKE_WEBHOOK_URL.startswith("http://") and "localhost" not in MAKE_WEBHOOK_URL:
        logging.error(f"❌ [Background] Envío BLOQUEADO para {empresa}: protocolo HTTP inseguro detectado")
        return
    
    # Construir headers de autenticación
    headers = {}
    if MAKE_AUTH_TOKEN:
        headers["X-Webhook-Token"] = MAKE_AUTH_TOKEN
        logging.debug(f"🔐 [Background] Header de autenticación incluido para: {empresa}")
    else:
        logging.warning(f"⚠️ [Background] Enviando sin autenticación para: {empresa}")
    
    for attempt in range(max_retries):
        try:
            response = await http_client.post(
                MAKE_WEBHOOK_URL,
                json=data,
                headers=headers
            )
            response.raise_for_status()
            logging.info(f"✅ [Background] Diagnóstico enviado a Make para: {empresa} (intento {attempt + 1})")
            return  # Éxito, salir
            
        except httpx.HTTPStatusError as e:
            status_code = e.response.status_code
            
            # Error 500: Make.com caído
            if status_code >= 500:
                logging.error(
                    f"🔴 [Background] Make.com DOWN (HTTP {status_code}) para {empresa}. "
                    f"Intento {attempt + 1}/{max_retries}. El servidor NO se detuvo."
                )
                if attempt < max_retries - 1:
                    delay = base_delay * (2 ** attempt)  # Backoff exponencial
                    logging.info(f"⏳ [Background] Reintentando en {delay}s...")
                    await asyncio.sleep(delay)
                else:
                    logging.error(
                        f"❌ [Background] Error definitivo (Make Down) para {empresa}. "
                        f"Datos NO entregados. Considere implementar cola persistente."
                    )
            
            # Error 429: Rate Limit
            elif status_code == 429:
                retry_after = e.response.headers.get("Retry-After", "60")
                logging.warning(
                    f"🟡 [Background] RATE LIMIT (HTTP 429) para {empresa}. "
                    f"Make solicita esperar {retry_after}s."
                )
                if attempt < max_retries - 1:
                    # Respetar Retry-After si está disponible
                    try:
                        delay = min(int(retry_after), 60)  # Máximo 60s de espera
                    except ValueError:
                        delay = base_delay * (2 ** attempt)
                    logging.info(f"⏳ [Background] Procesamiento en cola. Reintentando en {delay}s...")
                    await asyncio.sleep(delay)
                else:
                    logging.error(
                        f"❌ [Background] Rate limit persistente para {empresa}. "
                        f"Datos en cola excedieron reintentos."
                    )
            
            # Otros errores HTTP
            else:
                logging.warning(
                    f"⚠️ [Background] Error HTTP {status_code} para {empresa}. "
                    f"Intento {attempt + 1}/{max_retries}"
                )
                if attempt < max_retries - 1:
                    await asyncio.sleep(base_delay * (2 ** attempt))
                else:
                    logging.error(f"❌ [Background] Error definitivo (HTTP {status_code}) para {empresa}")
                    
        except httpx.TimeoutException as e:
            logging.warning(
                f"⏱️ [Background] Timeout al enviar a Make para {empresa}. "
                f"Intento {attempt + 1}/{max_retries}: {e}"
            )
            if attempt < max_retries - 1:
                await asyncio.sleep(base_delay * (2 ** attempt))
            else:
                logging.error(f"❌ [Background] Timeout definitivo para {empresa}")
                
        except httpx.HTTPError as e:
            logging.warning(
                f"⚠️ [Background] Error de red para {empresa}. "
                f"Intento {attempt + 1}/{max_retries}: {e}"
            )
            if attempt < max_retries - 1:
                await asyncio.sleep(base_delay * (2 ** attempt))
            else:
                logging.error(f"❌ [Background] Error de red definitivo para {empresa}: {e}")

@app.post("/api/diagnostico")
async def ejecutar_diagnostico(request: Request, background_tasks: BackgroundTasks):
    try:
        json_data = await request.json()
        datos = DatosFormulario.model_validate(json_data)
    except ValidationError as e:
        # Usamos logging para registrar el error de validación
        logging.error(f"Error de validación de Pydantic: {e.errors()}")
        return JSONResponse(status_code=422, content={"detail": e.errors()})

    datos_dict = datos.model_dump()
    resultado = calcular_multa_sunafil(datos_dict)

    data_to_insert = {
        'nombre_lead': resultado['lead']['nombre'],
        'empresa': resultado['lead']['empresa'],
        'cargo_lead': resultado['lead']['cargo'],
        'numero_trabajadores': resultado['lead']['numero_trabajadores'],
        'tipo_empresa': resultado['lead']['tipo_empresa'],
        'severidad_maxima': resultado['diagnostico']['severidad_maxima'],
        'monto_multa_soles': resultado['multa']['monto_final_soles'],
        'total_incumplimientos': resultado['diagnostico']['total_incumplimientos'],
        'resultado_completo_json': resultado,
        'email_lead': datos.email,
        'telefono_lead': datos.telefono,
        'created_at': datetime.now().isoformat()
    }
    
    # LOG de depuración
    logging.info(f"=== DIAGNÓSTICO PROCESADO ===")
    logging.info(f"Empresa: {resultado['lead']['empresa']}")
    logging.info(f"Multa calculada: S/ {data_to_insert['monto_multa_soles']:.2f}")
    
    # ✨ ENVÍO ASÍNCRONO: El usuario NO espera a Make.com
    # La tarea se ejecuta en background después de enviar la respuesta
    webhook_status = "🟢 activo" if MAKE_WEBHOOK_URL else "🔴 no configurado"
    auth_status = "🔐 autenticado" if MAKE_AUTH_TOKEN else "⚠️ sin autenticación"
    
    if MAKE_WEBHOOK_URL:
        background_tasks.add_task(
            enviar_a_make_background,
            data_to_insert,
            request.app.state.http_client,
            resultado['lead']['empresa']
        )
        logging.info(
            f"📤 Tarea ENCOLADA exitosamente para: {resultado['lead']['empresa']} | "
            f"Webhook: {webhook_status} | Auth: {auth_status}"
        )
    else:
        logging.warning(
            f"⚠️ Tarea NO encolada para: {resultado['lead']['empresa']} - "
            f"MAKE_WEBHOOK_URL no configurado"
        )
    
    # Respuesta INMEDIATA al usuario (no espera el webhook)
    return {
        "status": "success", 
        "message": "Diagnóstico recibido y procesado.",
        "diagnostico": {
            "severidad_maxima": resultado['diagnostico']['severidad_maxima'],
            "total_incumplimientos": resultado['diagnostico']['total_incumplimientos'],
            "monto_multa_soles": resultado['multa']['monto_final_soles']
        }
    }


# ==============================================================================
# SERVIR ARCHIVOS ESTÁTICOS DEL FRONTEND (Solo en producción/Docker)
# ==============================================================================
# Este bloque permite que el contenedor sea "todo en uno", sirviendo tanto
# la API como el frontend de React desde el mismo servidor.
# La carpeta "static" se crea durante el build del Dockerfile.
# ==============================================================================

STATIC_DIR = Path(__file__).parent / "static"

if STATIC_DIR.exists():
    # Montar archivos estáticos en la raíz
    # html=True permite servir index.html automáticamente
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
    logging.info(f"📁 Frontend estático montado desde: {STATIC_DIR}")
    
    # Manejador para SPA: cualquier ruta no encontrada sirve index.html
    # Esto permite que React Router maneje las rutas del frontend
    @app.exception_handler(404)
    async def spa_fallback(request: Request, exc):
        # Solo aplicar fallback si no es una ruta de API
        if not request.url.path.startswith("/api"):
            index_path = STATIC_DIR / "index.html"
            if index_path.exists():
                return FileResponse(str(index_path))
        # Si es una ruta de API o index.html no existe, retornar 404 normal
        return JSONResponse(status_code=404, content={"detail": "Not found"})
else:
    logging.info("⚠️ Carpeta 'static' no encontrada - modo desarrollo (frontend separado)")