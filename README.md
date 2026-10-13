# HW-04 | Primer Deployment - Arquitectura de Sistemas I

Proyecto universitario correspondiente a la **Tarea HW-04** del curso **Arquitectura de Sistemas I**. Consiste en la implementación de una aplicación web estática moderna desarrollada con **Vite** y **TypeScript**, junto con la arquitectura y configuración de un pipeline de **CI/CD** completamente automatizado en **GitHub Actions** para el despliegue continuo hacia **Amazon S3** y su distribución global mediante **AWS CloudFront** con autenticación segura **OIDC**.

---

## 1. Objetivo de la Actividad

El objetivo fundamental es diseñar, construir y desplegar un flujo de entrega continua que elimine los despliegues manuales, garantizando:

1. **Compilación Automatizada (Build):** Empaquetar y optimizar la aplicación web estática mediante Vite y el compilador de TypeScript en la carpeta `dist/`.
2. **Despliegue Continuo (Upload):** Sincronizar automáticamente los artefactos estáticos con un bucket privado de **Amazon S3**.
3. **Distribución Global e Invalidación de Caché (Invalidate):** Distribuir la aplicación mediante **AWS CloudFront** (CDN) con **Origin Access Control (OAC)** e invalidar automáticamente la caché de los puntos de presencia (Edge locations) para que los cambios se reflejen de inmediato a nivel mundial.
4. **Seguridad sin Credenciales Estáticas:** Implementar autenticación federada mediante **OIDC (OpenID Connect)** entre GitHub Actions y AWS IAM, evitando el almacenamiento de claves permanentes en el repositorio.

---

## 2. Tecnologías Utilizadas

- **Vite (v6+):** Herramienta de compilación ultrarrápida para desarrollo frontend con soporte nativo para ES Modules.
- **TypeScript (v5+):** Lenguaje tipado para asegurar la calidad y consistencia del código cliente.
- **HTML5 & CSS3 Moderno:** Diseño responsive, accesible y estilizado con estética profesional (Dark Theme).
- **GitHub Actions:** Orquestador de Integración y Despliegue Continuo (CI/CD).
- **AWS IAM & OIDC:** Autenticación segura mediante asunción de roles federados basados en tokens JWT temporales.
- **Amazon S3:** Servicio de almacenamiento de objetos en la nube configurado con bloqueo de acceso público y máxima seguridad.
- **AWS CloudFront:** Red de entrega de contenido (CDN) con cifrado SSL/TLS y Origin Access Control (OAC).

---

## 3. Funcionamiento del Pipeline de CI/CD

El pipeline está definido en el archivo [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) y se ejecuta bajo dos modalidades:

- **Automática:** Cada vez que se realiza un `git push` a la rama `hw-04`.
- **Manual:** Mediante el evento `workflow_dispatch` desde la interfaz de GitHub Actions.

### Fases del Workflow

```text
### Fases del Workflow (2 Jobs Desacoplados)

```text
[ Push a hw-04 / workflow_dispatch ]
                 │
                 ▼
 ┌─────────────────────────────────────────────────────────┐
 │                   JOB 1: BUILD                          │
 │  1. actions/checkout@v4                                 │
 │  2. Setup Node.js 20 LTS (cache npm)                    │
 │  3. npm ci (instalación determinista)                   │
 │  4. npm run build (tsc + vite build)                    │
 │  5. Verificación de dist/index.html                     │
 │  6. actions/upload-artifact@v4 (genera dist-artifact)   │
 └─────────────────────────┬───────────────────────────────┘
                           │
                           ▼
 ┌─────────────────────────────────────────────────────────┐
 │                   JOB 2: DEPLOY                         │
 │  Condición: Variables AWS configuradas en GitHub        │
 │  - Si faltan variables: Estado SKIPPED (Omitido)        │
 │  - Si están listas:                                     │
 │    1. actions/download-artifact@v4 (extrae en dist/)    │
 │    2. Verificación de integridad del artefacto          │
 │    3. Autenticación AWS IAM mediante OIDC               │
 │    4. aws s3 sync dist/ s3://${S3_BUCKET} --delete      │
 │    5. aws cloudfront create-invalidation (/*)           │
 └─────────────────────────────────────────────────────────┘
```

#### Job 1: Build & Verify Artifact
1. **Checkout del Repositorio:** Clona el código fuente en el entorno virtual `ubuntu-latest`.
2. **Configuración de Node.js:** Prepara la versión LTS (Node.js 20) con caché de dependencias `npm`.
3. **Instalación Limpia (`npm ci`):** Instala de forma exacta y reproducible las dependencias declaradas en `package-lock.json`.
4. **Compilación del Proyecto (`npm run build`):** Ejecuta el chequeo estático de tipos (`tsc`) y genera la compilación optimizada en `dist/`.
5. **Verificación de Salida:** Valida la existencia física de `dist/index.html`.
6. **Carga de Artefacto (`upload-artifact@v4`):** Publica el paquete `dist/` como artefacto temporal descargable en GitHub Actions. **Este job finaliza exitosamente de forma 100% independiente sin requerir credenciales de AWS**.

#### Job 2: Deploy to AWS S3 & CloudFront
- **Dependencia:** Depende directamente del éxito del Job 1 (`needs: build`).
- **Condición de Ejecución Segura:** Evalúa la presencia de `AWS_ROLE_ARN`, `AWS_REGION`, `S3_BUCKET` y `CLOUDFRONT_DISTRIBUTION_ID`. Si no están configuradas (por ejemplo, mientras la cuenta de AWS está pendiente de verificación), el job pasa automáticamente al estado **Skipped** (Omitido) sin marcar error en el pipeline.
- **Descarga de Artefacto (`download-artifact@v4`):** Recupera la carpeta `dist/` generada por el Job 1.
- **Autenticación con AWS (OIDC):** Mediante `aws-actions/configure-aws-credentials@v4`, asume el rol IAM temporal mediante token federado.
- **Sincronización a Amazon S3:** Publica los archivos con `aws s3 sync dist/ s3://${S3_BUCKET} --delete`.
- **Invalidación de Caché en CloudFront:** Ejecuta `aws cloudfront create-invalidation --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" --paths "/*"`.

---

## 4. Estructura Principal del Proyecto

```text
Tarea4_YG/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Definición del pipeline CI/CD en GitHub Actions
├── docs/
│   ├── AWS_SETUP.md            # Guía detallada paso a paso para la configuración en AWS
│   └── images/                 # Directorio destinado a las capturas de pantalla de evidencia
│       └── .gitkeep
├── src/
│   ├── main.ts                 # Lógica interactiva TypeScript y telemetría cliente
│   └── style.css               # Estilos modernos, responsive y paleta de colores
├── index.html                  # Punto de entrada HTML5 de la aplicación web
├── package.json                # Configuración del proyecto, dependencias y scripts
├── package-lock.json           # Árbol de dependencias bloqueado para npm ci
├── tsconfig.json               # Configuración del compilador de TypeScript
├── .gitignore                  # Exclusión de node_modules, dist y archivos del entorno
└── README.md                   # Documentación principal del proyecto
```

---

## 5. Instrucciones de Ejecución Local

### Requisitos Previos

- **Node.js:** Versión 18 o superior (recomendado Node.js 20 LTS o superior).
- **npm:** Gestor de paquetes incluido con Node.js.
- **Git:** Para control de versiones.

### 1. Clonar el repositorio y cambiar a la rama `hw-04`

```bash
git clone https://github.com/Yoshua-G12/YG_Arquitectura_de_Sistemas_I_Tareas.git
cd YG_Arquitectura_de_Sistemas_I_Tareas
git checkout hw-04
```

### 2. Instalación de dependencias

```bash
npm install
```

### 3. Ejecutar en modo desarrollo

```bash
npm run dev
```

El servidor local de desarrollo de Vite se iniciará típicamente en:

```text
http://localhost:5173
```

### 4. Compilar para producción localmente

```bash
npm run build
```

Este comando ejecuta `tsc` para comprobación de tipos y genera los activos optimizados en la carpeta `dist/`.

### 5. Previsualizar la compilación de producción

```bash
npm run preview
```

---

## 6. Verificación en GitHub Actions

Para monitorear o disparar el pipeline:

1. Ve a la pestaña **Actions** de tu repositorio en GitHub:
   `https://github.com/Yoshua-G12/YG_Arquitectura_de_Sistemas_I_Tareas/actions`
2. Selecciona el flujo denominado **Deploy HW-04 to AWS S3 & CloudFront**.
3. Si deseas probarlo manualmente, haz clic en **Run workflow**, selecciona la rama `hw-04` y pulsa el botón verde.
4. Verifica que los 7 pasos del job `Build & Deploy to AWS` concluyan en verde (éxito).

> **Nota:** Para los detalles completos sobre la creación de la infraestructura en AWS (Bucket S3, CloudFront OAC, IAM Role OIDC y Secrets), consulta el documento [docs/AWS_SETUP.md](docs/AWS_SETUP.md).

---

## 7. URL Pública de CloudFront

Una vez desplegada la infraestructura en AWS CloudFront, la aplicación estará disponible públicamente en la siguiente dirección:

```text
https://<REEMPLAZAR-CON-TU-DOMINIO-CLOUDFRONT>.cloudfront.net
```

*(Ejemplo: `https://d1234567890abc.cloudfront.net`)*

---

## 8. Publicación Temporal en GitHub Pages

Además del pipeline AWS, este repositorio incluye un workflow separado para publicar temporalmente la página en GitHub Pages sin modificar el despliegue hacia S3/CloudFront:

- Workflow de AWS: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), usa `npm run build` y mantiene la base `/`.
- Workflow de GitHub Pages: [`.github/workflows/pages.yml`](.github/workflows/pages.yml), usa `npm run build:pages` y compila con la base `/YG_Arquitectura_de_Sistemas_I_Tareas/`.

URL esperada de GitHub Pages:

```text
https://yoshua-g12.github.io/YG_Arquitectura_de_Sistemas_I_Tareas/
```

### Activación Manual de GitHub Pages

1. En GitHub, abre el repositorio `Yoshua-G12/YG_Arquitectura_de_Sistemas_I_Tareas`.
2. Ve a **Settings > Pages**.
3. En **Build and deployment**, selecciona **Source: GitHub Actions**.
4. Ve a **Settings > Environments** y abre el entorno **github-pages**.
5. En **Deployment branches and tags**, selecciona **Selected branches and tags**. Agrega una regla con **Add deployment branch or tag rule**, elige **Branch**, escribe `hw-04` y pulsa **Add rule**. Conserva las reglas existentes.
6. Sube los cambios a la rama `hw-04`. Cada `push` a esa rama inicia automáticamente el workflow de Pages.
7. Ve a **Actions > Deploy HW-04 to GitHub Pages**, abre la ejecución correspondiente a `hw-04` y verifica que ambos jobs terminen correctamente.

Si una ejecución falla con `Branch "hw-04" is not allowed to deploy to github-pages due to environment protection rules`, agrega la regla del paso 5 y vuelve a esa ejecución. Usa **Re-run jobs > Re-run failed jobs** para reintentar la publicación con el artefacto ya compilado.

Este flujo no requiere credenciales de AWS ni altera el pipeline `Deploy HW-04 to AWS S3 & CloudFront`.

---

## 9. Sección de Evidencias

> **Instrucciones para el estudiante:**
> Guarda las capturas de pantalla con los nombres indicados dentro de la carpeta [`docs/images/`](docs/images/) para que se visualicen automáticamente a continuación.

### 1. Aplicación Ejecutándose en Local (Vite Dev Server)
![Vite Local](docs/images/vite_local.png)
*(Captura de la terminal con `npm run dev` y el navegador en `http://localhost:5173`)*

---

### 2. Bucket Privado en Amazon S3
![Amazon S3 Bucket](docs/images/s3_bucket.png)
*(Captura de la consola de AWS S3 mostrando el bucket con los archivos subidos de `dist/` y el bloqueo de acceso público activo)*

---

### 3. Distribución en AWS CloudFront (OAC)
![CloudFront Distribution](docs/images/cloudfront_distribution.png)
*(Captura de la consola de CloudFront mostrando la distribución creada, el estado `Enabled` y la configuración de Origin Access Control)*

---

### 4. Pipeline de GitHub Actions Exitoso
![GitHub Actions Pipeline](docs/images/github_actions_pipeline.png)
*(Captura de la pestaña Actions de GitHub con todos los pasos del workflow en estado verde / exitoso)*

---

### 5. Página Desplegada en Producción (CloudFront URL)
![Despliegue en Vivo](docs/images/deployment_live.png)
*(Captura de la página web cargada desde el dominio público HTTPS de CloudFront)*
