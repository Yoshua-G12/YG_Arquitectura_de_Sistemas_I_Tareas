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
[ Push a hw-04 ] ──► [ Checkout ] ──► [ Node.js LTS ] ──► [ npm ci ] ──► [ npm run build ]
                                                                                   │
                                                                                   ▼
[ Invalidación CloudFront ] ◄── [ Sincronización S3 ] ◄── [ Autenticación OIDC AWS ]
```

1. **Checkout del Repositorio:** Clona el código fuente en el entorno virtual de GitHub Actions.
2. **Configuración de Node.js:** Prepara la versión LTS (Node.js 20) con caché de dependencias `npm`.
3. **Instalación Limpia (`npm ci`):** Instala de forma exacta y reproducible las dependencias declaradas en `package-lock.json`.
4. **Compilación del Proyecto (`npm run build`):** Ejecuta el chequeo estático de tipos (`tsc`) y genera la compilación optimizada en `dist/`.
5. **Autenticación con AWS (OIDC):** Mediante `aws-actions/configure-aws-credentials@v4`, solicita un token temporal a AWS STS asumiendo el rol parametrizado en `AWS_ROLE_ARN`.
6. **Sincronización a Amazon S3:** Ejecuta `aws s3 sync dist/ s3://${S3_BUCKET} --delete` para publicar los archivos y depurar aquellos que ya no existan en la compilación.
7. **Invalidación de Caché en CloudFront:** Ejecuta `aws cloudfront create-invalidation --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" --paths "/*"`, propagando los cambios actualizados a todos los Edge Locations.

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

## 8. Sección de Evidencias

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
