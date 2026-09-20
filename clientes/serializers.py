from rest_framework import serializers

from comun.serializers import SerializerBase
from .models import TipoCliente, Cliente, Direccion


class TipoClienteSerializer(SerializerBase):
    class Meta(SerializerBase.Meta):
        model = TipoCliente


class ClienteSerializer(SerializerBase):
    tipo_cliente = serializers.PrimaryKeyRelatedField(
        queryset=TipoCliente.objects.filter(eliminado=False)
    )

    class Meta(SerializerBase.Meta):
        model = Cliente


class DireccionSerializer(SerializerBase):
    cliente = serializers.PrimaryKeyRelatedField(
        queryset=Cliente.objects.filter(eliminado=False)
    )

    class Meta(SerializerBase.Meta):
        model = Direccion