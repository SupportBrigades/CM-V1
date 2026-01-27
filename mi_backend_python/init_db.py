
import sqlite3
import logging

def init_db(db_path="analytics.db"):
    """
    Inicializa la base de datos de Analytics con tablas vacías.
    NO inserta datos de prueba.
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    logging.info(f"🔨 Inicializando esquema de base de datos en {db_path}...")
    
    # 1. Tabla SESSIONS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            device_info TEXT,
            user_agent TEXT,
            is_converted BOOLEAN DEFAULT FALSE,
            conversion_amount REAL DEFAULT 0,
            last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
            country TEXT DEFAULT 'Unknown',
            country_code TEXT DEFAULT 'XX',
            ip_address TEXT,
            device_type TEXT DEFAULT "unknown",
            utm_source TEXT DEFAULT "direct",
            utm_medium TEXT,
            utm_campaign TEXT,
            referrer TEXT
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_converted ON sessions(is_converted)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_activity ON sessions(last_activity)")
    
    # 2. Tabla EVENTS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS events (
            event_id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            event_type TEXT NOT NULL,
            event_data TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES sessions(session_id)
        )
    """)
    
    # 3. Tabla SYSTEM_LOGS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            level TEXT NOT NULL,
            message TEXT NOT NULL,
            module TEXT,
            traceback TEXT
        )
    """)
    
    # 4. Tabla ALERT_COOLDOWNS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS alert_cooldowns (
            alert_key TEXT PRIMARY KEY,
            last_sent REAL
        )
    """)
    
    conn.commit()
    conn.close()
    logging.info("✅ Base de datos inicializada (VACÍA).")

if __name__ == "__main__":
    init_db()
