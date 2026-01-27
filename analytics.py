import os
import sqlite3
import secrets
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
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

@router.get("/logs", response_model=List[SystemLog])
async def get_logs(limit: int = 50, level: Optional[str] = None, username: str = Depends(get_current_username)):
    conn = get_db()
    cursor = conn.cursor()
    
    query = "SELECT rowid as id, timestamp, level, message, module, traceback FROM system_logs"
    params = []
    
    if level:
        query += " WHERE level = ?"
        params.append(level)
        
    query += " ORDER BY timestamp DESC LIMIT ?"
    params.append(limit)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    return [dict(r) for r in rows]

@router.get("/health", response_model=HealthStatus)
async def get_analytics_health(username: str = Depends(get_current_username)):
    conn = get_db()
    cursor = conn.cursor()
    
    # Errores ultimas 24h
    one_day_ago = (datetime.now() - timedelta(days=1)).isoformat()
    cursor.execute(f"SELECT COUNT(*) FROM system_logs WHERE timestamp > '{one_day_ago}' AND level IN ('ERROR', 'CRITICAL')")
    errors_24h = cursor.fetchone()[0]
    
    # Sesiones hoy
    today = datetime.now().strftime("%Y-%m-%d")
    cursor.execute(f"SELECT COUNT(*) FROM sessions WHERE created_at LIKE '{today}%'")
    sessions_today = cursor.fetchone()[0]
    
    status_health = "healthy"
    if errors_24h > 10: status_health = "critical"
    elif errors_24h > 0: status_health = "warning"
    
    return {
        "status": status_health,
        "errors_24h": errors_24h,
        "sessions_today": sessions_today,
        "timestamp": datetime.now().isoformat()
    }
