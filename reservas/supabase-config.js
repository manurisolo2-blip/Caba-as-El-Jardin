/* =========================================================================
   CONFIGURACIÓN DE SUPABASE (base de datos de reservas)
   -------------------------------------------------------------------------
   Completar con los datos de TU proyecto de Supabase.
   Paso a paso en RESERVAS-GUIA.md (paso 4).

   url             -> "Project URL" del proyecto.
                      Formato: https://xxxxxxxxxxxxxxxxxxxx.supabase.co
   publishableKey  -> clave "Publishable" (empieza con sb_publishable_).
                      En proyectos antiguos puede figurar como clave "anon public".

   ¿Es seguro que esta clave quede visible en la página? SÍ.
   La clave publishable está hecha para usarse en sitios web públicos:
   solamente permite lo que habilitan las reglas de seguridad
   (consultar disponibilidad y crear solicitudes de reserva).

   NUNCA pegar acá la clave "secret" (sb_secret_...) ni la "service_role":
   esas claves dan acceso total a la base de datos. Si por error se usa una,
   la página la rechaza y no se conecta.

   Mientras estos datos estén vacíos, el sitio funciona en "modo sin base de
   datos": el calendario muestra solo las fechas cargadas en script.js y las
   consultas se envían únicamente por WhatsApp (no se guardan).
   ========================================================================= */

window.SUPABASE_CONFIG = {
  url: "",
  publishableKey: ""
};
