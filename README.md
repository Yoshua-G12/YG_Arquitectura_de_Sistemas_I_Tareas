# API de Productos con Hono

API REST sencilla desarrollada en TypeScript utilizando Hono y Pino. Permite consultar, crear, reemplazar, modificar y eliminar productos.

Los datos se almacenan temporalmente en un arreglo, por lo que no se utiliza una base de datos.

## Tecnologías utilizadas

- Node.js
- TypeScript
- Hono
- Pino
- TSX

## Requisitos

Antes de ejecutar el proyecto es necesario tener instalado:

- Node.js 18 o superior
- npm
- Git

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/Yoshua-G12/api_productos-typescript.git
```

Entrar en la carpeta:

```bash
cd api_productos-typescript
```

Cambiar a la rama de la primera tarea:

```bash
git switch hw-01
```

Instalar las dependencias:

```bash
npm install
```

## Ejecutar en desarrollo

```bash
npm run dev
```

La API estará disponible en:

```text
http://localhost:3000
```

## Compilar el proyecto

```bash
npm run build
```

## Ejecutar el proyecto compilado

```bash
npm start
```

## Endpoints

| Método | Endpoint | Descripción | Código exitoso |
|---|---|---|---|
| GET | `/` | Información principal de la API | 200 |
| GET | `/productos` | Obtener todos los productos | 200 |
| GET | `/productos/:id` | Obtener un producto por ID | 200 |
| POST | `/productos` | Crear un producto | 201 |
| PUT | `/productos/:id` | Reemplazar completamente un producto | 200 |
| PATCH | `/productos/:id` | Modificar algunos campos | 200 |
| DELETE | `/productos/:id` | Eliminar un producto | 204 |

## Ejemplo para POST

```json
{
  "nombre": "Monitor gamer",
  "precio": 2500,
  "stock": 5
}
```

## Ejemplo para PUT

PUT requiere todos los campos del producto:

```json
{
  "nombre": "Monitor gamer 27 pulgadas",
  "precio": 2800,
  "stock": 8
}
```

## Ejemplo para PATCH

PATCH permite modificar solamente algunos campos:

```json
{
  "stock": 12
}
```

## Códigos de respuesta

| Código | Significado |
|---|---|
| 200 | Operación realizada correctamente |
| 201 | Producto creado correctamente |
| 204 | Producto eliminado sin contenido en la respuesta |
| 400 | Datos o ID inválidos |
| 404 | Producto o ruta no encontrada |

## Persistencia de datos

La API no utiliza una base de datos. Los productos se almacenan en memoria y vuelven a su estado inicial cada vez que se reinicia el servidor.


# Tarea hw-03 — API con Django y migraciones

Curso: Arquitectura de Sistemas I  
Autor: Yoshua Emanuel González Fuentes

## Descripción

API de gestión de productos, clientes, inventario, ventas y compras,
desarrollada con Django y Django REST Framework.

Cuenta con cinco aplicaciones y quince modelos:

| Aplicación | Modelos |
|---|---|
| catalogo | Categoria, Marca, Producto |
| clientes | TipoCliente, Cliente, Direccion |
| inventario | Bodega, Existencia, Movimiento |
| ventas | Venta, DetalleVenta, Pago |
| compras | Proveedor, Compra, DetalleCompra |

Todos los modelos heredan de ModeloBase e incluyen:
- Identificador UUID versión 4.
- Indicador de borrado lógico.
- Fecha de eliminación.
- Fecha de creación.
- Fecha de modificación.

## Instalación y ejecución en Windows PowerShell

Se requiere Git y Python 3.13.

Clonar el repositorio y seleccionar la rama de la tarea:

```powershell
git clone --branch hw-03 https://github.com/Yoshua-G12/YG_Arquitectura_de_Sistemas_I_Tareas.git
cd YG_Arquitectura_de_Sistemas_I_Tareas
```

Crear el entorno virtual e instalar las dependencias:

```powershell
py -3.13 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Aplicar las migraciones e iniciar el servidor:

```powershell
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py runserver
```

Abrir en el navegador:
http://127.0.0.1:8000/api/

Se utiliza SQLite. No es necesario instalar un servidor de base de datos.
El archivo db.sqlite3 se genera al aplicar las migraciones.
Los datos de prueba locales no se incluyen en el repositorio.

## Endpoints

Todas las rutas tienen el prefijo /api/ y terminan en /.

| Aplicación | Rutas |
|---|---|
| Catálogo | categorias, marcas, productos |
| Clientes | tipos-clientes, clientes, direcciones |
| Inventario | bodegas, existencias, movimientos |
| Ventas | ventas, detalle-ventas, pagos |
| Compras | proveedores, compras, detalle-compras |

Operaciones disponibles:

- GET /api/recurso/: listar registros no eliminados.
- POST /api/recurso/: crear un registro.
- GET /api/recurso/UUID/: consultar un registro.
- PUT /api/recurso/UUID/: actualizar un registro completo.
- PATCH /api/recurso/UUID/: actualizar algunos campos.
- DELETE /api/recurso/UUID/: eliminar lógicamente un registro.

Por ejemplo: /api/categorias/ y /api/categorias/UUID/.

Para crear registros relacionados, primero deben existir los registros
referenciados. Por ejemplo, un producto necesita una categoría y una marca.

## Borrado lógico

DELETE conserva el registro en la base de datos, establece eliminado=True
y registra fecha_eliminacion.

Las consultas de la API excluyen los registros eliminados.
El UUID, los indicadores de eliminación y las fechas de auditoría
son de solo lectura en la API.

El borrado lógico de un registro no elimina automáticamente sus relaciones.
Los valores únicos siguen reservados aunque el registro esté eliminado.

## Migraciones

Cada aplicación incluye su migración inicial.

En Catálogo también se incluye 0002_ampliar_nombre_producto,
que amplía el campo nombre de Producto de 150 a 200 caracteres.

Para consultar las migraciones aplicadas:

```powershell
.\.venv\Scripts\python.exe manage.py showmigrations
```

Después de modificar modelos, generar y aplicar nuevas migraciones:

```powershell
.\.venv\Scripts\python.exe manage.py makemigrations
.\.venv\Scripts\python.exe manage.py migrate
```

## Alcance

La API permite operaciones CRUD sobre los quince modelos.
Los subtotales de detalles de venta y compra se calculan a partir
de la cantidad y el precio o costo unitario.

Las compras, ventas y movimientos no actualizan automáticamente
las existencias. Los pagos tampoco cambian automáticamente
el estado de las ventas.

## Comprobación del proyecto

```powershell
.\.venv\Scripts\python.exe manage.py check
.\.venv\Scripts\python.exe manage.py makemigrations --check --dry-run
```