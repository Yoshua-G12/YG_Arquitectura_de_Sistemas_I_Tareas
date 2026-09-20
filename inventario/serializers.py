from rest_framework import serializers

from catalogo.models import Producto
from comun.serializers import SerializerBase
from .models import Bodega, Existencia, Movimiento


class BodegaSerializer(SerializerBase):
    class Meta(SerializerBase.Meta):
        model = Bodega


class ExistenciaSerializer(SerializerBase):
    producto = serializers.PrimaryKeyRelatedField(
        queryset=Producto.objects.filter(eliminado=False)
    )

    bodega = serializers.PrimaryKeyRelatedField(
        queryset=Bodega.objects.filter(eliminado=False)
    )

    class Meta(SerializerBase.Meta):
        model = Existencia


class MovimientoSerializer(SerializerBase):
    existencia = serializers.PrimaryKeyRelatedField(
        queryset=Existencia.objects.filter(eliminado=False)
    )

    class Meta(SerializerBase.Meta):
        model = Movimiento