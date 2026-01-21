"""
Script para poblar la base de datos de analytics con datos de ejemplo.
Esto permite visualizar el dashboard como se vería en producción.
"""
import sqlite3
import uuid
import random
from datetime import datetime, timedelta

# Configuración
ANALYTICS_DB_PATH = "analytics.db"
NUM_SESSIONS = 150  # Número de sesiones a crear
DAYS_BACK = 14  # Datos de los últimos 14 días

# Datos de ejemplo
COUNTRIES = [
    ("Peru", "PE", 45),
    ("Colombia", "CO", 25),
    ("Mexico", "MX", 15),
    ("Argentina", "AR", 8),
    ("Chile", "CL", 5),
    ("Ecuador", "EC", 2),
]

DEVICE_TYPES = ["mobile", "desktop", "tablet"]
DEVICE_WEIGHTS = [55, 40, 5]  # Porcentajes

UTM_SOURCES = [
    ("whatsapp", 30),
    ("facebook", 25),
    ("direct", 20),
    ("google", 10),
    ("instagram", 8),
    ("linkedin", 4),
    ("email", 3),
]

QUESTIONS = [f"q{i}" for i in range(1, 21)]  # 20 preguntas

EMPRESAS = [
    "Constructora Lima SAC",
    "Minera Antamina",
    "Pesquera del Sur",
    "Agroindustrias del Norte",
    "Textiles Modernos",
    "Transportes Unidos",
    "Industrias Metálicas",
    "Servicios Logísticos",
    "Comercial Andina",
    "Alimentos del Pacífico",
]

NOMBRES = [
    "Carlos García", "María López", "Juan Rodríguez", "Ana Martínez",
    "Pedro Sánchez", "Laura Torres", "Diego Flores", "Carmen Ruiz",
    "Miguel Herrera", "Sofia Vargas", "Ricardo Morales", "Patricia Díaz",
]

def random_date(days_back):
    """Genera una fecha aleatoria dentro de los últimos N días."""
    now = datetime.now()
    delta = timedelta(
        days=random.randint(0, days_back),
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59),
        seconds=random.randint(0, 59)
    )
    return now - delta

def weighted_choice(choices_with_weights):
    """Selección ponderada."""
    choices = [c[0] for c in choices_with_weights]
    weights = [c[1] for c in choices_with_weights]
    return random.choices(choices, weights=weights, k=1)[0]

def main():
    conn = sqlite3.connect(ANALYTICS_DB_PATH)
    cursor = conn.cursor()
    
    print("🗑️  Limpiando datos anteriores...")
    cursor.execute("DELETE FROM events")
    cursor.execute("DELETE FROM sessions")
    cursor.execute("DELETE FROM system_logs WHERE message LIKE '%ejemplo%' OR message LIKE '%seed%'")
    conn.commit()
    
    print(f"📊 Generando {NUM_SESSIONS} sesiones de ejemplo...")
    
    sessions_created = 0
    conversions = 0
    
    for i in range(NUM_SESSIONS):
        session_id = str(uuid.uuid4())
        created_at = random_date(DAYS_BACK)
        
        # Seleccionar país
        country_data = weighted_choice([(c, w) for c, code, w in COUNTRIES])
        country_code = [code for c, code, w in COUNTRIES if c == country_data][0]
        
        # Dispositivo y fuente
        device_type = random.choices(DEVICE_TYPES, weights=DEVICE_WEIGHTS, k=1)[0]
        utm_source = weighted_choice(UTM_SOURCES)
        
        # Determinar si la sesión se convierte (tasa ~40%)
        is_converted = random.random() < 0.40
        conversion_amount = 0
        
        if is_converted:
            # Multa entre 5,000 y 150,000 soles
            conversion_amount = random.randint(5000, 150000)
            conversions += 1
        
        # Última actividad (puede ser reciente para usuarios "activos")
        if random.random() < 0.05:  # 5% están activos ahora
            last_activity = datetime.now() - timedelta(seconds=random.randint(0, 60))
        else:
            last_activity = created_at + timedelta(minutes=random.randint(1, 30))
        
        # Insertar sesión
        cursor.execute('''
            INSERT INTO sessions 
            (session_id, created_at, device_info, user_agent, is_converted, 
             conversion_amount, last_activity, country, country_code, 
             device_type, utm_source)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            session_id,
            created_at.isoformat(),
            f"{device_type} device",
            f"Mozilla/5.0 ({device_type})",
            is_converted,
            conversion_amount,
            last_activity.isoformat(),
            country_data,
            country_code,
            device_type,
            utm_source
        ))
        
        # Generar eventos para esta sesión
        event_time = created_at
        
        # Evento: form_start (todos)
        cursor.execute('''
            INSERT INTO events (session_id, event_type, event_data, created_at)
            VALUES (?, ?, ?, ?)
        ''', (session_id, "form_start", None, event_time.isoformat()))
        
        # Evento: form_submit (85% de los que inician)
        if random.random() < 0.85:
            event_time += timedelta(seconds=random.randint(30, 180))
            cursor.execute('''
                INSERT INTO events (session_id, event_type, event_data, created_at)
                VALUES (?, ?, ?, ?)
            ''', (session_id, "form_submit", None, event_time.isoformat()))
            
            # Evento: questionnaire_start (90% de los que envían form)
            if random.random() < 0.90:
                event_time += timedelta(seconds=random.randint(5, 30))
                cursor.execute('''
                    INSERT INTO events (session_id, event_type, event_data, created_at)
                    VALUES (?, ?, ?, ?)
                ''', (session_id, "questionnaire_start", None, event_time.isoformat()))
                
                # Eventos de preguntas
                num_questions = random.randint(5, 20) if is_converted else random.randint(1, 15)
                
                for q_idx in range(num_questions):
                    q_id = QUESTIONS[q_idx]
                    event_time += timedelta(seconds=random.randint(3, 15))
                    
                    # question_viewed
                    cursor.execute('''
                        INSERT INTO events (session_id, event_type, event_data, created_at)
                        VALUES (?, ?, ?, ?)
                    ''', (session_id, f"question_viewed_{q_id}", None, event_time.isoformat()))
                    
                    # question_answered (algunos abandonan en ciertas preguntas)
                    # Pregunta 7 y 12 son las "killer questions"
                    abandon_rate = 0.15 if q_id in ["q7", "q12"] else 0.05
                    if random.random() > abandon_rate or is_converted:
                        event_time += timedelta(seconds=random.randint(2, 10))
                        cursor.execute('''
                            INSERT INTO events (session_id, event_type, event_data, created_at)
                            VALUES (?, ?, ?, ?)
                        ''', (session_id, f"question_answered_{q_id}", None, event_time.isoformat()))
                
                # Evento: confirmation_page_viewed (solo convertidos)
                if is_converted:
                    event_time += timedelta(seconds=random.randint(5, 20))
                    cursor.execute('''
                        INSERT INTO events (session_id, event_type, event_data, created_at)
                        VALUES (?, ?, ?, ?)
                    ''', (session_id, "confirmation_page_viewed", None, event_time.isoformat()))
        
        sessions_created += 1
        if sessions_created % 25 == 0:
            print(f"   ✓ {sessions_created}/{NUM_SESSIONS} sesiones creadas...")
    
    # Agregar logs del sistema con errores recientes para mostrar estados realistas
    print("📝 Generando logs del sistema...")
    
    # Logs históricos (últimos 7 días)
    historical_logs = [
        ("INFO", "Sistema iniciado correctamente", "system.startup"),
        ("INFO", "Base de datos de Analytics inicializada", "database.init"),
        ("WARNING", "Geolocalización fallida para IP privada", "analytics.geo"),
        ("INFO", "Diagnóstico procesado exitosamente", "diagnostico"),
        ("INFO", "Sesión de analytics creada", "analytics.session"),
        ("WARNING", "Rate limit cercano en API externa", "api.external"),
    ]
    
    for level, message, module in historical_logs:
        log_time = random_date(7)
        cursor.execute('''
            INSERT INTO system_logs (timestamp, level, message, module)
            VALUES (?, ?, ?, ?)
        ''', (log_time.isoformat(), level, message, module))
    
    # Errores RECIENTES (últimas 24 horas) para activar WARNING/CRITICAL
    # NOTA: Comentado para que el dashboard muestre HEALTHY por defecto
    # Descomenta esta sección si quieres probar alertas de error
    """
    recent_errors = [
        ("ERROR", "Timeout al conectar con Make.com - webhook no respondió en 30s", "webhook.make"),
        ("ERROR", "Fallo de conexión con servicio de geolocalización IP-API", "analytics.geo"),
        ("WARNING", "Petición rechazada por rate limiting temporal", "api.ratelimit"),
        ("ERROR", "Error de validación en formulario de diagnóstico", "diagnostico.validation"),
    ]
    
    # Insertar errores recientes (dentro de las últimas 24 horas)
    for level, message, module in recent_errors:
        # Generar timestamp aleatorio dentro de las últimas 24 horas
        hours_ago = random.randint(1, 23)
        minutes_ago = random.randint(0, 59)
        log_time = datetime.now() - timedelta(hours=hours_ago, minutes=minutes_ago)
        cursor.execute('''
            INSERT INTO system_logs (timestamp, level, message, module)
            VALUES (?, ?, ?, ?)
        ''', (log_time.isoformat(), level, message, module))
    
    print(f"   ✓ {len(historical_logs)} logs históricos + {len(recent_errors)} errores recientes")
    """
    print(f"   ✓ {len(historical_logs)} logs históricos (sin errores de prueba)")
    
    conn.commit()
    conn.close()
    
    print(f"\n✅ ¡Datos de ejemplo creados exitosamente!")
    print(f"   📊 Sesiones totales: {sessions_created}")
    print(f"   🎯 Conversiones: {conversions} ({conversions/sessions_created*100:.1f}%)")
    print(f"   📅 Rango de fechas: últimos {DAYS_BACK} días")
    print(f"\n👉 Recarga el dashboard para ver los datos!")

if __name__ == "__main__":
    main()
