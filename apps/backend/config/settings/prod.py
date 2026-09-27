"""Production settings. Every value without a default must be set in the environment."""

from .base import *
from .base import REST_FRAMEWORK, env

DEBUG = False

SECRET_KEY = env("DJANGO_SECRET_KEY")
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS")
DATABASES = {"default": env.db("DATABASE_URL")}

# Only JSON in production — no browsable API.
REST_FRAMEWORK = {
    **REST_FRAMEWORK,
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
}


# ─── HTTPS & security headers ────────────────────────────────────────────────
# Assumes a proxy/load balancer in front of Django that terminates TLS.

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = env.bool("DJANGO_SECURE_SSL_REDIRECT", default=True)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Start small; raise to 31536000 (1 year) once HTTPS is confirmed working everywhere.
SECURE_HSTS_SECONDS = env.int("DJANGO_SECURE_HSTS_SECONDS", default=60)
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
