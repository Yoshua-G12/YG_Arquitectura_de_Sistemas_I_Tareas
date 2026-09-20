from rest_framework import serializers

from comun.serializers import SerializerBase
from .models import Categoria, Marca, Producto


class CategoriaSerializer(SerializerBase):
    class Meta(SerializerBase.Meta):
        model = Categoria


class MarcaSerializer(SerializerBase):
    class Meta(SerializerBase.Meta):
        model = Marca


class ProductoSerializer(SerializerBase):
    categoria = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.filter(eliminado=False)
    )

    marca = serializers.PrimaryKeyRelatedField(
        queryset=Marca.objects.filter(eliminado=False)
    )

    class Meta(SerializerBase.Meta):
        model = Producto