from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

from comun.models import ModeloBase


class TipoCliente(ModeloBase):
    nombre = models.CharField(max_length=80, unique=True)
    descripcion = models.TextField(blank=True)

    porcentaje_descuento = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(100),
        ],
    )

    def __str__(self):
        return self.nombre


class Cliente(ModeloBase):
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    correo = models.EmailField(unique=True)
    telefono = models.CharField(max_length=20, blank=True)
    nit = models.CharField(max_length=20, blank=True)

    fecha_nacimiento = models.DateField(null=True, blank=True)
    acepta_promociones = models.BooleanField(default=False)

    tipo_cliente = models.ForeignKey(
        TipoCliente,
        on_delete=models.PROTECT,
        related_name="clientes",
    )

    def __str__(self):
        return f"{self.nombres} {self.apellidos}"


class Direccion(ModeloBase):
    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.PROTECT,
        related_name="direcciones",
    )

    departamento = models.CharField(max_length=80)
    municipio = models.CharField(max_length=80)
    detalle = models.TextField()
    referencia = models.TextField(blank=True)
    es_principal = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.municipio}: {self.detalle}"