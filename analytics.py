import os
import sqlite3
import secrets
import uuid
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from pydantic import BaseModel

# Configuración
ANALYTICS_DB = "analytics.db"
start_time = datetime.now()

router = APIRouter(prefix="/api/analytics", tags=["analytics"])
security = HTTPBasic()

# --- MODELOS ---
class KPIsData(BaseModel):
    total_leads: int
    conversion_rate: float
    avg_penalty_amount: float
    active_users: int
    abandonment_rate: float
    total_conversions: int

class CountryData(BaseModel):
    country: str
    country_code: str
    total: int
    conversions: int

class GeoResponse(BaseModel):
    countries: List[CountryData]
    active_by_country: dict
    total_countries: int

class DeviceData(BaseModel):
    device_type: str
    total: int
    conversions: int
    percentage: float

class DevicesResponse(BaseModel):
    devices: List[DeviceData]
    total_sessions: int

class ChannelData(BaseModel):
    source: str
    total: int
    conversions: int
    percentage: float
    conversion_rate: float

class ChannelsResponse(BaseModel):
    channels: List[ChannelData]
    total_sessions: int

class SystemLog(BaseModel):
    id: int
    timestamp: str
    level: str
    message: str
    module: Optional[str] = None
    traceback: Optional[str] = None

class HealthStatus(BaseModel):
    status: str
    errors_24h: int
    sessions_today: int
    timestamp: str

# --- SEGURIDAD ---
def get_current_username(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, os.environ.get("DASHBOARD_USER", "admin"))
    correct_password = secrets.compare_digest(credentials.password, os.environ.get("DASHBOARD_PASSWORD", "123456"))
    
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

# --- DATABASE ---
def get_db():
    conn = sqlite3.connect(ANALYTICS_DB)
    conn.row_factory = sqlite3.Row
    return conn

# --- ENDPOINTS ---

@router.get("/kpis", response_model=KPIsData)
async def get_kpis(start_date: str, end_date: str, username: str = Depends(get_current_username)):
    conn = get_db()
    cursor = conn.cursor()
    
    # Filtro de fecha para SQL
    date_filter = f"created_at BETWEEN '{start_date}T00:00:00' AND '{end_date}T23:59:59'"
    
    # 1. Total Leads (Sesiones)
    cursor.execute(f"SELECT COUNT(*) FROM sessions WHERE {date_filter}")
    total_leads = cursor.fetchone()[0]
    
    # 2. Conversiones
    cursor.execute(f"SELECT COUNT(*) FROM sessions WHERE {date_filter} AND is_converted = 1")
    total_conversions = cursor.fetchone()[0]
    
    # 3. Tasa de conversión
    conversion_rate = round((total_conversions / total_leads * 100), 2) if total_leads > 0 else 0
    
    # 4. Abandono (100 - conversión, simplificado)
    abandonment_rate = round(100 - conversion_rate, 2)
    
    # 5. Multa promedio
    cursor.execute(f"SELECT AVG(conversion_amount) FROM sessions WHERE {date_filter} AND is_converted = 1")
    avg_penalty = cursor.fetchone()[0] or 0
    
    # 6. Usuarios activos (últimos 5 min)
    five_min_ago = (datetime.now() - timedelta(minutes=5)).isoformat()
    cursor.execute(f"SELECT COUNT(*) FROM sessions WHERE last_activity > '{five_min_ago}'")
    active_users = cursor.fetchone()[0]
    
    return {
        "total_leads": total_leads,
        "conversion_rate": conversion_rate,
        "avg_penalty_amount": float(avg_penalty),
        "active_users": active_users,
        "abandonment_rate": abandonment_rate,
        "total_conversions": total_conversions
    }

@router.get("/geo", response_model=GeoResponse)
async def get_geo(start_date: str, end_date: str, username: str = Depends(get_current_username)):
    conn = get_db()
    cursor = conn.cursor()
    date_filter = f"created_at BETWEEN '{start_date}T00:00:00' AND '{end_date}T23:59:59'"
    
    cursor.execute(f"""
        SELECT country, country_code, COUNT(*) as total, 
               SUM(CASE WHEN is_converted = 1 THEN 1 ELSE 0 END) as conversions
        FROM sessions 
        WHERE {date_filter} AND country_code IS NOT NULL
        GROUP BY country_code
        ORDER BY total DESC
    """)
    rows = cursor.fetchall()
    
    countries = [
        {"country": r["country"], "country_code": r["country_code"], "total": r["total"], "conversions": r["conversions"]}
        for r in rows
    ]
    
    # Activos por país
    five_min_ago = (datetime.now() - timedelta(minutes=5)).isoformat()
    cursor.execute(f"SELECT country_code, COUNT(*) FROM sessions WHERE last_activity > '{five_min_ago}' GROUP BY country_code")
    active_rows = cursor.fetchall()
    active_by_country = {r[0]: r[1] for r in active_rows if r[0]}
    
    return {
        "countries": countries,
        "active_by_country": active_by_country,
        "total_countries": len(countries)
    }

@router.get("/devices", response_model=DevicesResponse)
async def get_devices(start_date: str, end_date: str, username: str = Depends(get_current_username)):
    conn = get_db()
    cursor = conn.cursor()
    date_filter = f"created_at BETWEEN '{start_date}T00:00:00' AND '{end_date}T23:59:59'"
    
    cursor.execute(f"SELECT COUNT(*) FROM sessions WHERE {date_filter}")
    total_sessions = cursor.fetchone()[0] or 1
    
    cursor.execute(f"""
        SELECT device_type, COUNT(*) as total, 
               SUM(CASE WHEN is_converted = 1 THEN 1 ELSE 0 END) as conversions
        FROM sessions 
        WHERE {date_filter}
        GROUP BY device_type
    """)
    rows = cursor.fetchall()
    
    devices = []
    for r in rows:
        d_type = r["device_type"] or "unknown"
        total = r["total"]
        devices.append({
            "device_type": d_type,
            "total": total,
            "conversions": r["conversions"],
            "percentage": round((total / total_sessions) * 100, 1)
        })
    
    return {"devices": devices, "total_sessions": total_sessions}

@router.get("/channels", response_model=ChannelsResponse)
async def get_channels(start_date: str, end_date: str, username: str = Depends(get_current_username)):
    conn = get_db()
    cursor = conn.cursor()
    date_filter = f"created_at BETWEEN '{start_date}T00:00:00' AND '{end_date}T23:59:59'"
    
    cursor.execute(f"SELECT COUNT(*) FROM sessions WHERE {date_filter}")
    total_sessions = cursor.fetchone()[0] or 1
    
    cursor.execute(f"""
        SELECT utm_source, COUNT(*) as total, 
               SUM(CASE WHEN is_converted = 1 THEN 1 ELSE 0 END) as conversions
        FROM sessions 
        WHERE {date_filter}
        GROUP BY utm_source
    """)
    rows = cursor.fetchall()
    
    channels = []
    for r in rows:
        source = r["utm_source"] or "direct"
        total = r["total"]
        conversions = r["conversions"]
        channels.append({
            "source": source,
            "total": total,
            "conversions": conversions,
            "percentage": round((total / total_sessions) * 100, 1),
            "conversion_rate": round((conversions / total) * 100, 1) if total > 0 else 0
        })
    
    return {"channels": channels, "total_sessions": total_sessions}
# --- DASHBOARD ENDPOINT ---
@router.get("/dashboard", response_model=dict)
async def get_dashboard_data(start_date: str, end_date: str, username: str = Depends(get_current_username)):
    conn = get_db()
    cursor = conn.cursor()
    
    # Filtros
    date_filter = f"created_at BETWEEN '{start_date}T00:00:00' AND '{end_date}T23:59:59'"
    
    # 1. KPIs (Reutilizando lógica)
    cursor.execute(f"SELECT COUNT(*) FROM sessions WHERE {date_filter}")
    total_leads = cursor.fetchone()[0]
    
    cursor.execute(f"SELECT COUNT(*) FROM sessions WHERE {date_filter} AND is_converted = 1")
    total_conversions = cursor.fetchone()[0]
    
    conversion_rate = round((total_conversions / total_leads * 100), 2) if total_leads > 0 else 0
    abandonment_rate = round(100 - conversion_rate, 2)
    
    cursor.execute(f"SELECT AVG(conversion_amount) FROM sessions WHERE {date_filter} AND is_converted = 1")
    avg_multa = cursor.fetchone()[0] or 0
    
    five_min_ago = (datetime.now() - timedelta(minutes=5)).isoformat()
    cursor.execute(f"SELECT COUNT(*) FROM sessions WHERE last_activity > '{five_min_ago}'")
    active_users = cursor.fetchone()[0]
    
    kpis = {
        "total_leads": total_leads,
        "conversion_rate": conversion_rate,
        "avg_penalty_amount": float(avg_multa),
        "active_users": active_users,
        "abandonment_rate": abandonment_rate,
        "total_conversions": total_conversions
    }
    
    # 2. Funnel (Aproximación por eventos)
    # Definir pasos: form_start -> form_submit -> questionnaire_start -> confirmation_page_viewed
    steps = ["form_start", "form_submit", "questionnaire_start", "confirmation_page_viewed"]
    funnel_counts = {}
    
    for step in steps:
        cursor.execute(f"""
            SELECT COUNT(DISTINCT session_id) 
            FROM events 
            WHERE event_type = '{step}' AND {date_filter}
        """)
        funnel_counts[step] = cursor.fetchone()[0]
    
    # Asegurar orden lógico (descendente) para visualización
    funnel_data = {
        "form_starts": funnel_counts.get("form_start", 0),
        "form_submits": funnel_counts.get("form_submit", 0),
        "questionnaire_starts": funnel_counts.get("questionnaire_start", 0),
        "confirmations": funnel_counts.get("confirmation_page_viewed", 0)
    }
    
    detailed_funnel = [
        {"step": "Formulario Iniciado", "count": funnel_counts["form_start"], "color": "#3B82F6"},
        {"step": "Formulario Enviado", "count": funnel_counts["form_submit"], "color": "#10B981"},
        {"step": "Cuestionario Iniciado", "count": funnel_counts["questionnaire_start"], "color": "#F59E0B"},
        {"step": "Confirmación Vista", "count": funnel_counts["confirmation_page_viewed"], "color": "#6366F1"},
    ]
    
    # 3. Daily Traffic (Últimos N días en el rango)
    # Agrupar por fecha (substr created_at, 0, 10)
    cursor.execute(f"""
        SELECT substr(created_at, 1, 10) as day, 
               COUNT(*) as visits,
               SUM(CASE WHEN is_converted = 1 THEN 1 ELSE 0 END) as completions,
               SUM(CASE WHEN is_converted = 1 THEN conversion_amount ELSE 0 END) as amount
        FROM sessions
        WHERE {date_filter}
        GROUP BY day
        ORDER BY day ASC
    """)
    traffic_rows = cursor.fetchall()
    daily_traffic = [
        {"date": r["day"], "visits": r["visits"], "completions": r["completions"], "total_amount": r["amount"]}
        for r in traffic_rows
    ]
    
    # 4. Preguntas (Dropoff)
    # Buscar eventos question_viewed_X y question_answered_X
    # Asumimos IDs q1..q20
    question_stats = {}
    for i in range(1, 21):
        qid = f"q{i}"
        cursor.execute(f"SELECT COUNT(*) FROM events WHERE event_type = 'question_viewed_{qid}' AND {date_filter}")
        viewed = cursor.fetchone()[0]
        
        cursor.execute(f"SELECT COUNT(*) FROM events WHERE event_type = 'question_answered_{qid}' AND {date_filter}")
        answered = cursor.fetchone()[0]
        
        if viewed > 0:
            dropoff = round(((viewed - answered) / viewed) * 100, 1)
            question_stats[qid] = {"viewed": viewed, "answered": answered, "dropoff_rate": dropoff}
            
    # Killer question (la de mayor dropoff)
    killer_q = None
    if question_stats:
        worst_qid = max(question_stats, key=lambda k: question_stats[k]['dropoff_rate'])
        stats = question_stats[worst_qid]
        killer_q = {
            "question_id": worst_qid,
            "dropoff_rate": stats['dropoff_rate'],
            "viewed": stats['viewed'],
            "abandoned": stats['viewed'] - stats['answered']
        }

    return {
        "kpis": kpis,
        "funnel": funnel_data,
        "detailed_funnel": detailed_funnel,
        "killer_question": killer_q,
        "question_dropoff": question_stats,
        "step_dropoff": {}, # Placeholder
        "daily_traffic": daily_traffic,
        "generated_at": datetime.now().isoformat()
    }


# --- MODELOS DE INPUT PARA TRACKING ---
class SessionInput(BaseModel):
    device_info: str = "unknown"
    referrer: Optional[str] = None
    utm_source: Optional[str] = "direct"

class EventInput(BaseModel):
    session_id: str
    event_type: str
    event_data: Optional[str] = None

class HeartbeatInput(BaseModel):
    session_id: str

# --- ENDPOINTS DE TRACKING (PÚBLICOS - SIN AUTH BÁSICA) ---
# Estos endpoints son llamados por el frontend del usuario, no requieren usuario/pass del dashboard

@router.post("/session", status_code=201)
async def create_session(data: SessionInput, request: Request):
    conn = get_db()
    cursor = conn.cursor()
    
    session_id = str(uuid.uuid4())
    created_at = datetime.now().isoformat()
    
    # Intentar inferir GeoIP (Simulado o headers)
    # En producción real usaríamos una DB de GeoIP o servicio externo
    # Por ahora, extraemos de headers si existen (Cloudflare, etc.)
    country_code = request.headers.get("CF-IPCountry", None) 
    country = "Unknown"
    
    user_agent = request.headers.get("User-Agent", "Unknown")
    
    # Detectar device type simple
    device_type = "desktop"
    ua_lower = user_agent.lower()
    if "mobile" in ua_lower: device_type = "mobile"
    elif "tablet" in ua_lower or "ipad" in ua_lower: device_type = "tablet"
    
    cursor.execute('''
        INSERT INTO sessions 
        (session_id, created_at, device_info, user_agent, is_converted, 
         conversion_amount, last_activity, country, country_code, 
         device_type, utm_source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        session_id,
        created_at,
        data.device_info,
        user_agent,
        0, # Not converted yet
        0,
        created_at, # Last activity = now
        country,
        country_code,
        device_type,
        data.utm_source
    ))
    
    conn.commit()
    
    # Registrar evento inicial
    cursor.execute('INSERT INTO events (session_id, event_type, created_at) VALUES (?, ?, ?)',
                   (session_id, 'session_start', created_at))
    conn.commit()
    
    return {"session_id": session_id}

@router.post("/event", status_code=201)
async def track_event(data: EventInput):
    conn = get_db()
    cursor = conn.cursor()
    created_at = datetime.now().isoformat()
    
    cursor.execute('''
        INSERT INTO events (session_id, event_type, event_data, created_at)
        VALUES (?, ?, ?, ?)
    ''', (data.session_id, data.event_type, data.event_data, created_at))
    
    # Actualizar last_activity
    cursor.execute("UPDATE sessions SET last_activity = ? WHERE session_id = ?", (created_at, data.session_id))
    
    # Lógica de Conversión
    if data.event_type == "confirmation_page_viewed":
        # Marcar como convertido
        amount = 0
        if data.event_data:
            try:
                import json
                event_json = json.loads(data.event_data)
                amount = float(event_json.get("amount", 0))
            except:
                pass
        
        cursor.execute("UPDATE sessions SET is_converted = 1, conversion_amount = ? WHERE session_id = ?", 
                       (amount, data.session_id))
    
    conn.commit()
    return {"status": "ok"}

@router.post("/heartbeat", status_code=200)
async def heartbeat(data: HeartbeatInput):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    
    cursor.execute("UPDATE sessions SET last_activity = ? WHERE session_id = ?", (now, data.session_id))
    conn.commit()
    return {"status": "alive"}

@router.post("/reset", status_code=200)
async def reset_database(username: str = Depends(get_current_username)):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM sessions")
        cursor.execute("DELETE FROM events")
        cursor.execute("DELETE FROM system_logs")
        conn.commit()
        return {"message": "Base de datos reseteada correctamente. Datos eliminados."}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error al resetear DB: {str(e)}")
