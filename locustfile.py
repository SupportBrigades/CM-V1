from locust import HttpUser, task, between

class DiagnosticoUser(HttpUser):
    wait_time = between(1, 3)
    
    @task
    def enviar_diagnostico(self):
        """Simula el envío de un diagnóstico SST completo."""
        payload = {
            "nombre": "Test User",
            "email": "test@example.com",
            "telefono": "999999999",
            "empresa": "Test Corp",
            "cargo": "Gerente de Operaciones",
            "numero_trabajadores": 50,
            "tipo_empresa": "no_mype",
            "respuestas": {
                "q1": "si",
                "q2": "no",
                "q3": "si",
                "q4": "no",
                "q5": "si",
                "q6": "no",
                "q7": "si",
                "q8": "no"
            }
        }
        with self.client.post("/api/diagnostico", json=payload, catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 422:
                response.failure(f"Validación fallida: {response.text}")
            else:
                response.failure(f"Error {response.status_code}: {response.text}")
