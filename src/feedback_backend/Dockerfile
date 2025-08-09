FROM python:3.9-slim AS build

WORKDIR /app 

COPY requirements.txt .

ENV PYTHONUNBUFFERED=1 
ENV PYTHONDONTWRITEBYTECODE=1

RUN pip install --no-cache-dir --target install -r requirements.txt

COPY . .


FROM python:3.9-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1 
ENV PYTHONDONTWRITEBYTECODE=1


COPY install /usr/local/lib/python3.9/site-packages/
COPY --from=build /app /app

RUN groupadd -S ahmed && adduser -S ahmed -G ahmed
RUN chown -R ahmed:ahmed /app

USER ahmed


CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "app:app"]