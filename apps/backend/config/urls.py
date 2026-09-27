from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

# Every app's API routes are mounted under /api/.
api_urlpatterns = [
    path("", include("core.urls")),
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path("docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(api_urlpatterns)),
    # Login/logout links for DRF's browsable API.
    path("api-auth/", include("rest_framework.urls")),
]
