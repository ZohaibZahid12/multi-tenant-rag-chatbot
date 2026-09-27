# Backend

Django 6 + Django REST Framework, Python 3.12+.

Root scripts (`npm run dev:backend`, `npm run test`, …) cover day-to-day work. To use Django directly:

```bash
cd apps/backend
source .venv/bin/activate          # created by `npm run setup:backend`

python manage.py runserver         # http://localhost:8000
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser   # login for /admin/
python manage.py startapp <name>   # new domain app — then add it to LOCAL_APPS
pytest                             # tests
ruff check --fix . && ruff format .
```

## Layout

```
apps/backend/
├── config/                  # Project wiring — no business logic here
│   ├── settings/
│   │   ├── base.py          # Shared by every environment
│   │   ├── dev.py           # Default for manage.py
│   │   ├── test.py          # Used by pytest
│   │   └── prod.py          # Used by wsgi.py / asgi.py
│   ├── urls.py              # /admin/, /api/…, /api/docs/
│   ├── wsgi.py
│   └── asgi.py
├── core/                    # Cross-cutting pieces: health check, shared base classes
├── accounts/                # Custom User model (AUTH_USER_MODEL = "accounts.User")
├── requirements/
│   ├── base.txt             # Runtime deps
│   ├── dev.txt              # + Ruff, pytest
│   └── prod.txt             # + gunicorn
├── manage.py
├── pyproject.toml           # Ruff + pytest config
└── .env.example
```

Each domain feature (for example `tenants`, `documents`, `chat`) gets its own Django app next to `core/` and `accounts/`, with this shape:

```
<app>/
├── models.py
├── serializers.py           # Converts models ⇄ JSON and validates input
├── views.py                 # API views / viewsets
├── urls.py                  # Mounted under /api/ in config/urls.py
├── admin.py
├── migrations/
└── tests/test_*.py
```

## Settings & environment

`manage.py` uses `config.settings.dev`; override with `DJANGO_SETTINGS_MODULE`.
Settings read environment variables, and locally also `apps/backend/.env` (copy `.env.example`).

| Variable               | Dev default              | Production |
| ---------------------- | ------------------------- | ---------- |
| `DJANGO_SECRET_KEY`    | insecure dev key          | required   |
| `DJANGO_ALLOWED_HOSTS` | localhost                 | required   |
| `DATABASE_URL`         | SQLite `db.sqlite3`       | required   |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000`   | set it     |

### Database (Postgres)

Local dev uses Postgres, running on this machine at `localhost:5432`, with a database and
role dedicated to this project (not the `postgres` superuser):

```
DATABASE_URL=postgres://rag_chatbot:<password>@localhost:5432/rag_chatbot
```

The `rag_chatbot` role was created with `LOGIN` and `CREATEDB` (the latter is what lets
pytest-django create/drop its own `test_rag_chatbot` database on every run). To recreate it
on a fresh machine, run as a Postgres superuser:

```sql
CREATE ROLE rag_chatbot WITH LOGIN CREATEDB PASSWORD '<password>';
CREATE DATABASE rag_chatbot OWNER rag_chatbot ENCODING 'UTF8';
```

Leaving `DATABASE_URL` unset falls back to SQLite, which is enough for a quick check but not
what this project runs day to day.

## API conventions

- Every route lives under `/api/`. The OpenAPI schema is at `/api/schema/` and Swagger UI at `/api/docs/`.
- Endpoints require authentication by default (`IsAuthenticated`). Public ones opt out explicitly, like `core.views.HealthCheckView`.
- List endpoints are paginated with 20 items per page.
