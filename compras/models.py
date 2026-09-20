from django.db import models
from django.core.validators import MinValueValidator

from comun.models import ModeloBase


class Proveedor(ModeloBase):
    nombre = models.CharField(max_length=150)
    nit = models.CharField(max_length=20, unique=True)
    correo = models.EmailField()
    telefono = models.CharField(max_length=20)
    direccion = models.TextField()
    sitio_web = models.URLField(blank=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre


class Compra(ModeloBase):
    class EstadoCompra(models.TextChoices):
        PENDIENTE = "pendiente", "Pendiente"
        RECIBIDA = "recibida", "Recibida"
        ANULADA = "anulada", "Anulada"

    numero = models.CharField(max_length=30, unique=True)

    proveedor = models.ForeignKey(
        Proveedor,
        on_delete=models.PROTECT,
        related_name="compras",
    )

    bodega = models.ForeignKey(
        "inventario.Bodega",
        on_delete=models.PROTECT,
        related_name="compras",
    )

    fecha_compra = models.DateTimeField(auto_now_add=True)
    fecha_entrega_estimada = models.DateField(null=True, blank=True)

    estado = models.CharField(
        max_length=15,
        choices=EstadoCompra.choices,
        default=EstadoCompra.PENDIENTE,
    )

    observaciones = models.TextField(blank=True)

    def __str__(self):
        return self.numero


class DetalleCompra(ModeloBase):
    compra = models.ForeignKey(
        Compra,
        on_delete=models.PROTECT,
        related_name="detalles",
    )

    producto = models.ForeignKey(
        "catalogo.Producto",
        on_delete=models.PROTECT,
        related_name="detalles_compra",
    )

    cantidad = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
    )

    costo_unitario = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )

    @property
    def subtotal(self):
        return self.cantidad * self.costo_unitario

    def __str__(self):
        return f"{self.compra.numero} - {self.producto.nombre}"