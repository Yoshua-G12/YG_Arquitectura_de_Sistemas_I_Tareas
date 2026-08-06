# API de Productos con Hono y Scalar

API REST desarrollada en TypeScript utilizando Hono y Pino. Permite consultar, crear, reemplazar, modificar y eliminar productos.

La documentación se genera automáticamente con OpenAPI y se presenta mediante Scalar en la ruta `/docs`.

## Ramas del proyecto

- `hw-01`: API CRUD con Hono, TypeScript y Pino.
- `hw-02`: misma API, agregando validación con Zod y documentación con OpenAPI y Scalar.

## Tecnologías utilizadas

- Node.js
- TypeScript
- Hono
- Pino
- Zod
- OpenAPI 3.1
- Scalar
- TSX

## Requisitos

Es necesario tener instalado:

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

Cambiar a la rama de la segunda tarea:

```bash
git switch hw-02
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

## Documentación

La documentación interactiva de Scalar está disponible en:

```text
http://localhost:3000/docs
```

El documento OpenAPI generado automáticamente está disponible en:

```text
http://localhost:3000/openapi.json
```

Desde Scalar es posible consultar los esquemas, códigos de respuesta y probar cada endpoint.

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
| GET | `/productos` | Obtener todos los productos | 200 |
| GET | `/productos/{id}` | Obtener un producto por ID | 200 |
| POST | `/productos` | Crear un producto | 201 |
| PUT | `/productos/{id}` | Reemplazar completamente un producto | 200 |
| PATCH | `/productos/{id}` | Modificar algunos campos | 200 |
| DELETE | `/productos/{id}` | Eliminar un producto | 204 |

## Ejemplo para POST

```json
{
  "nombre": "Monitor gamer",
  "precio": 2500,
  "stock": 5
}
```

## Ejemplo para PUT

PUT requiere todos los campos:

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
| 204 | Producto eliminado sin contenido |
| 400 | Datos o ID inválidos |
| 404 | Producto o ruta no encontrada |

## Persistencia

La API no utiliza una base de datos. Los productos se almacenan temporalmente en un arreglo y vuelven a su estado inicial cuando se reinicia el servidor.