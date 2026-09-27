"""Settings for the pytest suite (selected in pyproject.toml)."""

from .base import *

SECRET_KEY = "test-only-secret-key"

# Hashing passwords properly is slow; tests don't need it.
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
