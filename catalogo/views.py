from comun.views import ViewSetBase
from .models import Categoria, Marca, Producto
from .serializers import (
    CategoriaSerializer,
    MarcaSerializer,
    ProductoSerializer,
)


class CategoriaViewSet(ViewSetBase):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer


class MarcaViewSet(ViewSetBase):
    queryset = Marca.objects.all()
    serializer_class = MarcaSerializer


class ProductoViewSet(ViewSetBase):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer