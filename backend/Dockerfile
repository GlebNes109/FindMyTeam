FROM python:3.11-slim

WORKDIR /app/backend/src

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY src /app/backend/src

ENV PYTHONPATH=/app/backend/src

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
EXPOSE 8080
