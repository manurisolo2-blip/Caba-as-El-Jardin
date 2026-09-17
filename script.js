/* =========================================================================
   script.js
   -------------------------------------------------------------------------
   ÍNDICE
   1.  CONFIGURACIÓN  <-- ACÁ SE EDITAN LOS DATOS DEL COMPLEJO
   2.  Utilidades
   3.  Disponibilidad y reservas (base de datos online)
   4.  Datos generales: nombre, WhatsApp, Instagram, Google Maps
   5.  Fotos de respaldo
   6.  Navegación
   7.  Tarjetas y ventana de detalle de cabañas
   8.  Galería y lightbox
   9.  Calendario de disponibilidad y solicitud de reserva
   10. Animaciones al hacer scroll
   11. Inicio
   ========================================================================= */

"use strict";


/* =========================================================================
   1. CONFIGURACIÓN
   ========================================================================= */

const CONFIG = {

  /* -----------------------------------------------------------------------
     NOMBRE DEL COMPLEJO
     Se muestra en el menú, la portada y el pie de página.
     Cambiarlo también en index.html dentro de <title> y <meta property="og:title">.
     ----------------------------------------------------------------------- */
  nombreComplejo: "Cabañas El Jardín",

  /* -----------------------------------------------------------------------
     WHATSAPP
     Número en formato internacional, SOLO NÚMEROS (sin +, espacios ni guiones).
     Para celulares de Argentina: 54 + 9 + código de área sin 0 + número sin 15.
     Formato de ejemplo (NO es un número real): "549XXXXXXXXXX"
     Mientras esté vacío, los botones de WhatsApp muestran un aviso.
     ----------------------------------------------------------------------- */
  whatsapp: "5491132616765",

  /* Mensajes automáticos de WhatsApp.
     En "reserva" se reemplazan solos: {cabana}, {entrada}, {salida},
     {noches}, {personas} y {nombre}. */
  mensajesWhatsapp: {
    general: "Hola! Quisiera consultar disponibilidad y precios de las cabañas.",
    cabana: "Hola! Quisiera consultar disponibilidad y precios de la {cabana}.",
    reserva: "Hola! Quisiera consultar/reservar la {cabana} desde el {entrada} hasta el {salida} para {personas}. Mi nombre es {nombre}."
  },

  /* -----------------------------------------------------------------------
     INSTAGRAM
     Dirección completa del perfil. Formato de ejemplo:
     "https://www.instagram.com/NOMBRE_DE_USUARIO/"
     Mientras esté vacío, los botones de Instagram muestran un aviso.
     ----------------------------------------------------------------------- */
  instagram: "",

  /* -----------------------------------------------------------------------
     GOOGLE MAPS
     ver:        enlace para abrir la ubicación en Google Maps.
     comoLlegar: enlace que abre las indicaciones hasta el complejo.
     Tip: en Google Maps, buscá el complejo > "Compartir" > "Copiar vínculo"
     y pegalo en "ver". El mapa insertado se cambia en index.html (buscar "GOOGLE MAPS").
     ----------------------------------------------------------------------- */
  googleMaps: {
    ver: "https://www.google.com/maps/place/Caba%C3%B1as+El+Jard%C3%ADn/@-37.1483308,-56.8809734,17z/data=!4m18!1m8!3m7!1s0x959c9db3efef09a7:0x5b7071194a60d4c3!2sCap.+de+Marina+Granville+122,+B7167+Pinamar,+Provincia+de+Buenos+Aires!3b1!8m2!3d-37.1483308!4d-56.8809734!16s%2Fg%2F11sv0v_vkh!3m8!1s0x959c9db3e66a0615:0x2c2860a44822b237!5m2!4m1!1i2!8m2!3d-37.1483308!4d-56.8809734!16s%2Fg%2F1hc0x8_w3?entry=ttu",
    comoLlegar: "https://www.google.com/maps/dir/?api=1&destination=Granville+122%2C+Valeria+del+Mar%2C+Argentina%2C+7167"
  },

  /* -----------------------------------------------------------------------
     CALENDARIO
     estadiaMinima:     cantidad mínima de noches para consultar.
     estadiaMaxima:     cantidad máxima de noches por solicitud online.
                        Si se cambia, cambiar también el 30 en
                        supabase/1-crear-base-de-datos.sql.
     mesesDisponibles:  cuántos meses hacia adelante se pueden ver (incluye el actual).
     ----------------------------------------------------------------------- */
  estadiaMinima: 1,
  estadiaMaxima: 30,
  mesesDisponibles: 12,

  /* -----------------------------------------------------------------------
     CABAÑAS
     Cada cabaña se edita por separado. Hoy las tres tienen los mismos datos
     porque son iguales; si alguna cambia, editar solo la que corresponda.

     - nombre:           nombre visible (ej: "Cabaña 1"). Se usa también en
                         el mensaje de WhatsApp: "reservar la {nombre}".
     - capacidad:        texto de capacidad.
     - capacidadMaxima:  número máximo de huéspedes (opciones del formulario).
                         Si se cambia, cambiar también el 4 en
                         supabase/1-crear-base-de-datos.sql.
     - precio:           dejar "" para mostrar "a consultar".
                         Ejemplo de formato: "$ 00.000 por noche"
     - descripcionCorta: texto de la tarjeta.
     - descripcion:      párrafos de la ventana "Ver cabaña".
     - destacados:       servicios que se muestran en la tarjeta.
     - caracteristicas:  lista completa de la ventana "Ver cabaña".
     - equipamiento:     lista de equipamiento de la ventana "Ver cabaña".
     - fotos:            la primera es la portada de la tarjeta.
     - fechasOcupadas:   fechas fijas opcionales (ver explicación en la Cabaña 1).
                         Lo recomendado es bloquear fechas desde el panel
                         de administración (admin/index.html).

     Íconos disponibles: bed, bunk, utensils, bath, car, grill, tree, pool,
     tv, kettle, cooktop, flame, boiler, fridge, microwave, toaster, ac,
     heater, fan, users, leaf, sun, sofa, lock.
     ----------------------------------------------------------------------- */
  cabanas: [

    /* ======================= CABAÑA 1 ======================= */
    {
      id: 1,                                   // No cambiar
      nombre: "Cabaña 1",                      // EDITAR: nombre de la cabaña
      capacidad: "Hasta 4 personas",           // EDITAR: cama doble (2) + cama marinera (2). Verificar.
      capacidadMaxima: 4,                      // EDITAR: número máximo de huéspedes
      precio: "",                              // EDITAR: precio. Ej: "$ 00.000 por noche"
      descripcionCorta:                        // EDITAR: descripción de la tarjeta
        "Dormitorio con cama doble, comedor con cama marinera, cocina comedor y baño completo. Con cochera, asador, espacio al aire libre y piscina.",
      descripcion: [                           // EDITAR: descripción completa
        "Una cabaña cómoda y acogedora para disfrutar de Valeria del Mar. Cuenta con un dormitorio con cama doble, comedor con cama marinera, cocina comedor y baño completo.",
        "Afuera te esperan el espacio al aire libre, el asador y la piscina, ideales para aprovechar los días de descanso y playa. También dispone de cochera."
      ],
      destacados: [
        { icono: "bed", texto: "Cama doble" },
        { icono: "bunk", texto: "Cama marinera" },
        { icono: "pool", texto: "Piscina" },
        { icono: "grill", texto: "Asador" },
        { icono: "car", texto: "Cochera" }
      ],
      caracteristicas: "comunes",              // Para datos propios, reemplazar "comunes" por una lista [ { icono, texto }, ... ]
      equipamiento: "comun",                   // Para datos propios, reemplazar "comun" por una lista [ { icono, texto }, ... ]

      // FOTOS DE LA CABAÑA 1
      fotos: [
        { src: "images/exterior-1.jpg", alt: "Frente de la Cabaña 1" },
        { src: "images/dormitorio-1.jpg", alt: "Dormitorio con cama doble" },
        { src: "images/dormitorio-2.jpg", alt: "Dormitorio" },
        { src: "images/comedor-1.jpg", alt: "Comedor y estar" },
        { src: "images/cocina-1.jpg", alt: "Cocina equipada" },
        { src: "images/heladera.jpg", alt: "Heladera y cocina" },
        { src: "images/bano.jpg", alt: "Baño completo" },
        { src: "images/parrilla.jpg", alt: "Asador individual" },
        { src: "images/parque-reposeras.jpg", alt: "Parque y reposeras" }
      ],

      /* FECHAS FIJAS OPCIONALES DE LA CABAÑA 1
         Las reservas y los bloqueos se manejan desde la base de datos y el
         panel de administración. Esta lista es solo un complemento: se suma
         a lo que venga de la base de datos y funciona aunque no esté conectada.
         - Cada fecha representa una NOCHE ocupada. Formato "AAAA-MM-DD".
         - Fechas sueltas: "2026-12-24"
           o rangos (ambas fechas incluidas): { desde: "2026-12-26", hasta: "2026-12-30" }
         - El día siguiente a la última noche queda libre para entrar. */
      fechasOcupadas: []
    },

    /* ======================= CABAÑA 2 ======================= */
    {
      id: 2,                                   // No cambiar
      nombre: "Cabaña 2",                      // EDITAR: nombre de la cabaña
      capacidad: "Hasta 4 personas",           // EDITAR: cama doble (2) + cama marinera (2). Verificar.
      capacidadMaxima: 4,                      // EDITAR: número máximo de huéspedes
      precio: "",                              // EDITAR: precio. Ej: "$ 00.000 por noche"
      descripcionCorta:                        // EDITAR: descripción de la tarjeta
        "Dormitorio con cama doble, comedor con cama marinera, cocina comedor y baño completo. Con cochera, asador, espacio al aire libre y piscina.",
      descripcion: [                           // EDITAR: descripción completa
        "Una cabaña cómoda y acogedora para disfrutar de Valeria del Mar. Cuenta con un dormitorio con cama doble, comedor con cama marinera, cocina comedor y baño completo.",
        "Afuera te esperan el espacio al aire libre, el asador y la piscina, ideales para aprovechar los días de descanso y playa. También dispone de cochera."
      ],
      destacados: [
        { icono: "bed", texto: "Cama doble" },
        { icono: "bunk", texto: "Cama marinera" },
        { icono: "pool", texto: "Piscina" },
        { icono: "grill", texto: "Asador" },
        { icono: "car", texto: "Cochera" }
      ],
      caracteristicas: "comunes",
      equipamiento: "comun",

      // FOTOS DE LA CABAÑA 2
      fotos: [
        { src: "images/portada.jpg", alt: "Frente de la Cabaña 2" },
        { src: "images/dormitorio-2.jpg", alt: "Dormitorio con cama doble" },
        { src: "images/dormitorio-alojamientos.jpg", alt: "Dormitorio" },
        { src: "images/mesa-comedor.jpg", alt: "Mesa de comedor" },
        { src: "images/estar-alojamientos.jpg", alt: "Estar y comedor" },
        { src: "images/cocina-1.jpg", alt: "Cocina comedor" },
        { src: "images/bano.jpg", alt: "Baño completo" },
        { src: "images/parrilla.jpg", alt: "Asador individual" },
        { src: "images/parque-juegos.jpg", alt: "Parque con juegos" }
      ],

      // FECHAS FIJAS OPCIONALES DE LA CABAÑA 2 (mismo formato que la Cabaña 1)
      fechasOcupadas: []
    },

    /* ======================= CABAÑA 3 ======================= */
    {
      id: 3,                                   // No cambiar
      nombre: "Cabaña 3",                      // EDITAR: nombre de la cabaña
      capacidad: "Hasta 4 personas",           // EDITAR: cama doble (2) + cama marinera (2). Verificar.
      capacidadMaxima: 4,                      // EDITAR: número máximo de huéspedes
      precio: "",                              // EDITAR: precio. Ej: "$ 00.000 por noche"
      descripcionCorta:                        // EDITAR: descripción de la tarjeta
        "Dormitorio con cama doble, comedor con cama marinera, cocina comedor y baño completo. Con cochera, asador, espacio al aire libre y piscina.",
      descripcion: [                           // EDITAR: descripción completa
        "Una cabaña cómoda y acogedora para disfrutar de Valeria del Mar. Cuenta con un dormitorio con cama doble, comedor con cama marinera, cocina comedor y baño completo.",
        "Afuera te esperan el espacio al aire libre, el asador y la piscina, ideales para aprovechar los días de descanso y playa. También dispone de cochera."
      ],
      destacados: [
        { icono: "bed", texto: "Cama doble" },
        { icono: "bunk", texto: "Cama marinera" },
        { icono: "pool", texto: "Piscina" },
        { icono: "grill", texto: "Asador" },
        { icono: "car", texto: "Cochera" }
      ],
      caracteristicas: "comunes",
      equipamiento: "comun",

      // FOTOS DE LA CABAÑA 3
      fotos: [
        { src: "images/exterior-2.jpg", alt: "Frente de la Cabaña 3" },
        { src: "images/dormitorio-alojamientos.jpg", alt: "Dormitorio con cama doble" },
        { src: "images/dormitorio-1.jpg", alt: "Dormitorio" },
        { src: "images/comedor-1.jpg", alt: "Comedor" },
        { src: "images/cocina-1.jpg", alt: "Cocina equipada" },
        { src: "images/bano.jpg", alt: "Baño completo" },
        { src: "images/parrilla.jpg", alt: "Asador individual" },
        { src: "images/parque-reposeras.jpg", alt: "Parque y reposeras" },
        { src: "images/parque-alojamientos.jpg", alt: "Entorno natural arbolado" }
      ],

      // FECHAS FIJAS OPCIONALES DE LA CABAÑA 3 (mismo formato que la Cabaña 1)
      fechasOcupadas: []
    }
  ]
};

/* Características y equipamiento que comparten las tres cabañas.
   Se usan cuando una cabaña tiene caracteristicas: "comunes" / equipamiento: "comun". */
const CARACTERISTICAS_COMUNES = [
  { icono: "bed", texto: "1 dormitorio con cama doble" },
  { icono: "bunk", texto: "Comedor con cama marinera" },
  { icono: "utensils", texto: "Cocina comedor" },
  { icono: "bath", texto: "Baño completo" },
  { icono: "car", texto: "Cochera" },
  { icono: "grill", texto: "Asador" },
  { icono: "tree", texto: "Espacio al aire libre" },
  { icono: "pool", texto: "Piscina" }
];

const EQUIPAMIENTO_COMUN = [
  { icono: "tv", texto: "TV Smart de 32\"" },
  { icono: "ac", texto: "Aire acondicionado" },
  { icono: "heater", texto: "Estufa garrafera" },
  { icono: "fan", texto: "Ventilador" },
  { icono: "boiler", texto: "Termotanque" },
  { icono: "fridge", texto: "Heladera" },
  { icono: "microwave", texto: "Microondas" },
  { icono: "cooktop", texto: "Anafe eléctrico" },
  { icono: "flame", texto: "Anafe a gas" },
  { icono: "kettle", texto: "Pava eléctrica" },
  { icono: "toaster", texto: "Tostadora" }
];


/* =========================================================================
   2. UTILIDADES
   ========================================================================= */

const $ = (selector, contexto = document) => contexto.querySelector(selector);
const $$ = (selector, contexto = document) => Array.from(contexto.querySelectorAll(selector));

const prefiereMenosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function icono(nombre, clase = "icon") {
  return `<svg class="${clase}" aria-hidden="true"><use href="#i-${nombre}"></use></svg>`;
}

function escaparHTML(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function plantilla(texto, datos) {
  return texto.replace(/\{(\w+)\}/g, (coincidencia, clave) => (clave in datos ? datos[clave] : coincidencia));
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function debounce(fn, espera) {
  let temporizador;
  return (...args) => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => fn(...args), espera);
  };
}

/* Fechas: siempre en hora local y con clave "AAAA-MM-DD" */
function hoy() {
  const fecha = new Date();
  fecha.setHours(0, 0, 0, 0);
  return fecha;
}

function aClave(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function desdeClave(clave) {
  const [anio, mes, dia] = clave.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

function sumarDias(fecha, dias) {
  const nueva = new Date(fecha);
  nueva.setDate(nueva.getDate() + dias);
  return nueva;
}

function sumarMeses(fecha, meses) {
  return new Date(fecha.getFullYear(), fecha.getMonth() + meses, 1);
}

function nochesEntre(desde, hasta) {
  const utcDesde = Date.UTC(desde.getFullYear(), desde.getMonth(), desde.getDate());
  const utcHasta = Date.UTC(hasta.getFullYear(), hasta.getMonth(), hasta.getDate());
  return Math.round((utcHasta - utcDesde) / 86400000);
}

function textoNoches(cantidad) {
  return `${cantidad} ${cantidad === 1 ? "noche" : "noches"}`;
}

const formatoFecha = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
const formatoDiaSemana = new Intl.DateTimeFormat("es-AR", { weekday: "short" });
const formatoMes = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" });
const formatoCompleto = new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

function fechaResumen(fecha) {
  const diaSemana = capitalizar(formatoDiaSemana.format(fecha).replace(".", ""));
  return `${diaSemana} ${formatoFecha.format(fecha)}`;
}

/* Convierte la lista de CONFIG (fechas sueltas y rangos) en un conjunto de claves */
function expandirFechas(lista) {
  const claves = new Set();
  (lista || []).forEach((item) => {
    if (typeof item === "string") {
      claves.add(item);
    } else if (item && item.desde && item.hasta) {
      const fin = desdeClave(item.hasta);
      for (let dia = desdeClave(item.desde); dia <= fin; dia = sumarDias(dia, 1)) {
        claves.add(aClave(dia));
      }
    }
  });
  return claves;
}

function buscarCabana(id) {
  return CONFIG.cabanas.find((cabana) => String(cabana.id) === String(id));
}

function caracteristicasDe(cabana) {
  return Array.isArray(cabana.caracteristicas) ? cabana.caracteristicas : CARACTERISTICAS_COMUNES;
}

function equipamientoDe(cabana) {
  return Array.isArray(cabana.equipamiento) ? cabana.equipamiento : EQUIPAMIENTO_COMUN;
}

/* Avisos breves en pantalla */
let temporizadorAviso;
function aviso(mensaje) {
  const toast = $("#toast");
  toast.textContent = mensaje;
  toast.classList.add("is-visible");
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => toast.classList.remove("is-visible"), 4200);
}

/* Bloqueo de scroll cuando hay ventanas abiertas (admite varias a la vez) */
let bloqueosDeScroll = 0;
function bloquearScroll(activar) {
  bloqueosDeScroll = Math.max(0, bloqueosDeScroll + (activar ? 1 : -1));
  document.documentElement.classList.toggle("sin-scroll", bloqueosDeScroll > 0);
}

/* Mantiene el foco del teclado dentro de una ventana abierta */
function atraparFoco(evento, contenedor) {
  if (evento.key !== "Tab") return;
  const enfocables = $$("a[href], button:not([disabled]), input:not([disabled]), textarea, [tabindex]:not([tabindex='-1'])", contenedor)
    .filter((el) => el.getClientRects().length > 0);
  if (!enfocables.length) return;
  const primero = enfocables[0];
  const ultimo = enfocables[enfocables.length - 1];
  if (evento.shiftKey && document.activeElement === primero) {
    evento.preventDefault();
    ultimo.focus();
  } else if (!evento.shiftKey && document.activeElement === ultimo) {
    evento.preventDefault();
    primero.focus();
  }
}

/* Deslizar con el dedo (celulares) */
function detectarDeslizamiento(elemento, alIzquierda, alDerecha) {
  let inicioX = null;
  let inicioY = null;
  elemento.addEventListener("touchstart", (e) => {
    inicioX = e.touches[0].clientX;
    inicioY = e.touches[0].clientY;
  }, { passive: true });
  elemento.addEventListener("touchend", (e) => {
    if (inicioX === null) return;
    const dx = e.changedTouches[0].clientX - inicioX;
    const dy = e.changedTouches[0].clientY - inicioY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) alIzquierda();
      else alDerecha();
    }
    inicioX = null;
  }, { passive: true });
}

function cuandoCargue(img) {
  const promesa = typeof img.decode === "function" ? img.decode() : Promise.resolve();
  return promesa.catch(() => {});
}


/* =========================================================================
   3. DISPONIBILIDAD Y RESERVAS (BASE DE DATOS ONLINE)
   -------------------------------------------------------------------------
   Las reservas se guardan en Supabase (base de datos online gratuita), así
   que todos los visitantes ven la misma disponibilidad desde cualquier
   celular o computadora.

   - Datos de conexión:        reservas/supabase-config.js
   - Funciones de conexión:    reservas/reservas-api.js
   - Reglas de seguridad:      supabase/1-crear-base-de-datos.sql
   - Panel de administración:  admin/index.html
   - Guía paso a paso:         RESERVAS-GUIA.md

   Qué ocupa fechas en el calendario:
   a) Reservas pendientes y confirmadas (las canceladas liberan las fechas).
   b) Bloqueos cargados desde el panel de administración.
   c) Fechas fijas opcionales de CONFIG.cabanas[].fechasOcupadas.

   Si la base de datos no está configurada, el sitio sigue funcionando:
   el calendario muestra solo las fechas de CONFIG y las consultas se
   envían únicamente por WhatsApp, sin guardarse.
   ========================================================================= */

function baseDeDatosDisponible() {
  return Boolean(window.ReservasAPI && window.ReservasAPI.estaConfigurado());
}

const MENSAJES_ERROR_RESERVA = {
  FECHAS_OCUPADAS: "Esas fechas acaban de ser reservadas. Actualizamos el calendario: elegí otras fechas.",
  DATOS_INVALIDOS: "Revisá los datos ingresados e intentá de nuevo.",
  NO_PERMITIDO: "No pudimos registrar la solicitud para esas fechas. Probá con otras o escribinos por WhatsApp.",
  SIN_CONEXION: "No hay conexión a internet. Revisá la conexión e intentá de nuevo.",
  SIN_LIBRERIA: "No se pudo cargar el sistema de reservas. Recargá la página e intentá de nuevo.",
  BASE_SIN_PREPARAR: "El sistema de reservas todavía no está listo. Escribinos por WhatsApp.",
  DESCONOCIDO: "No pudimos registrar la solicitud. Intentá de nuevo en unos minutos."
};


/* =========================================================================
   4. DATOS GENERALES: NOMBRE, WHATSAPP, INSTAGRAM, GOOGLE MAPS
   ========================================================================= */

function whatsappConfigurado() {
  return /^\d{8,15}$/.test(String(CONFIG.whatsapp).trim());
}

function enlaceWhatsApp(mensaje) {
  return `https://wa.me/${String(CONFIG.whatsapp).trim()}?text=${encodeURIComponent(mensaje)}`;
}

function aplicarDatosGenerales() {
  $$("[data-nombre-complejo]").forEach((el) => { el.textContent = CONFIG.nombreComplejo; });
  document.title = `${CONFIG.nombreComplejo} | Cabañas en Valeria del Mar, Buenos Aires`;
  $$("[data-anio]").forEach((el) => { el.textContent = new Date().getFullYear(); });

  $$('[data-whatsapp="general"]').forEach((enlace) => {
    enlace.href = enlaceWhatsApp(CONFIG.mensajesWhatsapp.general);
  });

  $$("[data-instagram]").forEach((enlace) => {
    if (CONFIG.instagram) enlace.href = CONFIG.instagram;
  });

  $$("[data-maps]").forEach((enlace) => {
    const url = CONFIG.googleMaps[enlace.dataset.maps];
    if (url) enlace.href = url;
  });

  /* Avisos cuando falta configurar un dato */
  document.addEventListener("click", (e) => {
    const botonWhatsApp = e.target.closest("[data-whatsapp]");
    if (botonWhatsApp) {
      if (!whatsappConfigurado()) {
        e.preventDefault();
        aviso("Falta configurar el número de WhatsApp (script.js > CONFIG.whatsapp).");
        console.warn("[Cabañas] Completar CONFIG.whatsapp en script.js");
        return;
      }
    }

    const botonInstagram = e.target.closest("[data-instagram]");
    if (botonInstagram && !CONFIG.instagram) {
      e.preventDefault();
      aviso("Falta configurar el enlace de Instagram (script.js > CONFIG.instagram).");
      console.warn("[Cabañas] Completar CONFIG.instagram en script.js");
    }
  });
}


/* =========================================================================
   5. FOTOS DE RESPALDO
   Si una foto de ejemplo no carga (sin internet, enlace caído), se muestra
   la ilustración equivalente de images/placeholders/. Cuando se usan fotos
   reales en images/, esto no interviene. No hace falta editarlo.
   ========================================================================= */

const RESPALDOS = {
  "1470071459604-3b5ec3a7fe05": "hero",
  "1449158743715-0a90ebb6d2d8": "frente",
  "1587061949409-02df41d5e562": "frente",
  "1542718610-a1d656d1884c": "frente",
  "1571508601891-ca5e7a713859": "dormitorio",
  "1522771739844-6a9f6d5f14af": "cama",
  "1560185007-cde436f6a4d0": "comedor",
  "1556911220-bff31c812dba": "cocina",
  "1552321554-5fefe8c9ef14": "bano",
  "1510627489930-0c1b0bfb6785": "cochera",
  "1529692236671-f1f6cf9683ba": "asador",
  "1576013551627-0cc20b96c2a7": "piscina",
  "1558036117-15d82a90b9b1": "exterior",
  "1500382017468-9049fed747ef": "naturaleza",
  "1500534314209-a25ddb2bd429": "entorno",
  "1470252649378-9c29740c9fa8": "entorno",
  "1441974231531-c6227db76b6e": "sr-naturaleza",
  "1437482078695-73f5ca6c96e2": "sr-rio",
  "1511497584788-876760111969": "sr-balnearios",
  "1472214103451-9374bd1c798e": "sr-sierras",
  "1525610553991-2bede1a236e2": "sr-centro",
  "1414235077428-338989a2e8c0": "sr-gastronomia",
  "1447752875215-b2761acb3c5d": "sr-paseos"
};

function ilustracionGenerica(texto) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#EFE7DB"/><text x="600" y="380" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="22" letter-spacing="6" fill="#8A6848">FOTO DE EJEMPLO</text><text x="600" y="440" text-anchor="middle" font-family="Georgia, serif" font-size="46" fill="#3A3029">${escaparHTML(texto || "Foto")}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function aplicarRespaldo(img) {
  const src = img.getAttribute("src") || "";
  if (!src || src.startsWith("data:")) return;

  if (!img.dataset.respaldo) {
    img.dataset.respaldo = "1";
    const coincidencia = src.match(/photo-([\w-]+)\?/);
    const archivo = coincidencia && RESPALDOS[coincidencia[1]];
    img.src = archivo ? `images/placeholders/${archivo}.svg` : ilustracionGenerica(img.dataset.placeholder || img.alt);
  } else if (img.dataset.respaldo === "1") {
    img.dataset.respaldo = "2";
    img.src = ilustracionGenerica(img.dataset.placeholder || img.alt);
  }
}

function iniciarRespaldos() {
  document.addEventListener("error", (e) => {
    if (e.target instanceof HTMLImageElement) aplicarRespaldo(e.target);
  }, true);

  /* Imágenes que fallaron antes de que cargara este archivo */
  $$("img").forEach((img) => {
    if (img.complete && img.naturalWidth === 0) aplicarRespaldo(img);
  });
}


/* =========================================================================
   6. NAVEGACIÓN
   ========================================================================= */

function iniciarNavegacion() {
  const header = $("#header");
  const nav = $("#nav");
  const toggle = $("#nav-toggle");
  const botonFlotante = $(".wa-float");
  const hero = $("#inicio");

  /* Fondo del menú y botón flotante según el scroll */
  let pendiente = false;
  const alHacerScroll = () => {
    pendiente = false;
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 50);
    botonFlotante.classList.toggle("is-visible", y > hero.offsetHeight * 0.6);
  };
  window.addEventListener("scroll", () => {
    if (!pendiente) {
      pendiente = true;
      requestAnimationFrame(alHacerScroll);
    }
  }, { passive: true });
  alHacerScroll();

  /* Menú hamburguesa */
  const abrirMenu = (abrir) => {
    const estabaAbierto = nav.classList.contains("is-open");
    if (abrir === estabaAbierto) return;
    nav.classList.toggle("is-open", abrir);
    header.classList.toggle("menu-abierto", abrir);
    toggle.setAttribute("aria-expanded", String(abrir));
    toggle.setAttribute("aria-label", abrir ? "Cerrar menú" : "Abrir menú");
    bloquearScroll(abrir);
  };

  toggle.addEventListener("click", () => abrirMenu(!nav.classList.contains("is-open")));
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) abrirMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      abrirMenu(false);
      toggle.focus();
    }
  });
  window.matchMedia("(min-width: 1100px)").addEventListener("change", (e) => {
    if (e.matches) abrirMenu(false);
  });

  /* Resaltar la sección visible en el menú */
  const enlaces = $$(".nav__link");
  if ("IntersectionObserver" in window) {
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        const id = entrada.target.id;
        enlaces.forEach((enlace) => {
          enlace.classList.toggle("is-active", enlace.getAttribute("href") === `#${id}`);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main > section[id]").forEach((seccion) => observador.observe(seccion));
  }
}


/* =========================================================================
   7. TARJETAS Y VENTANA DE DETALLE DE CABAÑAS
   ========================================================================= */

function renderizarTarjetasCabanas() {
  const contenedor = $("#cabins-grid");
  contenedor.innerHTML = CONFIG.cabanas.map((cabana) => {
    const portada = cabana.fotos[0] || { src: "", alt: cabana.nombre };
    const precio = cabana.precio
      ? `Tarifa: <strong>${escaparHTML(cabana.precio)}</strong>`
      : "Tarifa: <strong>a consultar</strong>";

    return `
      <article class="cabin-card reveal">
        <div class="cabin-card__media">
          <img src="${escaparHTML(portada.src)}" alt="${escaparHTML(portada.alt)}" data-placeholder="${escaparHTML(cabana.nombre)}" loading="lazy">
          <span class="cabin-card__badge">${icono("users")}${escaparHTML(cabana.capacidad)}</span>
        </div>
        <div class="cabin-card__body">
          <h3 class="cabin-card__title">${escaparHTML(cabana.nombre)}</h3>
          <p class="cabin-card__desc">${escaparHTML(cabana.descripcionCorta)}</p>
          <ul class="cabin-card__features" aria-label="Servicios principales">
            ${(cabana.destacados || []).map((item) => `<li>${icono(item.icono)}${escaparHTML(item.texto)}</li>`).join("")}
          </ul>
          <p class="cabin-card__price">${icono("tag")}<span>${precio}</span></p>
          <div class="cabin-card__actions">
            <button class="btn btn--outline" type="button" data-ver-cabana="${cabana.id}">Ver cabaña</button>
            <button class="btn btn--primary" type="button" data-consultar-cabana="${cabana.id}">Consultar disponibilidad</button>
          </div>
        </div>
      </article>`;
  }).join("");
}

const modal = {
  el: null,
  cabana: null,
  indice: 0,
  ultimoFoco: null
};

function abrirModalCabana(id) {
  const cabana = buscarCabana(id);
  if (!cabana) return;

  modal.cabana = cabana;
  modal.indice = 0;
  modal.ultimoFoco = document.activeElement;

  const fotos = cabana.fotos;
  const primera = fotos[0] || { src: "", alt: cabana.nombre };
  const precio = cabana.precio ? escaparHTML(cabana.precio) : "Tarifa a consultar";
  const variasFotos = fotos.length > 1;

  $("#modal-body").innerHTML = `
    <div class="cabin-detail">
      <div class="cabin-detail__gallery">
        <div class="cabin-detail__main" id="modal-main">
          <button class="cabin-detail__zoom" type="button" data-ampliar aria-label="Ampliar foto">
            <img id="modal-main-img" src="${escaparHTML(primera.src)}" alt="${escaparHTML(primera.alt)}" data-placeholder="${escaparHTML(cabana.nombre)}">
          </button>
          ${variasFotos ? `
            <button class="cabin-detail__nav cabin-detail__nav--prev" type="button" data-modal-foto="-1" aria-label="Foto anterior">${icono("chev-left")}</button>
            <button class="cabin-detail__nav cabin-detail__nav--next" type="button" data-modal-foto="1" aria-label="Foto siguiente">${icono("chev-right")}</button>
            <span class="cabin-detail__counter" id="modal-counter">1 / ${fotos.length}</span>` : ""}
        </div>
        ${variasFotos ? `
          <div class="cabin-detail__thumbs">
            ${fotos.map((foto, i) => `
              <button class="thumb${i === 0 ? " is-active" : ""}" type="button" data-modal-thumb="${i}" aria-label="Ver foto ${i + 1}: ${escaparHTML(foto.alt)}">
                <img src="${escaparHTML(foto.src)}" alt="" loading="lazy">
              </button>`).join("")}
          </div>` : ""}
      </div>

      <div class="cabin-detail__info">
        <span class="eyebrow">Nuestras cabañas</span>
        <h2 class="cabin-detail__title" id="modal-title">${escaparHTML(cabana.nombre)}</h2>
        <div class="cabin-detail__meta">
          <span>${icono("users")}${escaparHTML(cabana.capacidad)}</span>
          <span>${icono("tag")}${precio}</span>
        </div>
        ${(cabana.descripcion || []).map((parrafo) => `<p>${escaparHTML(parrafo)}</p>`).join("")}

        <h3 class="cabin-detail__subtitle">Distribución y espacios</h3>
        <ul class="detail-list">
          ${caracteristicasDe(cabana).map((item) => `<li>${icono(item.icono)}${escaparHTML(item.texto)}</li>`).join("")}
        </ul>

        <h3 class="cabin-detail__subtitle">Equipamiento</h3>
        <ul class="detail-list">
          ${equipamientoDe(cabana).map((item) => `<li>${icono(item.icono)}${escaparHTML(item.texto)}</li>`).join("")}
        </ul>

        <div class="cabin-detail__actions">
          <button class="btn btn--primary" type="button" data-consultar-cabana="${cabana.id}">
            ${icono("calendar")}Consultar disponibilidad
          </button>
          <a class="btn btn--outline" data-whatsapp="cabana" target="_blank" rel="noopener"
             href="${enlaceWhatsApp(plantilla(CONFIG.mensajesWhatsapp.cabana, { cabana: cabana.nombre }))}">
            ${icono("chat")}Escribinos por WhatsApp
          </a>
        </div>
      </div>
    </div>`;

  detectarDeslizamiento($("#modal-main"), () => mostrarFotoModal(modal.indice + 1), () => mostrarFotoModal(modal.indice - 1));

  modal.el.hidden = false;
  modal.el.querySelector(".modal__panel").scrollTop = 0;
  bloquearScroll(true);
  requestAnimationFrame(() => modal.el.classList.add("is-open"));
  $(".modal__close", modal.el).focus({ preventScroll: true });
}

function mostrarFotoModal(indice) {
  const fotos = modal.cabana.fotos;
  if (fotos.length < 2) return;
  modal.indice = (indice + fotos.length) % fotos.length;
  const foto = fotos[modal.indice];
  const img = $("#modal-main-img");

  img.classList.add("is-cambiando");
  delete img.dataset.respaldo;
  img.src = foto.src;
  img.alt = foto.alt;
  cuandoCargue(img).then(() => img.classList.remove("is-cambiando"));

  $("#modal-counter").textContent = `${modal.indice + 1} / ${fotos.length}`;
  $$("[data-modal-thumb]", modal.el).forEach((thumb, i) => {
    const activa = i === modal.indice;
    thumb.classList.toggle("is-active", activa);
    thumb.setAttribute("aria-current", activa ? "true" : "false");
  });
}

function cerrarModal({ devolverFoco = true } = {}) {
  if (modal.el.hidden) return;
  modal.el.classList.remove("is-open");
  bloquearScroll(false);
  const demora = prefiereMenosMovimiento ? 0 : 400;
  setTimeout(() => { modal.el.hidden = true; }, demora);
  if (devolverFoco && modal.ultimoFoco) modal.ultimoFoco.focus({ preventScroll: true });
}

function iniciarCabanas() {
  renderizarTarjetasCabanas();
  modal.el = $("#cabin-modal");

  modal.el.addEventListener("click", (e) => {
    if (e.target.closest("[data-cerrar-modal]")) return cerrarModal();

    const flecha = e.target.closest("[data-modal-foto]");
    if (flecha) return mostrarFotoModal(modal.indice + Number(flecha.dataset.modalFoto));

    const miniatura = e.target.closest("[data-modal-thumb]");
    if (miniatura) return mostrarFotoModal(Number(miniatura.dataset.modalThumb));

    if (e.target.closest("[data-ampliar]")) {
      const fotos = modal.cabana.fotos.map((foto) => ({
        src: foto.src,
        alt: foto.alt,
        titulo: `${modal.cabana.nombre} | ${foto.alt}`
      }));
      abrirLightbox(fotos, modal.indice);
    }
  });

  modal.el.addEventListener("keydown", (e) => {
    if (!$("#lightbox").hidden) return;
    if (e.key === "Escape") cerrarModal();
    if (e.key === "ArrowRight") mostrarFotoModal(modal.indice + 1);
    if (e.key === "ArrowLeft") mostrarFotoModal(modal.indice - 1);
    atraparFoco(e, modal.el);
  });

  /* Botones "Ver cabaña" y "Consultar disponibilidad" */
  document.addEventListener("click", (e) => {
    const botonVer = e.target.closest("[data-ver-cabana]");
    if (botonVer) {
      abrirModalCabana(botonVer.dataset.verCabana);
      return;
    }

    const botonConsultar = e.target.closest("[data-consultar-cabana]");
    if (botonConsultar) {
      cerrarModal({ devolverFoco: false });
      seleccionarCabana(botonConsultar.dataset.consultarCabana);
      $("#disponibilidad").scrollIntoView({ behavior: prefiereMenosMovimiento ? "auto" : "smooth" });
    }
  });
}


/* =========================================================================
   8. GALERÍA Y LIGHTBOX
   ========================================================================= */

const lightbox = {
  el: null,
  img: null,
  fotos: [],
  indice: 0,
  ultimoFoco: null
};

function abrirLightbox(fotos, indice) {
  if (!fotos.length) return;
  lightbox.fotos = fotos;
  lightbox.indice = Math.max(0, indice);
  lightbox.ultimoFoco = document.activeElement;

  const variasFotos = fotos.length > 1;
  $('[data-lb="anterior"]', lightbox.el).hidden = !variasFotos;
  $('[data-lb="siguiente"]', lightbox.el).hidden = !variasFotos;

  mostrarFotoLightbox(false);
  lightbox.el.hidden = false;
  bloquearScroll(true);
  requestAnimationFrame(() => lightbox.el.classList.add("is-open"));
  $('[data-lb="cerrar"]', lightbox.el).focus({ preventScroll: true });
}

function mostrarFotoLightbox(animar = true) {
  const total = lightbox.fotos.length;
  lightbox.indice = (lightbox.indice + total) % total;
  const foto = lightbox.fotos[lightbox.indice];

  const aplicar = () => {
    delete lightbox.img.dataset.respaldo;
    lightbox.img.src = foto.src;
    lightbox.img.alt = foto.alt;
    $("#lightbox-caption").textContent = foto.titulo || foto.alt;
    $("#lightbox-counter").textContent = total > 1 ? `${lightbox.indice + 1} / ${total}` : "";
    cuandoCargue(lightbox.img).then(() => lightbox.img.classList.remove("is-cambiando"));
  };

  if (!animar || prefiereMenosMovimiento) {
    aplicar();
    return;
  }
  lightbox.img.classList.add("is-cambiando");
  setTimeout(aplicar, 200);
}

function cerrarLightbox() {
  if (lightbox.el.hidden) return;
  lightbox.el.classList.remove("is-open");
  bloquearScroll(false);
  setTimeout(() => { lightbox.el.hidden = true; }, prefiereMenosMovimiento ? 0 : 350);
  if (lightbox.ultimoFoco) lightbox.ultimoFoco.focus({ preventScroll: true });
}

function iniciarGaleria() {
  lightbox.el = $("#lightbox");
  lightbox.img = $("#lightbox-img");

  const items = $$(".gallery__item");

  items.forEach((item) => {
    const titulo = $(".gallery__caption", item)?.textContent.trim() || $("img", item).alt;
    $(".gallery__btn", item).setAttribute("aria-label", `Ampliar foto: ${titulo}`);
  });

  /* Filtros */
  const filtros = $$(".chip[data-filtro]");
  filtros.forEach((chip) => {
    chip.addEventListener("click", () => {
      const filtro = chip.dataset.filtro;
      filtros.forEach((otro) => {
        const activo = otro === chip;
        otro.classList.toggle("is-active", activo);
        otro.setAttribute("aria-pressed", String(activo));
      });
      items.forEach((item) => {
        const visible = filtro === "todas" || item.dataset.categoria === filtro;
        item.classList.toggle("is-oculto", !visible);
        if (visible) item.classList.add("is-visible");
      });
    });
  });

  /* Abrir foto ampliada */
  $("#gallery-grid").addEventListener("click", (e) => {
    const boton = e.target.closest(".gallery__btn");
    if (!boton) return;
    const visibles = items.filter((item) => !item.classList.contains("is-oculto"));
    const fotos = visibles.map((item) => {
      const img = $("img", item);
      return {
        src: img.currentSrc || img.src,
        alt: img.alt,
        titulo: $(".gallery__caption", item)?.textContent.trim() || img.alt
      };
    });
    abrirLightbox(fotos, visibles.indexOf(boton.closest(".gallery__item")));
  });

  /* Controles del lightbox */
  lightbox.el.addEventListener("click", (e) => {
    const accion = e.target.closest("[data-lb]")?.dataset.lb;
    if (accion === "cerrar") return cerrarLightbox();
    if (accion === "anterior") { lightbox.indice -= 1; return mostrarFotoLightbox(); }
    if (accion === "siguiente") { lightbox.indice += 1; return mostrarFotoLightbox(); }
    /* Clic fuera de la foto */
    if (!e.target.closest(".lightbox__figure")) cerrarLightbox();
  });

  lightbox.el.addEventListener("keydown", (e) => {
    const variasFotos = lightbox.fotos.length > 1;
    if (e.key === "Escape") { e.stopPropagation(); cerrarLightbox(); }
    if (e.key === "ArrowRight" && variasFotos) { lightbox.indice += 1; mostrarFotoLightbox(); }
    if (e.key === "ArrowLeft" && variasFotos) { lightbox.indice -= 1; mostrarFotoLightbox(); }
    atraparFoco(e, lightbox.el);
  });

  detectarDeslizamiento(
    lightbox.el,
    () => { if (lightbox.fotos.length > 1) { lightbox.indice += 1; mostrarFotoLightbox(); } },
    () => { if (lightbox.fotos.length > 1) { lightbox.indice -= 1; mostrarFotoLightbox(); } }
  );
}


/* =========================================================================
   9. CALENDARIO DE DISPONIBILIDAD Y SOLICITUD DE RESERVA
   ========================================================================= */

const DIAS_SEMANA = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];
const INTERVALO_ACTUALIZACION = 2 * 60 * 1000; // Se vuelve a consultar la disponibilidad cada 2 minutos

const calendario = {
  cabanaId: null,
  mesInicio: null,
  meses: 1,
  entrada: null,
  salida: null,
  fijas: {},        // Fechas de CONFIG (opcionales)
  reservadas: {},   // Fechas de la base de datos (reservas y bloqueos)
  estadoCarga: "sin-base", // "sin-base" | "cargando" | "ok" | "error"
  enviando: false
};

function textoPersonas(cantidad) {
  return `${cantidad} ${cantidad === 1 ? "persona" : "personas"}`;
}

function estaOcupada(idCabana, clave) {
  const id = String(idCabana);
  return calendario.fijas[id].has(clave) || calendario.reservadas[id].has(clave);
}

/* true si todas las noches entre entrada (incluida) y salida (excluida) están libres */
function rangoLibre(idCabana, entrada, salida) {
  for (let dia = new Date(entrada); dia < salida; dia = sumarDias(dia, 1)) {
    if (estaOcupada(idCabana, aClave(dia))) return false;
  }
  return true;
}

function nochesPermitidas(noches) {
  return noches >= CONFIG.estadiaMinima && noches <= CONFIG.estadiaMaxima;
}

function esSalidaPosible(fecha) {
  const { entrada, salida, cabanaId } = calendario;
  return Boolean(entrada && !salida && fecha > entrada &&
    nochesPermitidas(nochesEntre(entrada, fecha)) &&
    rangoLibre(cabanaId, entrada, fecha));
}

function mismoDia(a, b) {
  return Boolean(a && b && aClave(a) === aClave(b));
}

function limitesDelCalendario() {
  const actual = hoy();
  const minimo = new Date(actual.getFullYear(), actual.getMonth(), 1);
  const maximo = sumarMeses(minimo, Math.max(0, CONFIG.mesesDisponibles - calendario.meses));
  return { minimo, maximo };
}

function ajustarMesVisible() {
  const { minimo, maximo } = limitesDelCalendario();
  if (calendario.mesInicio < minimo) calendario.mesInicio = minimo;
  if (calendario.mesInicio > maximo) calendario.mesInicio = maximo;
}

/* ---------- Carga de disponibilidad desde la base de datos ---------- */

async function cargarDisponibilidad({ lanzarError = false } = {}) {
  if (!baseDeDatosDisponible()) return false;

  const primeraCarga = calendario.estadoCarga !== "ok";
  if (primeraCarga) {
    calendario.estadoCarga = "cargando";
    actualizarEstadoConexion();
  }

  const desde = hoy();
  const hasta = sumarMeses(desde, CONFIG.mesesDisponibles + 1);

  try {
    const filas = await window.ReservasAPI.obtenerDisponibilidad(aClave(desde), aClave(hasta));
    const nuevas = {};
    CONFIG.cabanas.forEach((cabana) => { nuevas[String(cabana.id)] = new Set(); });
    filas.forEach((fila) => {
      const conjunto = nuevas[String(fila.cabana)];
      if (!conjunto) return;
      expandirFechas([{ desde: fila.fecha_desde, hasta: fila.fecha_hasta }]).forEach((clave) => conjunto.add(clave));
    });
    calendario.reservadas = nuevas;
    calendario.estadoCarga = "ok";
    actualizarEstadoConexion();
    return true;
  } catch (error) {
    console.error("[Reservas] No se pudo cargar la disponibilidad:", error);
    if (primeraCarga) {
      calendario.estadoCarga = "error";
      actualizarEstadoConexion();
    }
    if (lanzarError) throw error;
    return false;
  }
}

/* Actualiza el calendario y avisa si las fechas elegidas ya no están libres */
async function actualizarDisponibilidad({ avisar = true } = {}) {
  const exito = await cargarDisponibilidad();
  if (exito) verificarSeleccion({ avisar });
  renderizarCalendario();
}

function verificarSeleccion({ avisar = true } = {}) {
  const { entrada, salida, cabanaId } = calendario;
  if (!entrada) return true;
  const valida = !estaOcupada(cabanaId, aClave(entrada)) && (!salida || rangoLibre(cabanaId, entrada, salida));
  if (!valida) {
    calendario.entrada = null;
    calendario.salida = null;
    if (avisar) aviso("Algunas de las fechas que elegiste acaban de reservarse. Elegí nuevas fechas.");
  }
  return valida;
}

function actualizarEstadoConexion() {
  const contenedor = $("#calendar-status");
  const texto = $("#calendar-status-texto");
  const reintentar = $("#calendar-reintentar");

  if (calendario.estadoCarga === "cargando") {
    texto.textContent = "Cargando disponibilidad actualizada...";
    reintentar.hidden = true;
    contenedor.hidden = false;
    contenedor.classList.remove("is-error");
  } else if (calendario.estadoCarga === "error") {
    texto.textContent = "No pudimos cargar la disponibilidad actualizada.";
    reintentar.hidden = false;
    contenedor.hidden = false;
    contenedor.classList.add("is-error");
  } else {
    contenedor.hidden = true;
  }
}

/* ---------- Dibujo del calendario ---------- */

function htmlDia(fecha) {
  const clave = aClave(fecha);
  const id = calendario.cabanaId;
  const pasado = fecha < hoy();
  const ocupada = !pasado && estaOcupada(id, clave);
  const salidaPosible = ocupada && esSalidaPosible(fecha);
  const clases = ["cal-day"];
  let estado = "disponible";

  if (pasado) {
    clases.push("is-pasado");
    estado = "fecha pasada";
  } else if (ocupada) {
    clases.push("is-ocupado");
    estado = salidaPosible ? "reservada, disponible como fecha de salida" : "reservada";
    if (salidaPosible) clases.push("is-salida-posible");
  }

  if (mismoDia(fecha, hoy())) clases.push("is-hoy");

  if (mismoDia(fecha, calendario.entrada)) {
    clases.push("is-entrada");
    estado = "fecha de entrada seleccionada";
  } else if (mismoDia(fecha, calendario.salida)) {
    clases.push("is-salida");
    estado = "fecha de salida seleccionada";
  } else if (calendario.entrada && calendario.salida && fecha > calendario.entrada && fecha < calendario.salida) {
    clases.push("is-en-rango");
    estado = "dentro de las fechas seleccionadas";
  }

  const etiqueta = `${capitalizar(formatoCompleto.format(fecha))}, ${estado}`;
  const atributos = [
    `type="button"`,
    `class="${clases.join(" ")}"`,
    `data-fecha="${clave}"`,
    `aria-label="${etiqueta}"`
  ];
  if (pasado) atributos.push("disabled");
  if (ocupada && !salidaPosible) atributos.push(`aria-disabled="true"`);

  return `<button ${atributos.join(" ")}>${fecha.getDate()}</button>`;
}

function htmlMes(primerDia) {
  const anio = primerDia.getFullYear();
  const mes = primerDia.getMonth();
  const diasDelMes = new Date(anio, mes + 1, 0).getDate();
  const desplazamiento = (primerDia.getDay() + 6) % 7; // La semana empieza el lunes
  const titulo = capitalizar(formatoMes.format(primerDia));

  let celdas = DIAS_SEMANA.map((dia) => `<span class="cal-weekday" aria-hidden="true">${dia}</span>`).join("");
  celdas += "<span></span>".repeat(desplazamiento);
  for (let dia = 1; dia <= diasDelMes; dia++) {
    celdas += htmlDia(new Date(anio, mes, dia));
  }

  return `
    <div class="cal-month">
      <p class="cal-month__title">${titulo}</p>
      <div class="cal-grid" role="group" aria-label="${titulo}">${celdas}</div>
    </div>`;
}

function renderizarCalendario(claveAEnfocar) {
  const contenedor = $("#calendar-months");
  const teniaFoco = contenedor.contains(document.activeElement);
  ajustarMesVisible();

  contenedor.style.setProperty("--meses", calendario.meses);
  let html = "";
  for (let i = 0; i < calendario.meses; i++) {
    html += htmlMes(sumarMeses(calendario.mesInicio, i));
  }
  contenedor.innerHTML = html;

  const { minimo, maximo } = limitesDelCalendario();
  $("#cal-prev").disabled = calendario.mesInicio <= minimo;
  $("#cal-next").disabled = calendario.mesInicio >= maximo;
  $("#cal-label").innerHTML = `<span>Consultando</span>${escaparHTML(buscarCabana(calendario.cabanaId).nombre)}`;

  if (teniaFoco && claveAEnfocar) {
    $(`[data-fecha="${claveAEnfocar}"]`, contenedor)?.focus({ preventScroll: true });
  }

  actualizarIndicacion();
  actualizarResumen();
}

function actualizarIndicacion() {
  const { entrada, salida } = calendario;
  let texto = "Seleccioná la fecha de entrada.";
  if (entrada && !salida) texto = `Entrada: ${fechaResumen(entrada)}. Ahora seleccioná la fecha de salida.`;
  else if (entrada && salida) texto = "Fechas seleccionadas. Completá tus datos en el resumen de reserva.";
  $("#calendar-hint").textContent = texto;
}

/* ---------- Resumen y formulario ---------- */

function mostrarDato(selector, valor) {
  const el = $(selector);
  el.textContent = valor ?? "Sin seleccionar";
  el.classList.toggle("is-vacio", valor == null);
}

function actualizarOpcionesHuespedes() {
  const cabana = buscarCabana(calendario.cabanaId);
  const maximo = Math.max(1, Number(cabana.capacidadMaxima) || 1);
  const select = $("#reserva-huespedes");
  const actual = Number(select.value) || 0;

  let html = `<option value="">Elegí una opción</option>`;
  for (let i = 1; i <= maximo; i++) {
    html += `<option value="${i}"${i === actual ? " selected" : ""}>${textoPersonas(i)}</option>`;
  }
  select.innerHTML = html;
}

function actualizarResumen() {
  const cabana = buscarCabana(calendario.cabanaId);
  const { entrada, salida } = calendario;
  const noches = entrada && salida ? nochesEntre(entrada, salida) : null;
  const huespedes = Number($("#reserva-huespedes").value) || null;

  mostrarDato("#sum-cabana", cabana.nombre);
  mostrarDato("#sum-entrada", entrada ? fechaResumen(entrada) : null);
  mostrarDato("#sum-salida", salida ? fechaResumen(salida) : null);
  mostrarDato("#sum-noches", noches ? textoNoches(noches) : null);
  mostrarDato("#sum-huespedes", huespedes ? textoPersonas(huespedes) : null);

  const listo = Boolean(entrada && salida && huespedes);
  $("#btn-reservar").setAttribute("aria-disabled", String(!listo));
}

function marcarInvalido(campo, invalido) {
  if (invalido) campo.setAttribute("aria-invalid", "true");
  else campo.removeAttribute("aria-invalid");
}

function ponerEnviando(enviando) {
  calendario.enviando = enviando;
  const boton = $("#btn-reservar");
  boton.disabled = enviando;
  boton.classList.toggle("is-loading", enviando);
  boton.setAttribute("aria-busy", String(enviando));
  $(".btn__texto", boton).textContent = enviando ? "Enviando consulta..." : "Consultar por WhatsApp";
}

function mostrarExito({ guardada, enlace, datos }) {
  const texto = guardada
    ? `Registramos tu solicitud para la ${datos.cabana} del ${datos.entrada} al ${datos.salida} (${datos.noches}, ${datos.personas}). Las fechas quedan pendientes hasta que te confirmemos por WhatsApp. Si no se abrió WhatsApp, tocá el botón.`
    : `Para completar tu consulta por la ${datos.cabana} del ${datos.entrada} al ${datos.salida} (${datos.personas}), envianos el mensaje por WhatsApp.`;

  $("#reserva-exito-texto").textContent = texto;
  $("#reserva-exito-wa").href = enlace;
  $("#reserva-panel").hidden = true;
  const exito = $("#reserva-exito");
  exito.hidden = false;
  exito.focus({ preventScroll: true });

  calendario.entrada = null;
  calendario.salida = null;
  $("#reserva-form").reset();
  renderizarCalendario();
}

function nuevaConsulta() {
  $("#reserva-exito").hidden = true;
  $("#reserva-panel").hidden = false;
  renderizarCalendario();
  $("#calendar-months").scrollIntoView({ behavior: prefiereMenosMovimiento ? "auto" : "smooth", block: "center" });
}

async function enviarSolicitud(evento) {
  evento.preventDefault();
  if (calendario.enviando) return;

  const formulario = evento.currentTarget;
  const campoHuespedes = $("#reserva-huespedes");
  const campoNombre = $("#reserva-nombre");
  const campoMensaje = $("#reserva-mensaje");
  const { entrada, salida } = calendario;
  const cabana = buscarCabana(calendario.cabanaId);

  /* Validaciones */
  if (!entrada || !salida) {
    aviso("Primero elegí la fecha de entrada y la fecha de salida en el calendario.");
    return;
  }
  const huespedes = Number(campoHuespedes.value);
  marcarInvalido(campoHuespedes, !huespedes);
  if (!huespedes) {
    campoHuespedes.focus();
    aviso("Elegí la cantidad de huéspedes.");
    return;
  }
  const nombre = campoNombre.value.trim().replace(/\s+/g, " ");
  marcarInvalido(campoNombre, nombre.length < 2);
  if (nombre.length < 2) {
    campoNombre.focus();
    aviso("Ingresá tu nombre y apellido.");
    return;
  }
  const mensaje = campoMensaje.value.trim().slice(0, 500);
  const noches = nochesEntre(entrada, salida);

  const datos = {
    cabana: cabana.nombre,
    entrada: formatoFecha.format(entrada),
    salida: formatoFecha.format(salida),
    noches: textoNoches(noches),
    personas: textoPersonas(huespedes),
    nombre
  };
  const enlace = enlaceWhatsApp(plantilla(CONFIG.mensajesWhatsapp.reserva, datos));
  const hayWhatsApp = whatsappConfigurado();

  /* Campo trampa completado: es un envío automático, no se guarda nada */
  if (formulario.elements.sitio_web.value) {
    mostrarExito({ guardada: false, enlace, datos });
    return;
  }

  /* Sin base de datos: solo WhatsApp */
  if (!baseDeDatosDisponible()) {
    if (hayWhatsApp) window.open(enlace, "_blank", "noopener");
    mostrarExito({ guardada: false, enlace, datos });
    if (!hayWhatsApp) aviso("Falta configurar el número de WhatsApp (script.js > CONFIG.whatsapp).");
    return;
  }

  /* La pestaña de WhatsApp se abre en el momento del clic para que el
     navegador no la bloquee; se completa cuando la solicitud se guardó. */
  const ventana = hayWhatsApp ? window.open("", "_blank") : null;
  if (ventana) ventana.opener = null;

  ponerEnviando(true);
  try {
    /* Se revisa la disponibilidad justo antes de guardar */
    await cargarDisponibilidad({ lanzarError: true });
    if (!rangoLibre(cabana.id, entrada, salida)) {
      const ocupado = new Error("FECHAS_OCUPADAS");
      ocupado.codigo = "FECHAS_OCUPADAS";
      throw ocupado;
    }

    await window.ReservasAPI.crearSolicitud({
      cabana: cabana.id,
      fechaEntrada: aClave(entrada),
      fechaSalida: aClave(salida),
      nombre,
      cantidadHuespedes: huespedes,
      mensaje
    });
  } catch (error) {
    if (ventana) ventana.close();
    ponerEnviando(false);
    console.error("[Reservas] No se pudo registrar la solicitud:", error);
    aviso(MENSAJES_ERROR_RESERVA[error.codigo] || MENSAJES_ERROR_RESERVA.DESCONOCIDO);
    if (error.codigo === "FECHAS_OCUPADAS") {
      calendario.entrada = null;
      calendario.salida = null;
      await cargarDisponibilidad();
      renderizarCalendario();
    }
    return;
  }

  ponerEnviando(false);
  await cargarDisponibilidad();

  if (ventana) ventana.location.href = enlace;
  mostrarExito({ guardada: true, enlace, datos });
  if (!hayWhatsApp) aviso("Solicitud registrada. Falta configurar el número de WhatsApp (script.js > CONFIG.whatsapp).");
}

/* ---------- Selección de fechas ---------- */

function alSeleccionarDia(clave) {
  if (calendario.estadoCarga === "cargando") {
    aviso("Estamos cargando la disponibilidad. Esperá un momento.");
    return;
  }

  const fecha = desdeClave(clave);
  const id = calendario.cabanaId;
  const ocupada = estaOcupada(id, clave);
  const { entrada, salida } = calendario;

  /* Elegir la fecha de salida */
  if (entrada && !salida && fecha > entrada) {
    if (rangoLibre(id, entrada, fecha)) {
      const noches = nochesEntre(entrada, fecha);
      if (noches < CONFIG.estadiaMinima) {
        aviso(`La estadía mínima es de ${textoNoches(CONFIG.estadiaMinima)}.`);
        return;
      }
      if (noches > CONFIG.estadiaMaxima) {
        aviso(`Para estadías de más de ${textoNoches(CONFIG.estadiaMaxima)}, escribinos por WhatsApp.`);
        return;
      }
      calendario.salida = fecha;
      renderizarCalendario(clave);
      return;
    }
    if (ocupada) {
      aviso("Esa fecha está reservada. Elegí una fecha de salida anterior.");
      return;
    }
    aviso("Entre esas fechas hay noches reservadas. Empezamos una nueva selección desde esta fecha.");
  } else if (ocupada) {
    aviso("Esa fecha está reservada. Elegí otra fecha de entrada.");
    return;
  }

  /* Elegir (o volver a elegir) la fecha de entrada */
  calendario.entrada = fecha;
  calendario.salida = null;
  renderizarCalendario(clave);
}

function limpiarSeleccion() {
  calendario.entrada = null;
  calendario.salida = null;
  renderizarCalendario();
}

function seleccionarCabana(id, { avisar = true } = {}) {
  const idTexto = String(id);
  if (!buscarCabana(idTexto)) return;
  calendario.cabanaId = idTexto;

  $$('#cabin-picker input[name="cabana"]').forEach((radio) => {
    radio.checked = radio.value === idTexto;
  });

  const { entrada, salida } = calendario;
  if (entrada) {
    const noDisponible = estaOcupada(idTexto, aClave(entrada)) || (salida && !rangoLibre(idTexto, entrada, salida));
    if (noDisponible) {
      calendario.entrada = null;
      calendario.salida = null;
      if (avisar) aviso("Las fechas elegidas no están disponibles en esta cabaña. Elegí nuevas fechas.");
    }
  }

  /* Si estaba a la vista la confirmación de una consulta anterior, volver al formulario */
  $("#reserva-exito").hidden = true;
  $("#reserva-panel").hidden = false;

  actualizarOpcionesHuespedes();
  renderizarCalendario();
}

async function iniciarCalendario() {
  calendario.cabanaId = String(CONFIG.cabanas[0].id);
  const actual = hoy();
  calendario.mesInicio = new Date(actual.getFullYear(), actual.getMonth(), 1);

  CONFIG.cabanas.forEach((cabana) => {
    const id = String(cabana.id);
    calendario.fijas[id] = expandirFechas(cabana.fechasOcupadas);
    calendario.reservadas[id] = new Set();
  });

  /* Selector de cabañas */
  const selector = $("#cabin-picker");
  selector.insertAdjacentHTML("beforeend", CONFIG.cabanas.map((cabana, i) => `
    <label class="cabin-picker__option">
      <input type="radio" name="cabana" value="${cabana.id}"${i === 0 ? " checked" : ""}>
      <span>${escaparHTML(cabana.nombre)}</span>
    </label>`).join(""));
  selector.addEventListener("change", (e) => {
    if (e.target.name === "cabana") seleccionarCabana(e.target.value);
  });

  /* Cantidad de meses según el ancho disponible */
  const contenedor = $("#calendar-months");
  const calcularMeses = () => (contenedor.clientWidth >= 600 ? 2 : 1);
  calendario.meses = calcularMeses();
  const alCambiarTamano = debounce(() => {
    const meses = calcularMeses();
    if (meses !== calendario.meses) {
      calendario.meses = meses;
      renderizarCalendario();
    }
  }, 120);
  if ("ResizeObserver" in window) new ResizeObserver(alCambiarTamano).observe(contenedor);
  else window.addEventListener("resize", alCambiarTamano);

  /* Navegación entre meses */
  $("#cal-prev").addEventListener("click", () => {
    calendario.mesInicio = sumarMeses(calendario.mesInicio, -1);
    renderizarCalendario();
  });
  $("#cal-next").addEventListener("click", () => {
    calendario.mesInicio = sumarMeses(calendario.mesInicio, 1);
    renderizarCalendario();
  });

  /* Selección de días */
  contenedor.addEventListener("click", (e) => {
    const dia = e.target.closest(".cal-day");
    if (dia && !dia.disabled) alSeleccionarDia(dia.dataset.fecha);
  });

  /* Vista previa del rango al pasar el mouse */
  const limpiarVistaPrevia = () => $$(".is-preview", contenedor).forEach((el) => el.classList.remove("is-preview"));
  contenedor.addEventListener("mouseover", (e) => {
    const { entrada, salida, cabanaId } = calendario;
    if (!entrada || salida) return;
    const dia = e.target.closest(".cal-day");
    limpiarVistaPrevia();
    if (!dia) return;
    const fin = desdeClave(dia.dataset.fecha);
    if (fin <= entrada || !nochesPermitidas(nochesEntre(entrada, fin)) || !rangoLibre(cabanaId, entrada, fin)) return;
    const claveEntrada = aClave(entrada);
    const claveFin = dia.dataset.fecha;
    $$(".cal-day", contenedor).forEach((el) => {
      const clave = el.dataset.fecha;
      if (clave > claveEntrada && clave <= claveFin) el.classList.add("is-preview");
    });
  });
  contenedor.addEventListener("mouseleave", limpiarVistaPrevia);

  /* Formulario */
  actualizarOpcionesHuespedes();
  $("#reserva-huespedes").addEventListener("change", (e) => {
    marcarInvalido(e.target, false);
    actualizarResumen();
  });
  $("#reserva-nombre").addEventListener("input", (e) => marcarInvalido(e.target, false));
  $("#reserva-form").addEventListener("submit", enviarSolicitud);
  $("#btn-limpiar").addEventListener("click", limpiarSeleccion);
  $("#reserva-nueva").addEventListener("click", nuevaConsulta);
  $("#calendar-reintentar").addEventListener("click", () => actualizarDisponibilidad({ avisar: true }));

  renderizarCalendario();

  if (!baseDeDatosDisponible()) {
    console.warn("[Reservas] Base de datos sin configurar (reservas/supabase-config.js). Las consultas se envían solo por WhatsApp y no se guardan.");
    return;
  }

  calendario.estadoCarga = "cargando";
  await actualizarDisponibilidad({ avisar: false });

  /* Mantener la disponibilidad al día */
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && !calendario.enviando) actualizarDisponibilidad();
  });
  setInterval(() => {
    if (document.visibilityState === "visible" && !calendario.enviando) actualizarDisponibilidad();
  }, INTERVALO_ACTUALIZACION);
}


/* =========================================================================
   10. ANIMACIONES AL HACER SCROLL
   ========================================================================= */

function iniciarAnimaciones() {
  const elementos = $$(".reveal");

  elementos.forEach((el) => {
    const hermanos = Array.from(el.parentElement.children).filter((hijo) => hijo.classList.contains("reveal"));
    const posicion = hermanos.indexOf(el) % 4;
    el.style.setProperty("--delay", `${posicion * 90}ms`);
  });

  if (prefiereMenosMovimiento || !("IntersectionObserver" in window)) {
    elementos.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("is-visible");
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

  elementos.forEach((el) => observador.observe(el));
}


/* =========================================================================
   11. INICIO
   ========================================================================= */

iniciarRespaldos();
aplicarDatosGenerales();
iniciarNavegacion();
iniciarCabanas();
iniciarGaleria();
iniciarCalendario();
iniciarAnimaciones();
