"""
Locust Load Testing Script para CM-V8 SST Diagnosis API
========================================================
Simula 50 usuarios concurrentes enviando diagnósticos SST.

Uso:
    pip install locust
    locust -f locustfile.py --users 50 --spawn-rate 10 --run-time 60s --headless
    
    O con interfaz web:
    locust -f locustfile.py
    # Abrir http://localhost:8089
"""

from locust import HttpUser, task, between
import random
import string


class SSTDiagnosisUser(HttpUser):
    """
    Usuario simulado que completa el formulario de diagnóstico SST.
    Cada usuario espera entre 1-3 segundos entre requests para simular
    comportamiento realista de llenado de formulario.
    """
    wait_time = between(1, 3)
    host = "http://localhost:8000"
    
    # Lista de cargos típicos para datos realistas
    CARGOS = [
        "Gerente General", 
        "Jefe de RRHH", 
        "Supervisor SST",
        "Administrador",
        "Coordinador de Operaciones",
        "Gerente de Planta",
        "Jefe de Producción",
        "Asistente Administrativo"
    ]
    
    # Tipos de empresa según el modelo Pydantic
    TIPOS_EMPRESA = ["micro", "pequena", "no_mype"]
    
    # Preguntas del cuestionario SST (q1 a q41)
    PREGUNTAS = [f"q{i}" for i in range(1, 42)]
    
    def _generate_random_string(self, length: int = 8) -> str:
        """Genera un string aleatorio para datos únicos."""
        return ''.join(random.choices(string.ascii_lowercase, k=length))
    
    def _generate_phone(self) -> str:
        """Genera número de teléfono peruano válido."""
        return f"9{random.randint(10000000, 99999999)}"
    
    def _generate_payload(self) -> dict:
        """
        Genera un payload realista basado en el esquema DatosFormulario de Pydantic.
        
        Esquema esperado por el backend:
        - nombre: str
        - email: str
        - telefono: str
        - empresa: str
        - cargo: str
        - numero_trabajadores: int
        - tipo_empresa: str ('micro', 'pequena', 'no_mype')
        - respuestas: Dict[str, str] (q1-q41 con valores 'si' o 'no')
        """
        user_id = random.randint(1, 10000)
        
        return {
            "nombre": f"Usuario Test {user_id}",
            "email": f"test.user{user_id}@empresa{random.randint(1, 100)}.com.pe",
            "telefono": self._generate_phone(),
            "empresa": f"Empresa de Prueba {random.randint(1, 500)} SAC",
            "cargo": random.choice(self.CARGOS),
            "numero_trabajadores": random.randint(1, 500),
            "tipo_empresa": random.choice(self.TIPOS_EMPRESA),
            "respuestas": {
                pregunta: random.choice(["si", "no"]) 
                for pregunta in self.PREGUNTAS
            }
        }
    
    @task(10)  # Peso alto - este es el flujo principal
    def submit_diagnosis(self):
        """
        Simula el envío completo de un diagnóstico SST.
        Este es el endpoint crítico que conecta con Make.com webhooks.
        """
        payload = self._generate_payload()
        
        with self.client.post(
            "/api/diagnostico",
            json=payload,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            catch_response=True,
            name="/api/diagnostico [POST]"
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 422:
                # Error de validación Pydantic
                response.failure(f"Validation Error: {response.text[:100]}")
            elif response.status_code == 500:
                # Error del servidor (posible fallo de webhook)
                response.failure(f"Server Error: {response.text[:100]}")
            else:
                response.failure(f"Unexpected Status: {response.status_code}")
    
    @task(1)  # Peso bajo - verificación de salud
    def health_check(self):
        """
        Verifica que el servidor esté respondiendo.
        Útil para detectar si el servidor se cae bajo carga.
        """
        with self.client.get(
            "/",
            catch_response=True,
            name="/ [GET - Health]"
        ) as response:
            # FastAPI devuelve 404 si no hay ruta raíz definida, pero eso está OK
            if response.status_code in [200, 404]:
                response.success()
            else:
                response.failure(f"Health check failed: {response.status_code}")


class HeavyLoadUser(HttpUser):
    """
    Usuario de carga pesada para pruebas de estrés.
    Envía requests más rápido sin esperas largas.
    Usar con --tags heavy para activar.
    """
    wait_time = between(0.1, 0.5)  # Muy agresivo
    host = "http://localhost:8000"
    weight = 1  # Menor peso que el usuario normal
    
    @task
    def rapid_diagnosis(self):
        """Envío rápido de diagnósticos para pruebas de estrés."""
        payload = {
            "nombre": "Stress Test User",
            "email": f"stress{random.randint(1,100000)}@test.com",
            "telefono": "999999999",
            "empresa": "Stress Test Corp",
            "cargo": "Tester",
            "numero_trabajadores": random.randint(1, 100),
            "tipo_empresa": random.choice(["micro", "pequena", "no_mype"]),
            "respuestas": {f"q{i}": random.choice(["si", "no"]) for i in range(1, 42)}
        }
        
        self.client.post(
            "/api/diagnostico",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
