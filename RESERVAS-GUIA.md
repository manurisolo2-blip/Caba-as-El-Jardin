# Guía del sistema de reservas

Esta guía explica, paso a paso, cómo poner en marcha las reservas online del sitio.
No hace falta saber programar. Todo es gratuito.

- **Base de datos:** Supabase (plan gratuito).
- **Publicación del sitio:** GitHub Pages (gratuito).
- **Tiempo estimado:** 30 a 45 minutos la primera vez.

> Los nombres de botones y menús de Supabase y GitHub pueden cambiar un poco con el tiempo.
> Si algo no aparece exactamente con el mismo nombre, buscá la opción más parecida.

---

## Cómo funciona

1. Un visitante elige cabaña, fechas y cantidad de huéspedes, escribe su nombre y toca **Consultar por WhatsApp**.
2. La solicitud se guarda en la base de datos como **Pendiente** y se abre WhatsApp con el mensaje armado.
3. Desde ese momento, esas fechas aparecen como **Reservada** para cualquier persona, en cualquier celular o computadora.
4. Desde el **panel de administración** confirmás, cancelás o eliminás la reserva. Si la cancelás, las fechas vuelven a quedar libres.

### Qué puede hacer cada uno

| Acción | Visitante | Administrador |
| --- | --- | --- |
| Ver disponibilidad (sin nombres ni datos de huéspedes) | Sí | Sí |
| Crear una solicitud de reserva | Sí | Sí |
| Ver reservas y datos de huéspedes | No | Sí |
| Confirmar, cancelar o eliminar reservas | No | Sí |
| Bloquear y desbloquear fechas | No | Sí |

Estas reglas las aplica la propia base de datos: aunque alguien modifique la página desde su navegador, no puede saltearlas.

### Qué datos se guardan

Solo lo necesario: cabaña, fecha de entrada, fecha de salida, nombre, cantidad de huéspedes, mensaje opcional, fecha de la solicitud y estado.
No se guardan teléfonos, correos ni documentos: el contacto sigue por WhatsApp.

### Archivos del sistema de reservas

```
index.html, styles.css, script.js   Sitio (se mantienen)
reservas/
  supabase-config.js                 <- ACÁ van los datos de tu proyecto (paso 4)
  reservas-api.js                    Conexión con la base de datos (no editar)
admin/
  index.html, admin.css, admin.js    Panel de administración
supabase/
  1-crear-base-de-datos.sql          Tablas y reglas de seguridad (paso 3)
  2-agregar-administrador.sql        Permisos del administrador (paso 5)
```

---

## Paso 1. Crear la cuenta en Supabase

1. Entrá a **https://supabase.com**.
2. Tocá **Start your project** (o **Sign up**).
3. Registrate con tu cuenta de GitHub o con un correo y contraseña.
4. Si te lo pide, confirmá el correo desde el mensaje que te envían.

No hace falta tarjeta de crédito para el plan gratuito.

## Paso 2. Crear el proyecto

1. Dentro de Supabase tocá **New project**.
2. Si te pide una organización, creá una con cualquier nombre (por ejemplo, el nombre del complejo) y elegí el plan **Free**.
3. Completá:
   - **Name:** por ejemplo `cabanas`.
   - **Database Password:** tocá generar una contraseña y **guardala en un lugar seguro**.
     No se usa en el sitio, pero sirve para recuperar el proyecto.
   - **Region:** la más cercana a Argentina (por ejemplo, São Paulo / South America).
4. Tocá **Create new project** y esperá unos minutos hasta que termine de prepararse.

## Paso 3. Crear la base de datos

1. En el menú de la izquierda, abrí **SQL Editor**.
2. Tocá **New query**.
3. Abrí el archivo `supabase/1-crear-base-de-datos.sql` con el Bloc de notas, copiá **todo** el contenido y pegalo en el editor.
4. Tocá **Run**.
5. Debe aparecer un mensaje de éxito (por ejemplo, *Success. No rows returned*).
6. Para comprobarlo, abrí **Table Editor**: tienen que aparecer las tablas `reservas`, `bloqueos` y `administradores`.

Este script se puede ejecutar de nuevo sin perder reservas.

## Paso 4. Obtener los datos de conexión y colocarlos en el proyecto

Necesitás dos datos: la **dirección del proyecto** y la **clave publishable**.

1. Abrí **Project Settings** (ícono de engranaje, abajo a la izquierda).
2. **Dirección del proyecto (Project URL):** está en la sección **Data API** (también aparece al tocar el botón **Connect** del proyecto).
   Tiene este formato: `https://xxxxxxxxxxxxxxxxxxxx.supabase.co`
3. **Clave publishable:** está en la sección **API Keys**. Copiá la clave **Publishable**, que empieza con `sb_publishable_`.
   En proyectos antiguos puede aparecer como clave **anon public**: en ese caso, usá esa.
4. Abrí `reservas/supabase-config.js` con el Bloc de notas y completá:

```js
window.SUPABASE_CONFIG = {
  url: "https://xxxxxxxxxxxxxxxxxxxx.supabase.co",
  publishableKey: "sb_publishable_..."
};
```

5. Guardá el archivo.

### Sobre la seguridad de las claves

- La clave **publishable** está pensada para usarse en páginas públicas. Solo permite lo que las reglas autorizan (ver disponibilidad y crear solicitudes). Es normal que quede visible.
- **Nunca** pegues en el proyecto la clave **secret** (`sb_secret_...`) ni la **service_role**: dan acceso total. Si se pega una por error, el sitio la rechaza y no se conecta.
- La contraseña de la base de datos (paso 2) tampoco va en ningún archivo.

## Paso 5. Crear el usuario administrador

### 5.1 Crear el usuario

1. En el menú de la izquierda, abrí **Authentication** y luego **Users**.
2. Tocá **Add user** y elegí crear un usuario nuevo (**Create new user**).
3. Escribí el correo y una contraseña segura (larga, que no uses en otro lado).
4. Si aparece la opción de confirmar automáticamente el usuario (**Auto Confirm User**), dejala activada.
5. Tocá el botón para crear el usuario.

### 5.2 Darle permisos de administrador

1. Abrí `supabase/2-agregar-administrador.sql` con el Bloc de notas.
2. Reemplazá `CORREO_DEL_ADMINISTRADOR` por el correo del usuario creado, dejando las comillas simples.
3. En **SQL Editor** > **New query**, pegá el contenido y tocá **Run**.
4. Abajo debe aparecer una fila con ese correo. Eso confirma que quedó registrado.

### 5.3 Recomendado: desactivar registros nuevos

En **Authentication**, dentro de la configuración de inicio de sesión o proveedores, desactivá la opción que permite que usuarios nuevos se registren solos (suele llamarse *Allow new users to sign up*).
La seguridad **no** depende de esto: aunque alguien creara un usuario, no tendría permisos de administrador. Pero evita cuentas innecesarias.

## Paso 6. Reglas de seguridad

Las reglas ya quedaron configuradas en el paso 3. Resumen de lo que hacen:

- **Reservas:** cualquier visitante puede crear una solicitud, siempre como *Pendiente*, con entrada desde hoy, hasta unos 13 meses adelante y de hasta 30 noches. Solo el administrador puede verlas, modificarlas o eliminarlas.
- **Reservas superpuestas:** la base de datos rechaza dos reservas activas de la misma cabaña en las mismas noches, aunque se envíen al mismo tiempo desde dos celulares.
- **Bloqueos:** solo el administrador puede crearlos o quitarlos. Nadie puede solicitar noches bloqueadas.
- **Disponibilidad pública:** los visitantes solo reciben cabaña y noches ocupadas, sin nombres ni mensajes.
- **Administradores:** la lista no se puede leer ni modificar desde la web; solo desde el SQL Editor.

Para revisarlas: en **Table Editor**, cada tabla debe figurar con **RLS** activado, y en **Authentication** > **Policies** (o en la configuración de cada tabla) se ven las reglas creadas.

Si el **Security Advisor** de Supabase muestra un aviso sobre la función `obtener_disponibilidad` por ser *security definer*, es esperado: está hecha así a propósito para mostrar la disponibilidad sin exponer los datos de los huéspedes.

## Paso 7. Probar una reserva

La forma más confiable de probar es con el sitio ya publicado (paso 9). También podés abrir `index.html` con doble clic; si el calendario muestra *No pudimos cargar la disponibilidad*, probá con la versión publicada.

1. Abrí el sitio y andá a **Disponibilidad**.
2. Elegí **Cabaña 1**, una fecha de entrada y una de salida.
3. Elegí la cantidad de huéspedes, escribí un nombre de prueba y tocá **Consultar por WhatsApp**.
4. Tiene que aparecer **¡Solicitud enviada!** y las fechas deben pasar a mostrarse como **Reservada**.
5. En Supabase, abrí **Table Editor** > `reservas`: tiene que estar la fila con estado `pendiente`.
6. Abrí el panel: la dirección del sitio + `/admin/` (por ejemplo `https://tu-usuario.github.io/tu-sitio/admin/`).
7. Iniciá sesión con el usuario del paso 5. Vas a ver la reserva en **Pendientes**.
8. Probá **Confirmar**, después **Cancelar** (las fechas se liberan en el sitio) y por último **Eliminar**.
9. En **Bloqueo de fechas**, bloqueá una noche y verificá en el sitio que aparece como **Reservada**. Después desbloqueala.

Mientras `CONFIG.whatsapp` esté vacío en `script.js`, la solicitud se guarda igual, pero WhatsApp no se abre y aparece un aviso.
Para cargar el número: `script.js` > `CONFIG` > `whatsapp`, solo números, formato `549` + código de área sin 0 + número sin 15.

## Paso 8. Probar desde otro dispositivo

1. En tu computadora, creá una reserva de prueba (por ejemplo, Cabaña 1, tres noches).
2. En un celular, idealmente con datos móviles (no el mismo wifi), abrí la dirección publicada del sitio.
3. Elegí **Cabaña 1**: esas noches tienen que verse como **Reservada** y no se pueden seleccionar.
4. Desde el panel, cancelá la reserva. En el celular, recargá la página (o esperá unos 2 minutos, se actualiza sola): las fechas vuelven a estar disponibles.
5. Opcional: probá elegir las mismas fechas en dos dispositivos y enviar casi a la vez. Solo la primera se guarda; la segunda recibe el aviso de que esas fechas acaban de reservarse.

## Paso 9. Publicar en GitHub Pages

### 9.1 Crear el repositorio

1. Creá una cuenta gratuita en **https://github.com**.
2. Tocá **New repository** (botón **+** arriba a la derecha).
3. Nombre: por ejemplo `cabanas`. Elegí **Public** (GitHub Pages es gratuito para repositorios públicos).
4. Tocá **Create repository**.

### 9.2 Subir los archivos

1. En el repositorio, tocá **uploading an existing file** (o **Add file** > **Upload files**).
2. Arrastrá **todo el contenido** de la carpeta del proyecto: `index.html`, `styles.css`, `script.js`, `RESERVAS-GUIA.md` y las carpetas `images`, `reservas`, `admin` y `supabase`.
   `index.html` tiene que quedar en la raíz del repositorio, no dentro de otra carpeta.
3. Abajo, tocá **Commit changes**.

No hay nada secreto en estos archivos: la clave publishable puede ser pública.

### 9.3 Activar GitHub Pages

1. En el repositorio, abrí **Settings** > **Pages**.
2. En **Source** (o **Build and deployment**), elegí **Deploy from a branch**.
3. Branch: **main** y carpeta **/ (root)**. Tocá **Save**.
4. Esperá unos minutos. Arriba de esa misma página aparece la dirección, con el formato `https://tu-usuario.github.io/cabanas/`.
5. Panel de administración: `https://tu-usuario.github.io/cabanas/admin/`

### 9.4 Actualizar el sitio más adelante

Subí de nuevo los archivos modificados con **Add file** > **Upload files** y **Commit changes**. Los cambios se publican solos en unos minutos. Las reservas no se pierden: están en Supabase, no en GitHub.

---

## Mantenimiento

- **Pausa por inactividad:** Supabase pausa los proyectos gratuitos con poca actividad durante 7 días y avisa por correo antes. Con visitas normales al sitio no debería pasar. Si se pausa, entrá al panel de Supabase, abrí el proyecto y tocá **Resume project** (se puede restaurar hasta 90 días después, con todos los datos).
- **Solicitudes falsas:** cualquier persona puede enviar una solicitud, y mientras esté pendiente ocupa las fechas. Hay límites (hasta 30 noches, entrada desde hoy y un campo trampa contra robots). Si aparece una solicitud que no corresponde, cancelala o eliminala desde el panel.
- **Cambiar nombres de cabañas:** en `script.js` (`CONFIG.cabanas`) y también en `admin/admin.js` (`CABANAS`).
- **Cambiar la capacidad máxima (hoy 4):** en `script.js` (`capacidadMaxima` de cada cabaña) y en `supabase/1-crear-base-de-datos.sql` (el `4` de `cantidad_huespedes`); después volvé a ejecutar ese script.
- **Cambiar el máximo de noches (hoy 30):** en `script.js` (`estadiaMaxima`) y en el `30` del script SQL; después volvé a ejecutarlo.
- **Agregar otro administrador:** repetí el paso 5 con otro correo.
- **Copia de respaldo:** en **Table Editor**, desde la tabla `reservas`, se pueden exportar los datos (por ejemplo a CSV).
