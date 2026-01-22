web: sh -c "cd mi_backend_python && gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:${PORT:-8080}"
