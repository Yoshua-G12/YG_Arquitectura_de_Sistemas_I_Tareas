from django.db import models
from django.core.validators import MinValueValidator

from comun.models import ModeloBase


class Venta(ModeloBase):
    class EstadoVenta(models.TextChoices):
        PENDIENTE = "pendiente", "Pendiente"
        COMPLETADA = "completada", "Completada"
        ANULADA = "anulada", "Anulada"

    numero = models.CharField(max_length=30, unique=True)

    cliente = models.ForeignKey(
        "clientes.Cliente",
        on_delete=models.PROTECT,
        related_name="ventas",
    )

    fecha_venta = models.DateTimeField(auto_now_add=True)

    estado = models.CharField(
        max_length=15,
        choices=EstadoVenta.choices,
        default=EstadoVenta.PENDIENTE,
    )

    observaciones = models.TextField(blank=True)

    def __str__(self):
        return self.numero


class DetalleVenta(ModeloBase):
    venta = models.ForeignKey(
        Venta,
        on_delete=models.PROTECT,
        related_name="detalles",
    )

    producto = models.ForeignKey(
        "catalogo.Producto",
        on_delete=models.PROTECT,
        related_name="detalles_venta",
    )

    cantidad = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
    )

    precio_unitario = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )

    @property
    def subtotal(self):
        return self.cantidad * self.precio_unitario

    def __str__(self):
        return f"{self.venta.numero} - {self.producto.nombre}"


class Pago(ModeloBase):
    class MetodoPago(models.TextChoices):
        EFECTIVO = "efectivo", "Efectivo"
        TARJETA = "tarjeta", "Tarjeta"
        TRANSFERENCIA = "transferencia", "Transferencia"

    venta = models.ForeignKey(
        Venta,
        on_delete=models.PROTECT,
        related_name="pagos",
    )

    monto = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0.01)],
    )

    metodo = models.CharField(
        max_length=15,
        choices=MetodoPago.choices,
    )

    referencia = models.CharField(max_length=100, blank=True)
    fecha_pago = models.DateTimeField(auto_now_add=True)
    confirmado = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.venta.numero} - Q{self.monto}"