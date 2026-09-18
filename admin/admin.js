/* =========================================================================
   admin.js | Panel de administración de reservas
   -------------------------------------------------------------------------
   Acceso protegido: requiere iniciar sesión con un usuario de Supabase
   registrado como administrador (ver RESERVAS-GUIA.md, paso 5).
   Aunque alguien abra esta página, sin usuario administrador la base de
   datos no le devuelve ningún dato ni le permite cambios.
   ========================================================================= */

"use strict";

/* EDITAR: nombres de las cabañas.
   Deben coincidir con los de script.js > CONFIG.cabanas (el número es el id). */
const CABANAS = {
  1: "Cabaña 1",
  2: "Cabaña 2",
  3: "Cabaña 3"
};


/* =========================================================================
   Utilidades
   ========================================================================= */

const $ = (selector, contexto = document) => contexto.querySelector(selector);
const $$ = (selector, contexto = document) => Array.from(contexto.querySelectorAll(selector));
const API = window.ReservasAPI;

function escaparHTML(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function icono(nombre) {
  return `<svg class="icon" aria-hidden="true"><use href="#i-${nombre}"></use></svg>`;
}

function nombreCabana(id) {
  return CABANAS[id] || `Cabaña ${id}`;
}

/* Fechas en formato "AAAA-MM-DD" (sin horas, sin problemas de zona horaria) */
function hoyClave() {
  const f = new Date();
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(f.getDate()).padStart(2, "0")}`;
}

function fechaTexto(clave) {
  const [anio, mes, dia] = clave.split("-");
  return `${dia}/${mes}/${anio}`;
}

function nochesEntre(desde, hasta) {
  const a = Date.UTC(...desde.split("-").map((n, i) => (i === 1 ? n - 1 : Number(n))));
  const b = Date.UTC(...hasta.split("-").map((n, i) => (i === 1 ? n - 1 : Number(n))));
  return Math.round((b - a) / 86400000);
}

function textoNoches(n) {
  return `${n} ${n === 1 ? "noche" : "noches"}`;
}

const formatoMes = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" });
const formatoFechaHora = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

function tituloMes(clave) {
  const [anio, mes] = clave.split("-").map(Number);
  const texto = formatoMes.format(new Date(anio, mes - 1, 1));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

let temporizadorAviso;
function aviso(mensaje) {
  const toast = $("#toast");
  toast.textContent = mensaje;
  toast.classList.add("is-visible");
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => toast.classList.remove("is-visible"), 4500);
}

const MENSAJES_ERROR = {
  CREDENCIALES: "Correo o contraseña incorrectos.",
  EMAIL_SIN_CONFIRMAR: "El usuario todavía no está confirmado en Supabase.",
  FECHAS_OCUPADAS: "No se puede: esas fechas se superponen con otra reserva activa o con un bloqueo.",
  NO_PERMITIDO: "Tu usuario no tiene permiso para esta acción. Volvé a iniciar sesión.",
  DATOS_INVALIDOS: "Los datos no son válidos. Revisalos e intentá de nuevo.",
  SIN_CONEXION: "No hay conexión a internet. Intentá de nuevo.",
  SIN_LIBRERIA: "No se pudo cargar Supabase. Recargá la página.",
  BASE_SIN_PREPARAR: "La base de datos no está preparada. Ejecutá supabase/1-crear-base-de-datos.sql (paso 3 de la guía).",
  DESCONOCIDO: "Ocurrió un error inesperado. Intentá de nuevo."
};

function mensajeError(error) {
  console.error("[Panel]", error);
  return MENSAJES_ERROR[error && error.codigo] || MENSAJES_ERROR.DESCONOCIDO;
}


/* =========================================================================
   Estado y vistas
   ========================================================================= */

const estado = {
  reservas: [],
  bloqueos: [],
  ocupado: false
};

function mostrarVista(nombre) {
  $$(".admin-vista").forEach((vista) => { vista.hidden = vista.id !== `vista-${nombre}`; });
}


/* =========================================================================
   Sesión
   ========================================================================= */

async function iniciar() {
  if (!API || !API.estaConfigurado()) {
    mostrarVista("config");
    return;
  }

  try {
    API.alCambiarSesion((evento) => {
      if (evento === "SIGNED_OUT") {
        estado.reservas = [];
        estado.bloqueos = [];
        mostrarVista("login");
      }
    });

    const sesion = await API.obtenerSesion();
    if (sesion) await entrarAlPanel(sesion);
    else mostrarVista("login");
  } catch (error) {
    mostrarVista("login");
    aviso(mensajeError(error));
  }
}

async function entrarAlPanel(sesion) {
  const esAdmin = await API.esAdmin();
  if (!esAdmin) {
    $("#sin-permiso-email").textContent = sesion.user.email;
    mostrarVista("sin-permiso");
    return;
  }
  $("#panel-email").textContent = sesion.user.email;
  mostrarVista("panel");
  await cargarDatos();
}

$("#login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = $("#login-email").value.trim();
  const password = $("#login-password").value;
  const error = $("#login-error");
  const boton = $("#login-boton");

  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email || !password) {
    error.textContent = "Ingresá el correo y la contraseña.";
    error.hidden = false;
    return;
  }

  if (!EMAIL_REGEX.test(email)) {
    error.textContent = "Ingresá un formato de correo electrónico válido.";
    error.hidden = false;
    return;
  }

  boton.disabled = true;
  boton.textContent = "Ingresando...";
  error.hidden = true;

  try {
    const sesion = await API.iniciarSesion(email, password);
    $("#login-password").value = "";
    await entrarAlPanel(sesion);
  } catch (err) {
    error.textContent = mensajeError(err);
    error.hidden = false;
  } finally {
    boton.disabled = false;
    boton.textContent = "Ingresar";
  }
});

document.addEventListener("click", async (e) => {
  if (!e.target.closest("[data-cerrar-sesion]")) return;
  try {
    await API.cerrarSesion();
  } catch (error) {
    aviso(mensajeError(error));
  }
  mostrarVista("login");
});


/* =========================================================================
   Carga de datos
   ========================================================================= */

async function cargarDatos() {
  const boton = $("#btn-actualizar");
  boton.classList.add("is-girando");
  try {
    const [reservas, bloqueos] = await Promise.all([API.listarReservas(), API.listarBloqueos()]);
    estado.reservas = reservas;
    estado.bloqueos = bloqueos;
    renderizarTodo();
  } catch (error) {
    aviso(mensajeError(error));
  } finally {
    boton.classList.remove("is-girando");
  }
}

function renderizarTodo() {
  renderizarResumen();
  renderizarReservas();
  renderizarBloqueos();
}

function renderizarResumen() {
  const hoy = hoyClave();
  const vigentes = estado.reservas.filter((r) => r.fecha_salida >= hoy);
  $("#stat-pendientes").textContent = vigentes.filter((r) => r.estado === "pendiente").length;
  $("#stat-confirmadas").textContent = vigentes.filter((r) => r.estado === "confirmada").length;
  $("#stat-bloqueos").textContent = estado.bloqueos.filter((b) => b.fecha_hasta >= hoy).length;
}


/* =========================================================================
   Reservas
   ========================================================================= */

function opcionesCabanas(incluirTodas, textoTodas) {
  let html = incluirTodas ? `<option value="">${textoTodas}</option>` : "";
  Object.keys(CABANAS).forEach((id) => {
    html += `<option value="${escaparHTML(id)}">${escaparHTML(CABANAS[id])}</option>`;
  });
  return html;
}

function reservasFiltradas() {
  const cabana = $("#filtro-cabana").value;
  const estadoFiltro = $("#filtro-estado").value;
  const fecha = $("#filtro-fecha").value;
  const pasadas = $("#filtro-pasadas").checked;
  const hoy = hoyClave();

  return estado.reservas.filter((r) => {
    if (cabana && String(r.cabana) !== cabana) return false;
    if (estadoFiltro && r.estado !== estadoFiltro) return false;
    if (fecha) return r.fecha_entrada <= fecha && fecha < r.fecha_salida;
    if (!pasadas && r.fecha_salida < hoy) return false;
    return true;
  });
}

const ETIQUETAS_ESTADO = { pendiente: "Pendiente", confirmada: "Confirmada", cancelada: "Cancelada" };

function htmlReserva(r) {
  const noches = nochesEntre(r.fecha_entrada, r.fecha_salida);
  const huespedes = `${r.cantidad_huespedes} ${r.cantidad_huespedes === 1 ? "huésped" : "huéspedes"}`;
  const creada = formatoFechaHora.format(new Date(r.creada_en));
  const id = escaparHTML(r.id);

  const acciones = [];
  if (r.estado !== "confirmada") {
    acciones.push(`<button class="btn btn--primary" type="button" data-accion="confirmar" data-id="${id}">${icono("check")}Confirmar</button>`);
  }
  if (r.estado !== "cancelada") {
    acciones.push(`<button class="btn btn--outline" type="button" data-accion="cancelar" data-id="${id}">${icono("close")}Cancelar</button>`);
  }
  acciones.push(`<button class="btn btn--text btn--peligro" type="button" data-accion="eliminar" data-id="${id}">${icono("trash")}Eliminar</button>`);

  return `
    <article class="reserva reserva--${escaparHTML(r.estado)}">
      <div class="reserva__principal">
        <span class="reserva__cabana">${escaparHTML(nombreCabana(r.cabana))}</span>
        <h3 class="reserva__nombre">${escaparHTML(r.nombre_huesped)}</h3>
        <p class="reserva__dato">${icono("calendar")}<span><strong>${fechaTexto(r.fecha_entrada)}</strong> al <strong>${fechaTexto(r.fecha_salida)}</strong> · ${textoNoches(noches)}</span></p>
        <p class="reserva__dato">${icono("users")}<span>${huespedes}</span></p>
        <p class="reserva__dato reserva__dato--suave">${icono("clock")}<span>Solicitada el ${escaparHTML(creada)}</span></p>
        ${r.mensaje ? `<p class="reserva__mensaje">${icono("message")}<span>${escaparHTML(r.mensaje)}</span></p>` : ""}
      </div>
      <div class="reserva__lateral">
        <span class="badge badge--${escaparHTML(r.estado)}">${ETIQUETAS_ESTADO[r.estado] || escaparHTML(r.estado)}</span>
        <div class="reserva__acciones">${acciones.join("")}</div>
      </div>
    </article>`;
}

function renderizarReservas() {
  const lista = reservasFiltradas();
  const contenedor = $("#reservas-lista");
  $("#reservas-contador").textContent = `${lista.length} ${lista.length === 1 ? "reserva" : "reservas"}`;

  if (!lista.length) {
    contenedor.innerHTML = `<p class="admin-vacio">No hay reservas para mostrar con estos filtros.</p>`;
    return;
  }

  let html = "";
  let mesActual = "";
  lista.forEach((r) => {
    const mes = r.fecha_entrada.slice(0, 7);
    if (mes !== mesActual) {
      mesActual = mes;
      html += `<h2 class="admin-grupo">${escaparHTML(tituloMes(r.fecha_entrada))}</h2>`;
    }
    html += htmlReserva(r);
  });
  contenedor.innerHTML = html;
}

async function ejecutarAccion(boton, accion, id) {
  const reserva = estado.reservas.find((r) => r.id === id);
  if (!reserva || estado.ocupado) return;
  const descripcion = `${nombreCabana(reserva.cabana)} | ${reserva.nombre_huesped} | ${fechaTexto(reserva.fecha_entrada)} al ${fechaTexto(reserva.fecha_salida)}`;

  if (accion === "cancelar" && !window.confirm(`¿Cancelar esta reserva?\n\n${descripcion}\n\nLas fechas vuelven a quedar disponibles en el sitio.`)) return;
  if (accion === "eliminar" && !window.confirm(`¿Eliminar DEFINITIVAMENTE esta reserva?\n\n${descripcion}\n\nNo se puede deshacer.`)) return;

  estado.ocupado = true;
  boton.disabled = true;
  try {
    if (accion === "confirmar") {
      await API.cambiarEstadoReserva(id, "confirmada");
      aviso("Reserva confirmada.");
    } else if (accion === "cancelar") {
      await API.cambiarEstadoReserva(id, "cancelada");
      aviso("Reserva cancelada. Las fechas quedaron libres.");
    } else if (accion === "eliminar") {
      await API.eliminarReserva(id);
      aviso("Reserva eliminada.");
    }
    await cargarDatos();
  } catch (error) {
    aviso(mensajeError(error));
    boton.disabled = false;
  } finally {
    estado.ocupado = false;
  }
}

$("#reservas-lista").addEventListener("click", (e) => {
  const boton = e.target.closest("[data-accion]");
  if (boton) ejecutarAccion(boton, boton.dataset.accion, boton.dataset.id);
});

["#filtro-cabana", "#filtro-estado", "#filtro-fecha", "#filtro-pasadas"].forEach((selector) => {
  $(selector).addEventListener("change", renderizarReservas);
});

$("#filtro-limpiar").addEventListener("click", () => {
  $("#filtro-cabana").value = "";
  $("#filtro-estado").value = "";
  $("#filtro-fecha").value = "";
  $("#filtro-pasadas").checked = false;
  renderizarReservas();
});


/* =========================================================================
   Bloqueos
   ========================================================================= */

function renderizarBloqueos() {
  const hoy = hoyClave();
  const mostrarPasados = $("#bloqueos-pasados").checked;
  const lista = estado.bloqueos.filter((b) => mostrarPasados || b.fecha_hasta >= hoy);
  const contenedor = $("#bloqueos-lista");

  if (!lista.length) {
    contenedor.innerHTML = `<p class="admin-vacio">No hay fechas bloqueadas.</p>`;
    return;
  }

  contenedor.innerHTML = lista.map((b) => {
    const noches = nochesEntre(b.fecha_desde, b.fecha_hasta) + 1;
    const rango = b.fecha_desde === b.fecha_hasta
      ? `Noche del ${fechaTexto(b.fecha_desde)}`
      : `Noches del ${fechaTexto(b.fecha_desde)} al ${fechaTexto(b.fecha_hasta)}`;
    return `
      <div class="bloqueo">
        <div class="bloqueo__info">
          <strong>${escaparHTML(nombreCabana(b.cabana))}</strong>
          <span>${rango} (${textoNoches(noches)})${b.motivo ? ` · ${escaparHTML(b.motivo)}` : ""}</span>
        </div>
        <button class="btn btn--outline" type="button" data-desbloquear="${escaparHTML(b.id)}">${icono("unlock")}Desbloquear</button>
      </div>`;
  }).join("");
}

$("#bloqueos-pasados").addEventListener("change", renderizarBloqueos);

$("#bloqueos-lista").addEventListener("click", async (e) => {
  const boton = e.target.closest("[data-desbloquear]");
  if (!boton || estado.ocupado) return;
  const bloqueo = estado.bloqueos.find((b) => b.id === boton.dataset.desbloquear);
  if (!bloqueo) return;
  if (!window.confirm(`¿Desbloquear ${nombreCabana(bloqueo.cabana)} del ${fechaTexto(bloqueo.fecha_desde)} al ${fechaTexto(bloqueo.fecha_hasta)}?`)) return;

  estado.ocupado = true;
  boton.disabled = true;
  try {
    await API.eliminarBloqueo(bloqueo.id);
    aviso("Fechas desbloqueadas.");
    await cargarDatos();
  } catch (error) {
    aviso(mensajeError(error));
    boton.disabled = false;
  } finally {
    estado.ocupado = false;
  }
});

$("#bloqueo-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (estado.ocupado) return;

  const cabana = $("#bloqueo-cabana").value;
  const desde = $("#bloqueo-desde").value;
  const hasta = $("#bloqueo-hasta").value;
  const motivo = $("#bloqueo-motivo").value.trim().slice(0, 120);

  if (!desde || !hasta) {
    aviso("Elegí la primera y la última noche a bloquear.");
    return;
  }
  if (hasta < desde) {
    aviso("La última noche no puede ser anterior a la primera.");
    return;
  }

  const cabanas = cabana === "todas" ? Object.keys(CABANAS).map(Number) : [Number(cabana)];

  /* Aviso si hay reservas activas en esas noches */
  const superpuestas = estado.reservas.filter((r) =>
    r.estado !== "cancelada" &&
    cabanas.includes(Number(r.cabana)) &&
    r.fecha_entrada <= hasta && r.fecha_salida > desde
  );
  if (superpuestas.length) {
    const detalle = superpuestas
      .map((r) => `- ${nombreCabana(r.cabana)}: ${r.nombre_huesped} (${fechaTexto(r.fecha_entrada)} al ${fechaTexto(r.fecha_salida)})`)
      .join("\n");
    if (!window.confirm(`Atención: hay reservas activas en esas fechas:\n\n${detalle}\n\nEl bloqueo no las cancela. ¿Bloquear igual?`)) return;
  }

  const boton = $("#bloqueo-boton");
  estado.ocupado = true;
  boton.disabled = true;
  try {
    await API.crearBloqueos(cabanas.map((id) => ({
      cabana: id,
      fecha_desde: desde,
      fecha_hasta: hasta,
      motivo: motivo || null
    })));
    aviso("Fechas bloqueadas.");
    $("#bloqueo-form").reset();
    await cargarDatos();
  } catch (error) {
    aviso(mensajeError(error));
  } finally {
    estado.ocupado = false;
    boton.disabled = false;
  }
});

$("#bloqueo-desde").addEventListener("change", (e) => {
  const hasta = $("#bloqueo-hasta");
  hasta.min = e.target.value;
  if (!hasta.value || hasta.value < e.target.value) hasta.value = e.target.value;
});


/* =========================================================================
   Pestañas y accesos rápidos
   ========================================================================= */

function activarPestana(nombre) {
  ["reservas", "bloqueos"].forEach((pestana) => {
    const activa = pestana === nombre;
    const tab = $(`#tab-${pestana}`);
    tab.classList.toggle("is-active", activa);
    tab.setAttribute("aria-selected", String(activa));
    tab.tabIndex = activa ? 0 : -1;
    $(`#panel-${pestana}`).hidden = !activa;
  });
}

$("#tab-reservas").addEventListener("click", () => activarPestana("reservas"));
$("#tab-bloqueos").addEventListener("click", () => activarPestana("bloqueos"));
$(".admin-tabs").addEventListener("keydown", (e) => {
  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
  const siguiente = $("#tab-reservas").classList.contains("is-active") ? "bloqueos" : "reservas";
  activarPestana(siguiente);
  $(`#tab-${siguiente}`).focus();
});

$$("[data-filtro-rapido]").forEach((boton) => {
  boton.addEventListener("click", () => {
    activarPestana("reservas");
    $("#filtro-estado").value = boton.dataset.filtroRapido;
    $("#filtro-fecha").value = "";
    $("#filtro-pasadas").checked = false;
    renderizarReservas();
  });
});

$("[data-ir-bloqueos]").addEventListener("click", () => activarPestana("bloqueos"));
$("#btn-actualizar").addEventListener("click", cargarDatos);


/* =========================================================================
   Inicio
   ========================================================================= */

$("#filtro-cabana").innerHTML = opcionesCabanas(true, "Todas");
$("#bloqueo-cabana").innerHTML = opcionesCabanas(false) + `<option value="todas">Los 4 departamentos</option>`;
$("#bloqueo-desde").min = hoyClave();
$("#bloqueo-hasta").min = hoyClave();

iniciar();
