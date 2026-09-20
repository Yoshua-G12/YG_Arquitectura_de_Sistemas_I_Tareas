from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from catalogo.views import (
    CategoriaViewSet,
    MarcaViewSet,
    ProductoViewSet,
)

from clientes.views import (
    TipoClienteViewSet,
    ClienteViewSet,
    DireccionViewSet,
)

from inventario.views import (
    BodegaViewSet,
    ExistenciaViewSet,
    MovimientoViewSet,
)
from ventas.views import (
    VentaViewSet,
    DetalleVentaViewSet,
    PagoViewSet,
)
from compras.views import (
    ProveedorViewSet,
    CompraViewSet,
    DetalleCompraViewSet,
)

router = DefaultRouter()

router.register("categorias", CategoriaViewSet)
router.register("marcas", MarcaViewSet)
router.register("productos", ProductoViewSet)
router.register("tipos-clientes", TipoClienteViewSet)
router.register("clientes", ClienteViewSet)
router.register("direcciones", DireccionViewSet)
router.register("bodegas", BodegaViewSet)
router.register("existencias", ExistenciaViewSet)
router.register("movimientos", MovimientoViewSet)
router.register("ventas", VentaViewSet)
router.register("detalle-ventas", DetalleVentaViewSet)
router.register("pagos", PagoViewSet)
router.register("proveedores", ProveedorViewSet)
router.register("compras", CompraViewSet)
router.register("detalle-compras", DetalleCompraViewSet)


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
]