from drf_spectacular.utils import extend_schema
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import HealthSerializer


class HealthCheckView(APIView):
    """Liveness check used by the frontend, load balancers and uptime monitors."""

    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(responses=HealthSerializer)
    def get(self, request):
        return Response(HealthSerializer({"status": "ok"}).data)
