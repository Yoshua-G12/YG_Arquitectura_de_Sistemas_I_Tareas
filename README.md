# API de Biblioteca y Función de Aptitud

API desarrollada en TypeScript con Hono. Permite listar y registrar libros en memoria y evaluar la salud arquitectónica del sistema mediante una función de aptitud.

## Rama de la actividad

```text
assesment-01
```

## Requisitos

- Node.js
- npm
- Git

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/Yoshua-G12/api_productos-typescript.git
```

Entrar al proyecto:

```bash
cd api_productos-typescript
```

Cambiar a la rama de la actividad:

```bash
git switch assesment-01
```

Instalar las dependencias:

```bash
npm install
```

## Ejecutar el proyecto

Modo desarrollo:

```bash
npm run dev
```

La API estará disponible en:

```text
http://localhost:3000
```

Para comprobar que el proyecto compila:

```bash
npm run build
```

## Endpoints

### Listar libros

```http
GET /books
```

Respuesta correcta:

```text
200 OK
```

### Agregar un libro

```http
POST /books
Content-Type: application/json
```

Ejemplo de cuerpo JSON:

```json
{
  "titulo": "Arquitectura limpia",
  "autor": "Robert C. Martin",
  "prestado": true
}
```

Respuesta correcta:

```text
201 Created
```

Si el cuerpo no se envía como JSON:

```text
415 Unsupported Media Type
```

Si los datos son inválidos:

```text
400 Bad Request
```

### Comprobar la salud arquitectónica

```http
GET /health/fitness
```

La función de aptitud evalúa estas restricciones:

1. El número total de libros no debe exceder los 100.
2. La proporción de libros prestados debe ser menor al 80%.

Si ambas condiciones se cumplen:

```text
200 OK
status: Healthy
```

Si alguna condición no se cumple:

```text
503 Service Unavailable
status: Degradacion de Calidad
```

El reporte incluye:

- Total de libros.
- Cantidad de libros prestados.
- Porcentaje de libros prestados.
- Resultado de cada restricción arquitectónica.

## Almacenamiento

Los datos se almacenan temporalmente en memoria. Al reiniciar el servidor, la lista regresa a su estado inicial.