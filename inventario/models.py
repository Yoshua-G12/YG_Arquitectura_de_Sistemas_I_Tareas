from django.db import models
from django.core.validators import MinValueValidator

from comun.models import ModeloBase


class Bodega(ModeloBase):
    nombre = models.CharField(max_length=100, unique=True)
    direccion = models.TextField()
    capacidad = models.PositiveIntegerField(default=0)
    activa = models.BooleanField(default=True)
    hora_apertura = models.TimeField(null=True, blank=True)

    def __str__(self):
        return self.nombre


class Existencia(ModeloBase):
    producto = models.ForeignKey(
        "catalogo.Producto",
        on_delete=models.PROTECT,
        related_name="existencias",
    )

    bodega = models.ForeignKey(
        Bodega,
        on_delete=models.PROTECT,
        related_name="existencias",
    )

    cantidad = models.PositiveIntegerField(default=0)
    stock_minimo = models.PositiveIntegerField(default=5)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["producto", "bodega"],
                name="existencia_producto_bodega_unica",
            )
        ]

    def __str__(self):
        return f"{self.producto} - {self.bodega}: {self.cantidad}"


class Movimiento(ModeloBase):
    class TipoMovimiento(models.TextChoices):
        ENTRADA = "entrada", "Entrada"
        SALIDA = "salida", "Salida"

    existencia = models.ForeignKey(
        Existencia,
        on_delete=models.PROTECT,
        related_name="movimientos",
    )

    tipo = models.CharField(
        max_length=10,
        choices=TipoMovimiento.choices,
    )

    cantidad = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
    )

    motivo = models.TextField()
    fecha_movimiento = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_tipo_display()}: {self.cantidad}"