from comun.views import ViewSetBase
from .models import Proveedor, Compra, DetalleCompra
from .serializers import (
    ProveedorSerializer,
    CompraSerializer,
    DetalleCompraSerializer,
)


class ProveedorViewSet(ViewSetBase):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer


class CompraViewSet(ViewSetBase):
    queryset = Compra.objects.all()
    serializer_class = CompraSerializer


class DetalleCompraViewSet(ViewSetBase):
    queryset = DetalleCompra.objects.all()
    serializer_class = DetalleCompraSerializer