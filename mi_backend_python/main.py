# main.py
import logging
import os
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
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ValidationError

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

app = FastAPI()

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
    nombre: str
    email: str
    telefono: str
    empresa: str
    cargo: str
    numero_trabajadores: int
    tipo_empresa: str
    respuestas: Dict[str, str]

@app.post("/api/diagnostico")
async def ejecutar_diagnostico(request: Request):
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
    
    # LOG de depuración - ver exactamente qué se envía
    logging.info(f"=== DATOS ENVIADOS A MAKE ===")
    logging.info(f"monto_multa_soles enviado: {data_to_insert['monto_multa_soles']}")
    logging.info(f"resultado['multa']: {resultado['multa']}")
    async with httpx.AsyncClient() as client:
        try:
            # Enviamos los datos al Webhook de Make
            response = await client.post(MAKE_WEBHOOK_URL, json=data_to_insert)
            response.raise_for_status() # Lanza error si el status no es 200-299
            
            logging.info(f"Diagnóstico enviado exitosamente a Make para: {resultado['lead']['empresa']}")

        except httpx.HTTPError as e:
            # Usamos logging para registrar el error de conexión
            logging.error(f"Error al enviar a Make: {e}")
            # Retornamos un mensaje genérico al usuario
            return JSONResponse(status_code=500, content={"status": "error", "message": "Error al conectar con el sistema de automatización."})

    return {"status": "success", "message": "Diagnóstico recibido y procesado."}