# Calculadora de Multas y Sanciones SST

Este proyecto es una herramienta para calcular multas y sanciones en el ámbito de Seguridad y Salud en el Trabajo (SST), desarrollado por **Paul Chuyes**.

## Tecnologías Utilizadas

*   **Frontend:**
    *   Vite
    *   React
    *   TypeScript
    *   shadcn-ui
    *   Tailwind CSS
*   **Backend:**
    *   Python
    *   FastAPI
    *   Python
    *   FastAPI
    *   httpx (para envío a Webhooks)

## Cómo iniciar el proyecto localmente

Sigue estos pasos para configurar y ejecutar el proyecto en tu máquina local.

### Prerrequisitos

*   Node.js y npm (o bun)
*   Python 3 y pip

### Frontend

1.  **Navega a la raíz del proyecto:**
    ```sh
    cd sst-insight-wizard-main
    ```

2.  **Instala las dependencias:**
    ```sh
    npm install
    # O si usas bun
    # bun install
    ```

3.  **Inicia el servidor de desarrollo:**
    ```sh
    npm run dev
    # O si usas bun
    # bun run dev
    ```
    El frontend estará disponible en `http://localhost:5173`.

### Backend

1.  **Navega al directorio del backend:**
    ```sh
    cd sst-insight-wizard-main/mi_backend_python
    ```

2.  **Crea y activa un entorno virtual (recomendado):**
    ```sh
    python -m venv venv
    source venv/bin/activate  # En Windows usa `venv\Scripts\activate`
    ```

3.  **Instala las dependencias de Python:**
    ```sh
    pip install fastapi "pydantic[email]" python-dotenv httpx pandas uvicorn
    ```

4.  **Configura las variables de entorno:**
    Crea un archivo `.env` dentro de la carpeta `mi_backend_python` y añade la URL de tu Webhook:
    ```
    MAKE_WEBHOOK_URL="TU_URL_DE_WEBHOOK_DE_MAKE"
    ```

5.  **Inicia el servidor de FastAPI:**
    '''sh
    uvicorn main:app --reload
    '''
    El backend estará disponible en `http://localhost:8000`.