"""Local development settings. Used by default by manage.py."""

from .base import *
from .base import env

DEBUG = True

SECRET_KEY = env("DJANGO_SECRET_KEY", default="django-insecure-dev-only-do-not-use-in-production")

# With DEBUG on and ALLOWED_HOSTS empty, Django already allows localhost/127.0.0.1.
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=[])

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
