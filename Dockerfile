# Trails Lab engine image: the hub, the Python runner and the PostgreSQL client (psql).
# Every trail runs through this one image; the database is the "postgres" service
# in docker-compose.yml.
#
# The Python trail covers 3.14/3.15 features, so the image uses 3.15 by default.
# To pin another version:  docker compose build --build-arg PYTHON_VERSION=3.14
ARG PYTHON_VERSION=3.15
FROM python:${PYTHON_VERSION}-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends postgresql-client \
 && rm -rf /var/lib/apt/lists/*

# Trail code runs as an unprivileged user.
RUN useradd --create-home --uid 1000 lab
WORKDIR /app
COPY engine ./engine
COPY trails ./trails
RUN mkdir -p workspace && chown lab:lab workspace
USER lab

ENV LAB_HOST=0.0.0.0 \
    LAB_PORT=8765 \
    LAB_NO_BROWSER=1 \
    PYTHONUNBUFFERED=1
EXPOSE 8765
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8765/', timeout=2)"
CMD ["python", "engine/hub.py"]
