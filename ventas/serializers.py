from rest_framework import serializers

from catalogo.models import Producto
from clientes.models import Cliente
from comun.serializers import SerializerBase
from .models import Venta, DetalleVenta, Pago


class VentaSerializer(SerializerBase):
    cliente = serializers.PrimaryKeyRelatedField(
        queryset=Cliente.objects.filter(eliminado=False)
    )

    class Meta(SerializerBase.Meta):
        model = Venta


class DetalleVentaSerializer(SerializerBase):
    venta = serializers.PrimaryKeyRelatedField(
        queryset=Venta.objects.filter(eliminado=False)
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
        model = DetalleVenta


class PagoSerializer(SerializerBase):
    venta = serializers.PrimaryKeyRelatedField(
        queryset=Venta.objects.filter(eliminado=False)
    )

    class Meta(SerializerBase.Meta):
        model = Pago