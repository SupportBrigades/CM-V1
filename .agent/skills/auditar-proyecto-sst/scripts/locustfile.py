"""
Locust load testing para endpoint de diagnóstico SST.
Uso: locust -f locustfile.py --headless -u 50 -r 10 -t 60s --host=http://localhost:8000
"""

from locust import HttpUser, task, between
import random


class SSTDiagnosticoUser(HttpUser):
    """Simula usuarios enviando formularios de diagnóstico SST."""
    
    wait_time = between(1, 3)
    
    # Datos de prueba para simular variedad
    empresas = [
        "Construcciones ABC S.A.",
        "Manufactura XYZ Ltda.",
        "Servicios Integrales SAS",
        "Industrias del Valle",
        "Comercializadora Norte"
    ]
    
    actividades = [
        "Construcción",
        "Manufactura",
        "Servicios",
        "Comercio",
        "Transporte"
    ]
    
    @task(3)
    def enviar_diagnostico_completo(self):
        """Tarea principal: envío de diagnóstico completo."""
        payload = {
            "empresa": random.choice(self.empresas),
            "nit": f"{random.randint(800000000, 999999999)}-{random.randint(0,9)}",
            "trabajadores": random.randint(10, 500),
            "actividad_economica": random.choice(self.actividades),
            "tiene_copasst": random.choice([True, False]),
            "tiene_matriz_riesgos": random.choice([True, False]),
            "tiene_plan_emergencia": random.choice([True, False]),
        }
        
        with self.client.post(
            "/api/diagnostico",
            json=payload,
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 422:
                response.failure("Validation error - revisar schema")
            else:
                response.failure(f"Error inesperado: {response.status_code}")
    
    @task(1)
    def health_check(self):
        """Verificación de salud del servidor."""
        self.client.get("/health")


class SSTHighLoadUser(HttpUser):
    """Usuario de alta carga para pruebas de estrés."""
    
    wait_time = between(0.1, 0.5)  # Más agresivo
    
    @task
    def enviar_rapido(self):
        """Envío rápido sin espera."""
        payload = {
            "empresa": "Stress Test Corp",
            "trabajadores": 100,
            "actividad_economica": "Test"
        }
        self.client.post("/api/diagnostico", json=payload)
