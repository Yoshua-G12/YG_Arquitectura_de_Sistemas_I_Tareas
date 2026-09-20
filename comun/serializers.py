from rest_framework import serializers


class SerializerBase(serializers.ModelSerializer):
    class Meta:
        fields = "__all__"
        read_only_fields = (
            "id",
            "eliminado",
            "fecha_eliminacion",
            "fecha_creacion",
            "fecha_modificacion",
        )