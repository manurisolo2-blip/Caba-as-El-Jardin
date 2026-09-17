/* =========================================================================
   reservas-api.js
   -------------------------------------------------------------------------
   Conexión con la base de datos de Supabase. La usan la página principal
   (script.js) y el panel de administración (admin/admin.js).
   No hace falta editar este archivo: los datos van en supabase-config.js.

   Si en el futuro se cambia de servicio de base de datos, alcanza con
   reescribir estas funciones manteniendo lo que reciben y devuelven.
   ========================================================================= */

(function () {
  "use strict";

  const config = window.SUPABASE_CONFIG || {};
  const url = String(config.url || "").trim().replace(/\/+$/, "");
  const clave = String(config.publishableKey || "").trim();

  /* Evita usar por error una clave con acceso total */
  function esClavePrivada(valor) {
    if (valor.startsWith("sb_secret_")) return true;
    const partes = valor.split(".");
    if (partes.length === 3) {
      try {
        const datos = JSON.parse(atob(partes[1].replace(/-/g, "+").replace(/_/g, "/")));
        return datos.role === "service_role";
      } catch (error) {
        return false;
      }
    }
    return false;
  }

  const clavePrivada = clave !== "" && esClavePrivada(clave);
  if (clavePrivada) {
    console.error("[Reservas] La clave de reservas/supabase-config.js es PRIVADA (secret/service_role). Reemplazala por la clave Publishable. No se conectará.");
  }

  const configurado = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url) && clave.length > 20 && !clavePrivada;

  let cliente = null;
  function obtenerCliente() {
    if (!configurado) throw crearError("SIN_CONFIGURAR");
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      throw crearError("SIN_LIBRERIA", "No se pudo cargar la librería de Supabase");
    }
    if (!cliente) cliente = window.supabase.createClient(url, clave);
    return cliente;
  }

  function crearError(codigo, detalle) {
    const error = new Error(detalle || codigo);
    error.codigo = codigo;
    return error;
  }

  /* Traduce los errores técnicos a códigos simples */
  function normalizarError(error) {
    if (!error) return crearError("DESCONOCIDO");
    if (error.codigo) return error;
    const texto = `${error.message || ""} ${error.details || ""} ${error.hint || ""}`;
    const codigo = String(error.code || "");
    let resultado = "DESCONOCIDO";

    if (codigo === "23P01" || /FECHAS_BLOQUEADAS/.test(texto)) resultado = "FECHAS_OCUPADAS";
    else if (codigo === "42501") resultado = "NO_PERMITIDO";
    else if (codigo === "23514" || codigo === "22007" || codigo === "22P02") resultado = "DATOS_INVALIDOS";
    else if (codigo === "PGRST202" || codigo === "PGRST205" || codigo === "42P01" || codigo === "42883") resultado = "BASE_SIN_PREPARAR";
    else if (/invalid login credentials/i.test(texto) || codigo === "invalid_credentials") resultado = "CREDENCIALES";
    else if (/email not confirmed/i.test(texto)) resultado = "EMAIL_SIN_CONFIRMAR";
    else if (/failed to fetch|network|load failed/i.test(texto)) resultado = "SIN_CONEXION";

    const normalizado = crearError(resultado, error.message);
    normalizado.original = error;
    return normalizado;
  }

  async function ejecutar(promesa) {
    let respuesta;
    try {
      respuesta = await promesa;
    } catch (error) {
      throw normalizarError(error);
    }
    if (respuesta.error) throw normalizarError(respuesta.error);
    return respuesta.data;
  }

  const COLUMNAS_RESERVA = "id, cabana, fecha_entrada, fecha_salida, nombre_huesped, cantidad_huespedes, mensaje, creada_en, estado";

  window.ReservasAPI = {

    estaConfigurado() {
      return configurado;
    },

    /* ---------------- Público ---------------- */

    /* Devuelve [{ cabana, fecha_desde, fecha_hasta }] con las noches ocupadas
       (reservas no canceladas y bloqueos). Fechas "AAAA-MM-DD", ambas incluidas. */
    async obtenerDisponibilidad(desde, hasta) {
      const filas = await ejecutar(obtenerCliente().rpc("obtener_disponibilidad", { p_desde: desde, p_hasta: hasta }));
      return filas || [];
    },

    /* Crea una solicitud de reserva pendiente */
    async crearSolicitud({ cabana, fechaEntrada, fechaSalida, nombre, cantidadHuespedes, mensaje }) {
      await ejecutar(obtenerCliente().from("reservas").insert({
        cabana: Number(cabana),
        fecha_entrada: fechaEntrada,
        fecha_salida: fechaSalida,
        nombre_huesped: nombre,
        cantidad_huespedes: Number(cantidadHuespedes),
        mensaje: mensaje || null
      }));
    },

    /* ---------------- Administración ---------------- */

    async iniciarSesion(email, password) {
      const datos = await ejecutar(obtenerCliente().auth.signInWithPassword({ email, password }));
      return datos.session;
    },

    async cerrarSesion() {
      await ejecutar(obtenerCliente().auth.signOut());
    },

    async obtenerSesion() {
      const datos = await ejecutar(obtenerCliente().auth.getSession());
      return datos.session;
    },

    alCambiarSesion(funcion) {
      return obtenerCliente().auth.onAuthStateChange(funcion);
    },

    async esAdmin() {
      const resultado = await ejecutar(obtenerCliente().rpc("es_admin"));
      return resultado === true;
    },

    async listarReservas() {
      const filas = await ejecutar(obtenerCliente()
        .from("reservas")
        .select(COLUMNAS_RESERVA)
        .order("fecha_entrada", { ascending: true }));
      return filas || [];
    },

    async cambiarEstadoReserva(id, estado) {
      const filas = await ejecutar(obtenerCliente()
        .from("reservas")
        .update({ estado })
        .eq("id", id)
        .select("id"));
      if (!filas || !filas.length) throw crearError("NO_PERMITIDO");
    },

    async eliminarReserva(id) {
      const filas = await ejecutar(obtenerCliente()
        .from("reservas")
        .delete()
        .eq("id", id)
        .select("id"));
      if (!filas || !filas.length) throw crearError("NO_PERMITIDO");
    },

    async listarBloqueos() {
      const filas = await ejecutar(obtenerCliente()
        .from("bloqueos")
        .select("id, cabana, fecha_desde, fecha_hasta, motivo, creado_en")
        .order("fecha_desde", { ascending: true }));
      return filas || [];
    },

    /* lista: [{ cabana, fecha_desde, fecha_hasta, motivo }] */
    async crearBloqueos(lista) {
      await ejecutar(obtenerCliente().from("bloqueos").insert(lista));
    },

    async eliminarBloqueo(id) {
      const filas = await ejecutar(obtenerCliente()
        .from("bloqueos")
        .delete()
        .eq("id", id)
        .select("id"));
      if (!filas || !filas.length) throw crearError("NO_PERMITIDO");
    }
  };
})();
