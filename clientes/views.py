from comun.views import ViewSetBase
from .models import TipoCliente, Cliente, Direccion
from .serializers import (
    TipoClienteSerializer,
    ClienteSerializer,
    DireccionSerializer,
)


class TipoClienteViewSet(ViewSetBase):
    queryset = TipoCliente.objects.all()
    serializer_class = TipoClienteSerializer


class ClienteViewSet(ViewSetBase):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer


class DireccionViewSet(ViewSetBase):
    queryset = Direccion.objects.all()
    serializer_class = DireccionSerializer