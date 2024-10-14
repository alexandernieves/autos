Aquí tienes el archivo `README.md` completo y formateado para que lo uses directamente en tu repositorio de GitHub:

```markdown
# API Node.js - Despliegue en Azure App Service

Este proyecto es una API construida con Node.js que permite la autenticación de usuarios, restablecimiento de contraseñas, manejo de referidos, entre otros. El proyecto está diseñado para ser desplegado en **Azure App Service** y conectarse a una base de datos **Azure SQL**.

## Requisitos previos

- [Azure CLI](https://docs.microsoft.com/es-es/cli/azure/install-azure-cli) instalado
- Cuenta de [Azure](https://portal.azure.com) activa
- [Node.js](https://nodejs.org/) y [npm](https://www.npmjs.com/) instalados
- Base de datos **Azure SQL** configurada

## Clonar el repositorio

1. Abre una terminal y clona este repositorio en tu máquina local:

   ```bash
   git clone https://github.com/tu-usuario/tu-repositorio.git
   ```

2. Entra en el directorio del proyecto:

   ```bash
   cd tu-repositorio
   ```

## Instalación de dependencias

Instala las dependencias necesarias para el proyecto con el siguiente comando:

```bash
npm install
```

Esto instalará las librerías como `express`, `jsonwebtoken`, `bcryptjs`, `nodemailer`, y `mssql`.

## Configuración

1. Crea un archivo `.env` en la raíz del proyecto con las siguientes variables de entorno:

   ```bash
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_SERVER=your_db_server
   DB_NAME=your_db_name
   JWT_SECRET=your_jwt_secret
   GMAIL_USER=your_gmail_user
   GMAIL_PASSWORD=your_gmail_password
   ```

   Asegúrate de reemplazar los valores con tus credenciales correctas.

## Despliegue en Azure App Service

### 1. Iniciar sesión en Azure CLI

Primero, asegúrate de estar autenticado en Azure:

```bash
az login
```

Esto abrirá una ventana del navegador para iniciar sesión con tu cuenta de Azure.

### 2. Crear un App Service en Azure

1. **Crear un plan de App Service**:

   ```bash
   az appservice plan create --name MiPlanDeApp --resource-group MiGrupoDeRecursos --sku B1 --is-linux
   ```

2. **Crear la aplicación web**:

   ```bash
   az webapp create --resource-group MiGrupoDeRecursos --plan MiPlanDeApp --name MiAppNode --runtime "NODE|14-lts"
   ```

Esto creará una aplicación en Linux con Node.js 14.x.

### 3. Configurar variables de entorno en Azure

Para que la aplicación tenga acceso a las credenciales y otros valores necesarios, agrega las variables de entorno en Azure:

```bash
az webapp config appsettings set --resource-group MiGrupoDeRecursos --name MiAppNode --settings DB_USER=your_db_user DB_PASSWORD=your_db_password DB_SERVER=your_db_server DB_NAME=your_db_name JWT_SECRET=your_jwt_secret GMAIL_USER=your_gmail_user GMAIL_PASSWORD=your_gmail_password
```

### 4. Subir el código a Azure

Desde la raíz de tu proyecto (donde está `server.js`), ejecuta el siguiente comando para desplegar la aplicación en Azure:

```bash
az webapp up --name MiAppNode --resource-group MiGrupoDeRecursos --runtime "NODE|14-lts"
```

### 5. Conectar tu App Service a la base de datos de Azure SQL

1. Ve a **Azure Portal**: [Azure Portal](https://portal.azure.com).
2. Dirígete a tu base de datos **Azure SQL**.
3. Entra a la opción **Firewalls y redes virtuales**.
4. Agrega las IPs necesarias para que el App Service pueda acceder a la base de datos.

### 6. Probar la aplicación

Una vez que la aplicación esté desplegada, puedes acceder a la URL pública de tu API. Encuentra esta URL ejecutando:

```bash
az webapp show --resource-group MiGrupoDeRecursos --name MiAppNode --query "defaultHostName" -o tsv
```

Ahora puedes probar tus endpoints (`/login`, `/signup`, etc.) desde un navegador o una herramienta como Postman usando la URL proporcionada.

## Ejemplo de uso de la API

### Registro de usuario

```bash
POST /signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "johndoe@example.com",
  "password": "securepassword",
  "role": "user"
}
```

### Inicio de sesión

```bash
POST /login
Content-Type: application/json

{
  "email": "johndoe@example.com",
  "password": "securepassword"
}
```

---

## Recursos útiles

- [Documentación de Azure App Service](https://docs.microsoft.com/azure/app-service/)
- [Documentación de Azure SQL Database](https://docs.microsoft.com/azure/sql-database/)
- [Azure CLI](https://docs.microsoft.com/cli/azure/)

