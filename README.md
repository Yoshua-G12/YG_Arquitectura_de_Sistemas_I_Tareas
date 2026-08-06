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