FROM python:3.11-slim

WORKDIR /app

# Prevent Python from writing pyc files and keep stdout unbuffered
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user for security (OWASP requirement)
RUN useradd -m gcsuser && chown -R gcsuser /app
USER gcsuser

EXPOSE 5000

# Use Gunicorn for production-ready serving in real life, but for dev we use Flask dev server via docker-compose
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=5000"]
