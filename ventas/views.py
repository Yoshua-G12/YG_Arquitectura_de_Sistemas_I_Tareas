from comun.views import ViewSetBase
from .models import Venta, DetalleVenta, Pago
from .serializers import (
    VentaSerializer,
    DetalleVentaSerializer,
    PagoSerializer,
)


class VentaViewSet(ViewSetBase):
    queryset = Venta.objects.all()
    serializer_class = VentaSerializer


class DetalleVentaViewSet(ViewSetBase):
    queryset = DetalleVenta.objects.all()
    serializer_class = DetalleVentaSerializer


class PagoViewSet(ViewSetBase):
    queryset = Pago.objects.all()
    serializer_class = PagoSerializer