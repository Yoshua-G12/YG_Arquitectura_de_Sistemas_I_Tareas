from comun.views import ViewSetBase
from .models import Bodega, Existencia, Movimiento
from .serializers import (
    BodegaSerializer,
    ExistenciaSerializer,
    MovimientoSerializer,
)


class BodegaViewSet(ViewSetBase):
    queryset = Bodega.objects.all()
    serializer_class = BodegaSerializer


class ExistenciaViewSet(ViewSetBase):
    queryset = Existencia.objects.all()
    serializer_class = ExistenciaSerializer


class MovimientoViewSet(ViewSetBase):
    queryset = Movimiento.objects.all()
    serializer_class = MovimientoSerializer