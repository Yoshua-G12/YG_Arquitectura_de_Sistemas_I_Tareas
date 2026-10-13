# Guía de Configuración de AWS para Despliegue CI/CD (HW-04)

Esta guía detalla los pasos manuales para aprovisionar y configurar la infraestructura requerida en **Amazon Web Services (AWS)** para la entrega continua de la aplicación estática construida con **Vite**, alojada en **Amazon S3**, distribuida mediante **AWS CloudFront** y desplegada automáticamente con **GitHub Actions** utilizando **OIDC (OpenID Connect)** sin llaves de acceso permanentes.

---

## 1. Arquitectura del Despliegue

```text
[ Desarrollador ]
       │  git push origin hw-04
       ▼
[ GitHub Repository: Yoshua-G12/YG_Arquitectura_de_Sistemas_I_Tareas ]
       │  Dispara Workflow (.github/workflows/deploy.yml)
       ▼
[ GitHub Actions Runner ]
       │  1. Checkout & npm ci
       │  2. npm run build (genera dist/)
       │  3. Solicita credenciales temporales via OIDC
       ▼
[ AWS IAM (OIDC Provider + Role) ] ──(Emite STS token temporal)──► [ GitHub Actions ]
                                                                        │
              ┌─────────────────────────────────────────────────────────┴────────────────────────┐
              ▼                                                                                  ▼
     [ aws s3 sync dist/ ]                                                    [ aws cloudfront create-invalidation ]
              │                                                                                  │
              ▼                                                                                  ▼
[ Amazon S3 (Bucket Privado) ] ◄──[ Origin Access Control (OAC) ]──► [ AWS CloudFront (CDN) ] ──► [ Navegador Usuario (HTTPS) ]
```

---

## 2. Marcadores a Reemplazar

A lo largo de este documento encontrarás los siguientes marcadores. Reemplázalos con tus valores reales:

| Marcador | Descripción | Ejemplo |
|---|---|---|
| `<TU-AWS-ACCOUNT-ID>` | ID de 12 dígitos de tu cuenta de AWS | `123456789012` |
| `<TU-BUCKET-NAME>` | Nombre único global de tu bucket S3 | `hw04-primer-deployment-yoshua` |
| `<TU-REGION>` | Región de AWS donde crearás el bucket | `us-east-1` |
| `<TU-DISTRIBUTION-ID>` | ID de la distribución creada en CloudFront | `E1A2B3C4D5E6F7` |
| `<NOMBRE-DEL-ROL>` | Nombre para el rol de IAM | `GitHubActions-HW04-DeployRole` |

---

## 3. Paso a Paso: Configuración de Amazon S3

El bucket S3 almacenará los archivos estáticos compilados en `dist/`. **Debe permanecer 100% privado**, delegando el acceso público exclusivamente a CloudFront mediante **Origin Access Control (OAC)**.

1. Inicia sesión en la consola de AWS y ve a **Amazon S3**.
2. Haz clic en **Crear bucket** (*Create bucket*).
3. Configura las siguientes opciones:
   - **Nombre del bucket:** `<TU-BUCKET-NAME>` (debe ser único en todo AWS, en minúsculas y sin espacios).
   - **Región de AWS:** Selecciona tu región preferida (por ejemplo, `us-east-1`).
   - **Propiedad de objetos (Object Ownership):** Dejar en **ACL deshabilitadas (recomendado)** (*ACLs disabled*).
   - **Bloquear acceso público (Block Public Access):** **Mantener activadas todas las casillas de bloqueo**. No desmarques ninguna opción; el bucket debe ser estrictamente privado.
   - **Cifrado predeterminado (Bucket Encryption):** Cifrado del lado del servidor con claves administradas de Amazon S3 (**SSE-S3**).
4. Haz clic en **Crear bucket**.

---

## 4. Paso a Paso: Creación de la Distribución en AWS CloudFront

CloudFront actuará como CDN global con terminación TLS/HTTPS y enviará las solicitudes autorizadas hacia el bucket S3 privado mediante OAC.

1. Ve a **CloudFront** en la consola de AWS.
2. Haz clic en **Crear distribución** (*Create distribution*).
3. **Origen (Origin):**
   - **Dominio de origen (Origin domain):** Selecciona el bucket S3 recién creado (`<TU-BUCKET-NAME>.s3.<TU-REGION>.amazonaws.com`).
     > **Importante:** Selecciona el endpoint REST sugerido en la lista, **no** el endpoint de sitio web estático.
   - **Acceso de origen (Origin access):** Selecciona **Origin access control settings (recommended)**.
   - Haz clic en **Crear configuración de control** (*Create control setting*):
     - Nombre: Acepta el sugerido o nómbralo `OAC-<TU-BUCKET-NAME>`.
     - Comportamiento de firma: **Sign requests (recommended)**.
     - Tipo de origen: **S3**.
     - Haz clic en **Crear**.
4. **Comportamiento de caché predeterminado (Default cache behavior):**
   - **Política de protocolo del visor (Viewer protocol policy):** Selecciona **Redirect HTTP to HTTPS**.
   - **Métodos HTTP permitidos:** `GET, HEAD`.
5. **Firewall de aplicaciones web (WAF):**
   - Selecciona **No habilitar protecciones de seguridad** (*Do not enable security protections*) para evitar costos adicionales de AWS WAF, a menos que tu profesor lo requiera explícitamente.
6. **Configuración general (Settings):**
   - **Objeto raíz predeterminado (Default root object):** Escribe exactamente `index.html`.
     > **Crítico:** Si omites `index.html`, la raíz de tu dominio devolverá error `AccessDenied` (403) o `NoSuchKey`.
7. Haz clic en **Crear distribución**.
8. Una vez creada, la consola de CloudFront mostrará un recuadro amarillo indicando que debes actualizar la política del bucket S3. Copia la política sugerida o utiliza la que se detalla en el siguiente paso.

---

## 5. Autorizar a CloudFront en la Política del Bucket S3

Regresa a **Amazon S3** para aplicar la política que permite al servicio de CloudFront leer los objetos del bucket:

1. Ve a **S3** > Haz clic en tu bucket `<TU-BUCKET-NAME>` > Pestaña **Permisos** (*Permissions*).
2. En la sección **Política de bucket** (*Bucket policy*), haz clic en **Editar**.
3. Pega la siguiente política en formato JSON, reemplazando los marcadores correspondientes:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipalReadOnly",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::<TU-BUCKET-NAME>/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::<TU-AWS-ACCOUNT-ID>:distribution/<TU-DISTRIBUTION-ID>"
        }
      }
    }
  ]
}
```

4. Haz clic en **Guardar cambios**.

---

## 6. Configuración de IAM: Proveedor OIDC de GitHub

Para que GitHub Actions pueda autenticarse de manera segura sin necesidad de llaves de acceso permanentes (`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`), utilizaremos **OpenID Connect (OIDC)** con **AWS IAM**.

1. Ve a **IAM** en la consola de AWS.
2. En el menú lateral, selecciona **Proveedores de identidad** (*Identity providers*).
3. Verifica si ya existe un proveedor con la URL `token.actions.githubusercontent.com`.
4. Si **no** existe:
   - Haz clic en **Agregar proveedor** (*Add provider*).
   - Tipo de proveedor: **OpenID Connect**.
   - URL del proveedor: `https://token.actions.githubusercontent.com`
   - Audiencia: `sts.amazonaws.com`
   - Haz clic en **Obtener huella digital** (*Get thumbprint*).
   - Haz clic en **Agregar proveedor**.

---

## 7. Creación del Rol de IAM para GitHub Actions

Crearemos un rol de IAM específico que solo podrá ser asumido por el repositorio `Yoshua-G12/YG_Arquitectura_de_Sistemas_I_Tareas` cuando la ejecución ocurra en la rama `hw-04`.

1. En **IAM**, ve a **Roles** > **Crear rol** (*Create role*).
2. Tipo de entidad de confianza: **Identidad web** (*Web identity*).
   - Proveedor de identidad: `token.actions.githubusercontent.com`
   - Audiencia: `sts.amazonaws.com`
3. Haz clic en **Siguiente**.
4. En permisos, no asignes ninguna política administrada por el momento. Haz clic en **Siguiente**.
5. Nombre del rol: `<NOMBRE-DEL-ROL>` (por ejemplo, `GitHubActions-HW04-DeployRole`).
6. En la sección **Revisar política de confianza** (*Edit trust policy*), reemplázala con el siguiente JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<TU-AWS-ACCOUNT-ID>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:Yoshua-G12/YG_Arquitectura_de_Sistemas_I_Tareas:ref:refs/heads/hw-04"
        }
      }
    }
  ]
}
```

7. Haz clic en **Crear rol**.

---

## 8. Asignación de Permisos Mínimos al Rol (Least Privilege)

El rol solo debe tener los permisos estrictamente necesarios para sincronizar archivos en el bucket de S3 e invalidar la caché en CloudFront.

1. Abre el rol recién creado (`<NOMBRE-DEL-ROL>`).
2. En la pestaña **Permisos**, haz clic en **Agregar permisos** > **Crear política integrada** (*Create inline policy*).
3. Selecciona la pestaña **JSON** y pega la siguiente política:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3SyncDeploymentPermissions",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::<TU-BUCKET-NAME>",
        "arn:aws:s3:::<TU-BUCKET-NAME>/*"
      ]
    },
    {
      "Sid": "CloudFrontInvalidationPermissions",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::<TU-AWS-ACCOUNT-ID>:distribution/<TU-DISTRIBUTION-ID>"
    }
  ]
}
```

4. Haz clic en **Siguiente**, asigna el nombre `HW04-DeploymentPermissions` a la política y haz clic en **Crear política**.
5. Copia el **ARN del rol** (ejemplo: `arn:aws:iam::<TU-AWS-ACCOUNT-ID>:role/<NOMBRE-DEL-ROL>`).

---

## 9. Configuración en GitHub Actions

En tu repositorio de GitHub, configura los valores requeridos para que el workflow `.github/workflows/deploy.yml` pueda ejecutarse:

1. Ve a tu repositorio en GitHub: `https://github.com/Yoshua-G12/YG_Arquitectura_de_Sistemas_I_Tareas`.
2. Ve a **Settings** > **Secrets and variables** > **Actions**.
3. En la pestaña **Secrets** (o **Variables**), crea los siguientes registros:

| Nombre | Tipo | Valor |
|---|---|---|
| `AWS_ROLE_ARN` | Secret | `arn:aws:iam::<TU-AWS-ACCOUNT-ID>:role/<NOMBRE-DEL-ROL>` |
| `AWS_REGION` | Secret o Variable | Tu región de AWS (ej. `us-east-1`) |
| `S3_BUCKET` | Secret o Variable | El nombre de tu bucket (ej. `<TU-BUCKET-NAME>`) |
| `CLOUDFRONT_DISTRIBUTION_ID` | Secret o Variable | El ID de distribución (ej. `<TU-DISTRIBUTION-ID>`) |

---

## 10. Ejecución y Validación del Pipeline

1. Realiza un `git push` a la rama `hw-04` o ve a la pestaña **Actions** en GitHub, selecciona el flujo **Deploy HW-04 to AWS S3 & CloudFront** y presiona **Run workflow**.
2. Observa la ejecución de cada paso:
   - `Checkout repository`
   - `Setup Node.js LTS`
   - `Install dependencies (npm ci)`
   - `Build project with Vite`
   - `Configure AWS credentials via OIDC`
   - `Sync dist/ to Amazon S3`
   - `Invalidate CloudFront cache`
3. En CloudFront, copia el **Nombre de dominio de distribución** (*Distribution domain name*):
   `https://<TU-DISTRIBUTION-ID-O-SUBDOMINIO>.cloudfront.net`
4. Abre esa URL en tu navegador web. Debe cargar la página web de la HW-04 con el estado activo.

---

## 11. Diagnóstico de Errores Comunes (Troubleshooting)

| Síntoma | Causa Probable | Solución |
|---|---|---|
| Error `AccessDenied (403)` en el navegador | Falta configurar el **Default root object** en CloudFront o la política del bucket S3 no autoriza el OAC. | Revisa en CloudFront que `Default root object` sea `index.html`. Verifica que la política del bucket S3 incluya el `AWS:SourceArn` exacto de tu distribución. |
| Error `Not Authorized to assume role` en GitHub Actions | La condición `sub` en la Trust Policy del rol no coincide con el repositorio o la rama. | Verifica que en la Trust Policy del rol de IAM el claim `sub` sea exactamente: `repo:Yoshua-G12/YG_Arquitectura_de_Sistemas_I_Tareas:ref:refs/heads/hw-04`. |
| Error en `aws s3 sync`: `Access Denied` | El rol de IAM no tiene permisos sobre el bucket o el nombre del bucket está mal escrito en el secreto. | Verifica que el secreto `S3_BUCKET` sea correcto y que la política inline del rol contenga `arn:aws:s3:::<TU-BUCKET-NAME>` y `arn:aws:s3:::<TU-BUCKET-NAME>/*`. |
| La página no refleja cambios tras el despliegue | La invalidación de CloudFront falló o la caché del navegador aún está activa. | Comprueba que el paso de invalidación haya terminado exitosamente en GitHub Actions y realiza una recarga forzada en el navegador (`Ctrl + F5` o `Cmd + Shift + R`). |
