from rest_framework import serializers

from catalogo.models import Producto
from inventario.models import Bodega
from comun.serializers import SerializerBase
from .models import Proveedor, Compra, DetalleCompra


class ProveedorSerializer(SerializerBase):
    class Meta(SerializerBase.Meta):
        model = Proveedor


class CompraSerializer(SerializerBase):
    proveedor = serializers.PrimaryKeyRelatedField(
        queryset=Proveedor.objects.filter(eliminado=False)
    )

    bodega = serializers.PrimaryKeyRelatedField(
        queryset=Bodega.objects.filter(eliminado=False)
    )

    class Meta(SerializerBase.Meta):
        model = Compra


class DetalleCompraSerializer(SerializerBase):
    compra = serializers.PrimaryKeyRelatedField(
        queryset=Compra.objects.filter(eliminado=False)
    )

    producto = serializers.PrimaryKeyRelatedField(
        queryset=Producto.objects.filter(eliminado=False)
    )

    subtotal = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
        read_only=True,
    )

    class Meta(SerializerBase.Meta):
        model = DetalleCompra