from django.db import models
from django.core.validators import MinValueValidator

from comun.models import ModeloBase

class Categoria(ModeloBase):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)
    activa = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre


class Marca(ModeloBase):
    nombre = models.CharField(max_length=100, unique=True)
    pais_origen = models.CharField(max_length=80)
    sitio_web = models.URLField(blank=True)

    def __str__(self):
        return self.nombre


class Producto(ModeloBase):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    codigo = models.CharField(max_length=30, unique=True)

    precio = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )

    peso_kg = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
    )

    disponible = models.BooleanField(default=True)
    fecha_vencimiento = models.DateField(null=True, blank=True)

    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.PROTECT,
        related_name="productos",
    )

    marca = models.ForeignKey(
        Marca,
        on_delete=models.PROTECT,
        related_name="productos",
    )

    def __str__(self):
        return self.nombre