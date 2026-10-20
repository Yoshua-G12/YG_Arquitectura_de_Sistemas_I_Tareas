# Monorepo de productos

Proyecto `hw-05` del repositorio [YG_Arquitectura_de_Sistemas_I_Tareas](https://github.com/Yoshua-G12/YG_Arquitectura_de_Sistemas_I_Tareas). Convierte la API de productos existente en un monorepo con Turborepo, una aplicación web y una librería TypeScript compartida.

## Objetivo

Administrar productos mediante una API REST con Hono y Pino y una interfaz web responsive en español. Ambas aplicaciones reutilizan tipos, validaciones y la función de estado de existencias desde `@repo/shared`.

## Estructura

| Ruta | Responsabilidad |
|---|---|
| `apps/api` | API Hono, CRUD en memoria, logging Pino y pruebas HTTP con `app.request`. |
| `apps/web` | Frontend Vite con TypeScript vanilla, HTML, CSS, formulario y estados de interfaz. |
| `packages/shared` | Tipos `Producto`, validaciones y `obtenerEstadoStock()`, con pruebas de límites. |
| `docs/capturas` | Instrucciones y destino para evidencias visuales reales. |
| `turbo.json` | Orden, caché, salidas y persistencia de tareas de Turborepo. |

## Workspaces y Turborepo

npm Workspaces reconoce `apps/*` y `packages/*`, instala las dependencias en un único lockfile y enlaza `@repo/shared` como dependencia local real de las dos aplicaciones. Turborepo coordina scripts homónimos entre paquetes, ejecuta `shared` antes de sus consumidores mediante `dependsOn: ["^build"]`, almacena salidas `dist/**` y deja `dev` como tarea persistente sin caché.

La librería usa el patrón de paquete compilado: exporta `dist/index.js` y sus declaraciones. Los scripts raíz construyen la librería automáticamente antes de iniciar una aplicación, por lo que un clon limpio puede ejecutar `npm run dev` sin pasos manuales adicionales.

## Requisitos

Versiones utilizadas durante la verificación:

- Node.js `v24.19.0`
- npm `11.17.0`
- Git

El proyecto declara Node.js `>=20.19.0` y npm `>=10.8.0`.

## Instalación desde cero

```bash
git clone https://github.com/Yoshua-G12/YG_Arquitectura_de_Sistemas_I_Tareas.git
cd YG_Arquitectura_de_Sistemas_I_Tareas
git switch hw-05
npm install
```

## Comandos

| Comando | Acción |
|---|---|
| `npm run dev` | Inicia API y frontend en paralelo. |
| `npm run dev:web` | Prepara shared e inicia solo Vite. |
| `npm run dev:api` | Prepara shared e inicia solo Hono. |
| `npm run build` | Compila shared, API y web con Turborepo. |
| `npm run build:web` | Compila shared y frontend. |
| `npm run build:api` | Compila shared y API. |
| `npm test` | Ejecuta todas las pruebas. |
| `npm run test:web` | Pruebas de validación del formulario. |
| `npm run test:api` | Pruebas del CRUD y errores HTTP. |
| `npm run test:shared` | Pruebas de validaciones y stock. |
| `npm run typecheck` | Comprueba tipos de todos los paquetes. |

## Puertos y API

- Frontend: `http://localhost:5173`
- API: `http://localhost:3000`
- `GET /`: información de la API.
- `GET /productos`: lista productos con `estadoStock`.
- `GET /productos/:id`: consulta un producto.
- `POST /productos`: crea `{ "nombre": "Monitor", "precio": 2500, "stock": 5 }`.
- `PUT /productos/:id`: reemplaza todos los campos.
- `PATCH /productos/:id`: actualiza campos parciales.
- `DELETE /productos/:id`: elimina un producto.

La API devuelve `400` para IDs o cuerpos inválidos, incluyendo JSON malformado, `404` para recursos inexistentes, `201` al crear y `204` al eliminar.

## Pruebas y compilación

Las pruebas de `@repo/shared` cubren productos válidos e inválidos y los límites `0`, `1`, `5` y `6` del estado de stock. Las de API prueban consulta, creación, actualización, eliminación y errores. Las del frontend prueban la conversión y validación del formulario mediante funciones comprobables.

```bash
npm install
npm run build
npm test
npm run typecheck
```
## Capturas de funcionamiento

### Frontend
Muestra los estados de stock calculados mediante @repo/shared.

![Frontend funcionando](docs/capturas/frontend.png)

### Backend
La API devuelve los estados de stock calculados mediante @repo/shared.

![Backend funcionando](docs/capturas/backend.png)

## Almacenamiento

Los datos se guardan únicamente en memoria. Se reinician al detener o reiniciar el servidor de la API; no hay base de datos ni persistencia externa.

## Conventional Commits

Ejemplos válidos para esta rama:

```text
feat: convertir proyecto en monorepo con Turborepo
test: cubrir validaciones compartidas de productos
docs: documentar comandos y evidencias de hw-05
```

## Evidencias

No se agregaron capturas automáticamente porque este entorno no dispone de una herramienta de captura de navegador. Las instrucciones precisas están en [`docs/capturas/README.md`](docs/capturas/README.md). Las importaciones en `apps/api/src/app.ts` y `apps/web/src/main.ts` demuestran el uso directo de `@repo/shared`.

Cuando se tomen manualmente, las imágenes deberán enlazarse aquí:

- Frontend con estados de stock: `docs/capturas/frontend-stock.png`.
- Backend con JSON y `estadoStock`: `docs/capturas/backend-json.png`.

## Publicación

Después de revisar los cambios y crear los commits, publica la rama con:

```bash
git push -u origin hw-05
```

Enlace de la rama a entregar: `https://github.com/Yoshua-G12/YG_Arquitectura_de_Sistemas_I_Tareas/tree/hw-05`
