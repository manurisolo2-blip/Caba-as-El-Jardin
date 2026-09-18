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
     PRELOADER HERO CON REVELACIÓN EN ARCO
     ----------------------------------------------------------------------- */
  arcPreloader: {
    activo: true,
    saludos: [
      "Calma.",
      "Bosque.",
      "Naturaleza.",
      "A pasos del mar.",
      "Cabañas El Jardín."
    ],
    tiempoPalabra: 520,
    duracionArco: 1200,
    storageKey: "arc_preloader_seen"
  },

  /* -----------------------------------------------------------------------
     PROPIETARIO Y CONTACTO DIRECTO
     ----------------------------------------------------------------------- */
  propietario: "Ignacio Posada",
  telefonoPrincipal: "(011) 15-3261-8849",
  telefonoSecundario: "(011) 15-3261-6765",
  whatsappSecundario: "5491132616765",
  facebook: "https://facebook.com/eljardi",

  /* -----------------------------------------------------------------------
     WHATSAPP
     Número en formato internacional, SOLO NÚMEROS (sin +, espacios ni guiones).
     Para celulares de Argentina: 54 + 9 + código de área sin 0 + número sin 15.
     Formato de ejemplo (NO es un número real): "549XXXXXXXXXX"
     Mientras esté vacío, los botones de WhatsApp muestran un aviso.
     ----------------------------------------------------------------------- */
  whatsapp: "5491132618849",

  /* Mensajes automáticos de WhatsApp.
     En "reserva" se reemplazan solos: {cabana}, {entrada}, {salida},
     {noches}, {personas} y {nombre}. */
  mensajesWhatsapp: {
    general: "Hola Ignacio, te contacto desde la web de Cabañas El Jardín. Quería consultar disponibilidad y tarifas para los departamentos de 2 ambientes.",
    cabana: "Hola Ignacio, te contacto desde la web de Cabañas El Jardín. Quería consultar disponibilidad y tarifas para los departamentos de 2 ambientes.",
    reserva: "Hola Ignacio, te contacto desde la web de Cabañas El Jardín. Quería consultar disponibilidad y tarifas para los departamentos de 2 ambientes.",
    directo: "Hola Ignacio, te contacto desde la web de Cabañas El Jardín. Quería consultar disponibilidad y tarifas para los departamentos de 2 ambientes."
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
      capacidad: "Ideal 2 a 4 personas",       // EDITAR: cama doble (2) + cama marinera (2).
      capacidadMaxima: 4,                      // EDITAR: número máximo de huéspedes
      precio: "",                              // EDITAR: precio. Ej: "$ 00.000 por noche"
      descripcionCorta:                        // EDITAR: descripción de la tarjeta
        "Dormitorio principal con cama doble, estar comedor con cama marinera, cocina completa y baño. Con deck individual, asador propio y acceso al parque arbolado.",
      descripcion: [                           // EDITAR: descripción completa
        "Una cabaña cómoda y acogedora para disfrutar de Valeria del Mar. Cuenta con un dormitorio con cama doble, comedor con cama marinera, cocina comedor y baño completo.",
        "Afuera te esperan el parque arbolado, el asador individual y la ducha de playa, ideales para aprovechar los días de descanso a pasos del mar. También dispone de cochera."
      ],
      destacados: [
        { icono: "grill", texto: "Parrilla individual" },
        { icono: "deck", texto: "Deck techado" },
        { icono: "wifi", texto: "Wi-Fi fibra óptica" },
        { icono: "utensils", texto: "Cocina equipada" },
        { icono: "car", texto: "Estacionamiento en predio" },
        { icono: "tv", texto: "Smart TV" }
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
      capacidad: "Ideal 2 a 4 personas",       // EDITAR: cama doble (2) + cama marinera (2).
      capacidadMaxima: 4,                      // EDITAR: número máximo de huéspedes
      precio: "",                              // EDITAR: precio. Ej: "$ 00.000 por noche"
      descripcionCorta:                        // EDITAR: descripción de la tarjeta
        "Unidad independiente rodeada de bosque, con dormitorio matrimonial, cocina equipada, baño completo, deck propio con parrilla y cochera techada.",
      descripcion: [                           // EDITAR: descripción completa
        "Una cabaña cómoda y acogedora para disfrutar de Valeria del Mar. Cuenta con un dormitorio con cama doble, comedor con cama marinera, cocina comedor y baño completo.",
        "Afuera te esperan el parque arbolado, el asador y el deck individual, ideales para aprovechar los días de descanso y playa. También dispone de cochera."
      ],
      destacados: [
        { icono: "grill", texto: "Parrilla individual" },
        { icono: "deck", texto: "Deck techado" },
        { icono: "wifi", texto: "Wi-Fi fibra óptica" },
        { icono: "utensils", texto: "Cocina equipada" },
        { icono: "car", texto: "Estacionamiento en predio" },
        { icono: "tv", texto: "Smart TV" }
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
      capacidad: "Ideal 2 a 4 personas",       // EDITAR: cama doble (2) + cama marinera (2).
      capacidadMaxima: 4,                      // EDITAR: número máximo de huéspedes
      precio: "",                              // EDITAR: precio. Ej: "$ 00.000 por noche"
      descripcionCorta:                        // EDITAR: descripción de la tarjeta
        "Ambiente sereno con galería privada hacia el parque arbolado, cocina comedor, dormitorio confortable, parrilla exclusiva y estacionamiento interior.",
      descripcion: [                           // EDITAR: descripción completa
        "Una cabaña cómoda y acogedora para disfrutar de Valeria del Mar. Cuenta con un dormitorio con cama doble, comedor con cama marinera, cocina comedor y baño completo.",
        "Afuera te esperan el parque arbolado, el asador y la tranquilidad del entorno, ideales para aprovechar los días de descanso y playa. También dispone de cochera."
      ],
      destacados: [
        { icono: "grill", texto: "Parrilla individual" },
        { icono: "deck", texto: "Deck techado" },
        { icono: "wifi", texto: "Wi-Fi fibra óptica" },
        { icono: "utensils", texto: "Cocina equipada" },
        { icono: "car", texto: "Estacionamiento en predio" },
        { icono: "tv", texto: "Smart TV" }
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
        { src: "images/parque-reposeras.jpg", alt: "Parque y reposeras" }
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
  { icono: "car", texto: "Cochera dentro del predio" },
  { icono: "grill", texto: "Asador y parrilla propia" },
  { icono: "tree", texto: "Parque arbolado" }
];

const EQUIPAMIENTO_COMUN = [
  { icono: "tv", texto: "TV Smart en sala principal" },
  { icono: "fan", texto: "Ventilador y ventilación cruzada" },
  { icono: "fridge", texto: "Heladera con freezer" },
  { icono: "microwave", texto: "Microondas" },
  { icono: "cooktop", texto: "Anafe y cocina completa" },
  { icono: "boiler", texto: "Termotanque (agua caliente)" },
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

  $$('[data-whatsapp="directo"]').forEach((enlace) => {
    enlace.href = enlaceWhatsApp(CONFIG.mensajesWhatsapp.directo);
  });

  $$("[data-instagram]").forEach((enlace) => {
    if (CONFIG.instagram) enlace.href = CONFIG.instagram;
  });

  $$("[data-facebook]").forEach((enlace) => {
    if (CONFIG.facebook) enlace.href = CONFIG.facebook;
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
    const esScrolled = window.scrollY > 50;
    header.classList.toggle("is-scrolled", esScrolled);
    if (botonFlotante) botonFlotante.classList.toggle("is-visible", window.scrollY > 250);
  };
  window.addEventListener("scroll", () => {
    if (!pendiente) {
      pendiente = true;
      requestAnimationFrame(alHacerScroll);
    }
  }, { passive: true });
  window.addEventListener("resize", alHacerScroll, { passive: true });
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
  /* Volver arriba de todo al tocar el botón del logo o "Volver arriba" */
  function irArribaDelTodo(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    abrirMenu(false);

    const comportamiento = prefiereMenosMovimiento ? "auto" : "smooth";

    // 1. Scroll suave al pixel 0 absoluto (top: 0, left: 0)
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: comportamiento
      });
    } catch (_) {
      window.scrollTo(0, 0);
    }

    if (document.documentElement) {
      try {
        document.documentElement.scrollTo({ top: 0, left: 0, behavior: comportamiento });
      } catch (_) {
        document.documentElement.scrollTop = 0;
      }
    }

    if (document.body) {
      try {
        document.body.scrollTo({ top: 0, left: 0, behavior: comportamiento });
      } catch (_) {
        document.body.scrollTop = 0;
      }
    }

    // 2. Limpiar hash de ancla de la URL
    if (window.history && window.history.pushState) {
      window.history.pushState(null, "", window.location.pathname);
    }

    // 3. Respaldo para asegurar que se llegue al pixel 0 exacto sin quedar a mitad de camino
    if (!prefiereMenosMovimiento) {
      setTimeout(() => {
        if (window.scrollY > 0 && window.scrollY < 120) {
          window.scrollTo({ top: 0, left: 0, behavior: "auto" });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      }, 700);
    }
  }

  const botonesInicio = $$(".brand, a[href='#inicio'], a[href='#top'], .footer__top, #btn-volver-arriba, [data-volver-arriba]");
  botonesInicio.forEach((btn) => {
    btn.addEventListener("click", irArribaDelTodo);
  });

  // Delegación global en el documento para garantizar la captura de cualquier clic
  document.addEventListener("click", (e) => {
    const btnArriba = e.target.closest(".footer__top, #btn-volver-arriba, [data-volver-arriba], a[href='#top']");
    if (btnArriba) {
      irArribaDelTodo(e);
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
  if (!contenedor) return;

  contenedor.innerHTML = CONFIG.cabanas.map((cabana) => {
    const portada = cabana.fotos[0] || { src: "", alt: cabana.nombre };
    const precio = cabana.precio
      ? `<span class="cabin-card__price">Tarifa: <strong>${escaparHTML(cabana.precio)}</strong></span>`
      : "";

    return `
      <article class="cabin-card reveal">
        <div class="cabin-card__media" role="button" tabindex="0" data-ver-cabana="${cabana.id}" aria-label="Ver fotos de ${escaparHTML(cabana.nombre)}">
          <img src="${escaparHTML(portada.src)}" alt="${escaparHTML(portada.alt)}" data-placeholder="${escaparHTML(cabana.nombre)}" loading="lazy">
          <span class="cabin-card__badge">${escaparHTML(cabana.capacidad || "Ideal 2 a 4 personas")}</span>
        </div>
        <div class="cabin-card__body">
          <div class="cabin-card__header">
            <h3 class="cabin-card__title">${escaparHTML(cabana.nombre)}</h3>
            ${precio}
          </div>
          <p class="cabin-card__desc">${escaparHTML(cabana.descripcionCorta)}</p>
          
          <div class="cabin-card__amenities" aria-label="Comodidades de la unidad">
            ${(cabana.destacados || []).map((item) => `
              <div class="cabin-card__amenity">
                ${icono(item.icono)}
                <span>${escaparHTML(item.texto)}</span>
              </div>
            `).join("")}
          </div>

          <div class="cabin-card__actions">
            <button class="cabin-card__cta" type="button" data-consultar-cabana="${cabana.id}">
              Consultar por esta cabaña
            </button>
            <button class="cabin-card__link-details" type="button" data-ver-cabana="${cabana.id}">
              <span>Ver fotos y equipamiento</span>
              ${icono("arrow")}
            </button>
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
      const selector = $("#selector-consulta") || $("#cabanas");
      if (selector) {
        selector.scrollIntoView({ behavior: prefiereMenosMovimiento ? "auto" : "smooth" });
      }
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const mediaBtn = e.target.closest(".cabin-card__media[data-ver-cabana]");
      if (mediaBtn) {
        e.preventDefault();
        abrirModalCabana(mediaBtn.dataset.verCabana);
      }
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

  const items = $$(".editorial-card, .gallery__item");

  items.forEach((item) => {
    const captionEl = $(".editorial-card__caption, .gallery__caption", item);
    const titulo = captionEl?.textContent.trim() || $("img", item)?.alt || "";
    const btn = $(".gallery__btn, .editorial-card__frame", item);
    if (btn) btn.setAttribute("aria-label", `Ampliar foto: ${titulo}`);
  });

  /* Filtros (si existen en la página) */
  const filtros = $$(".chip[data-filtro]");
  if (filtros.length) {
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
  }

  /* Abrir foto ampliada */
  const grid = $("#gallery-grid");
  if (grid) {
    grid.addEventListener("click", (e) => {
      const boton = e.target.closest(".gallery__btn, .editorial-card__frame");
      if (!boton) return;
      const card = boton.closest(".editorial-card, .gallery__item");
      const visibles = items.filter((item) => !item.classList.contains("is-oculto"));
      const fotos = visibles.map((item) => {
        const img = $("img", item);
        const captionEl = $(".editorial-card__caption, .gallery__caption", item);
        return {
          src: img.currentSrc || img.src,
          alt: img.alt,
          titulo: captionEl?.textContent.trim() || img.alt
        };
      });
      const indice = visibles.indexOf(card);
      if (indice !== -1) {
        abrirLightbox(fotos, indice);
      }
    });
  }

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
   9. SELECTOR RÁPIDO DE CONSULTA (GENERADOR DE MENSAJE DE WHATSAPP)
   ========================================================================= */

function formatearFechaLegible(fechaStr) {
  if (!fechaStr) return "";
  if (fechaStr.includes("/")) return fechaStr;
  const partes = fechaStr.split("-");
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return fechaStr;
}

function iniciarSelectorConsulta() {
  const form = $("#quick-wa-form");
  if (!form) return;

  const checkinInput = $("#wa-checkin");
  const checkoutInput = $("#wa-checkout");
  const guestsSelect = $("#wa-guests");
  const submitBtn = $("#quick-wa-submit");
  const calModal = $("#botanical-cal");

  if (!calModal || !checkinInput || !checkoutInput) return;

  const stepPill = $("#bcal-step-pill");
  const rangeInfo = $("#bcal-range-info");
  const monthTitle = $("#bcal-month-title");
  const prevBtn = $("#bcal-prev");
  const nextBtn = $("#bcal-next");
  const gridEl = $("#bcal-grid");
  const closeBtn = $("#bcal-close");
  const clearBtn = $("#bcal-btn-clear");
  const doneBtn = $("#bcal-btn-done");

  const MESES_ES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const pad2 = (n) => String(n).padStart(2, "0");
  const dateToIso = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

  let mesVisualizado = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  let fechaIngreso = null;  // Date object
  let fechaSalida = null;   // Date object
  let campoActivo = "checkin"; // 'checkin' | 'checkout'
  let fechaHover = null;    // Date object

  const formatearDisplay = (d) => {
    if (!d) return "";
    return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  const abrirCalendario = (campo = "checkin") => {
    campoActivo = campo;
    calModal.hidden = false;

    if (campo === "checkin" && fechaIngreso) {
      mesVisualizado = new Date(fechaIngreso.getFullYear(), fechaIngreso.getMonth(), 1);
    } else if (campo === "checkout" && fechaSalida) {
      mesVisualizado = new Date(fechaSalida.getFullYear(), fechaSalida.getMonth(), 1);
    } else if (campo === "checkout" && fechaIngreso) {
      mesVisualizado = new Date(fechaIngreso.getFullYear(), fechaIngreso.getMonth(), 1);
    }

    actualizarInputsActivos();
    renderizarCalendario();
  };

  const cerrarCalendario = () => {
    calModal.hidden = true;
    checkinInput.classList.remove("is-active");
    checkoutInput.classList.remove("is-active");
  };

  const actualizarInputsActivos = () => {
    checkinInput.classList.toggle("is-active", campoActivo === "checkin");
    checkoutInput.classList.toggle("is-active", campoActivo === "checkout");

    if (campoActivo === "checkin") {
      stepPill.textContent = "Paso 1: Check-in";
      rangeInfo.textContent = "Elegí el día de llegada";
    } else {
      stepPill.textContent = "Paso 2: Check-out";
      if (fechaIngreso) {
        rangeInfo.textContent = `Llegada: ${formatearDisplay(fechaIngreso)} · Elegí salida`;
      } else {
        rangeInfo.textContent = "Elegí el día de salida";
      }
    }
  };

  const calcularNoches = (desde, hasta) => {
    if (!desde || !hasta) return 0;
    const diff = Math.round((hasta.getTime() - desde.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const renderizarCalendario = () => {
    const anio = mesVisualizado.getFullYear();
    const mes = mesVisualizado.getMonth();

    monthTitle.textContent = `${MESES_ES[mes]} ${anio}`;

    // Deshabilitar botón mes anterior si ya estamos en el mes actual
    const esMesActual = anio === hoy.getFullYear() && mes === hoy.getMonth();
    prevBtn.disabled = esMesActual;

    gridEl.innerHTML = "";

    const primerDiaSemana = new Date(anio, mes, 1).getDay(); // 0 = Dom, 1 = Lun...
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();

    // Celdas vacías previas
    for (let i = 0; i < primerDiaSemana; i++) {
      const emptyCell = document.createElement("div");
      emptyCell.className = "bcal-day-cell";
      const emptyBtn = document.createElement("button");
      emptyBtn.type = "button";
      emptyBtn.className = "bcal-day-btn is-empty";
      emptyBtn.disabled = true;
      emptyCell.appendChild(emptyBtn);
      gridEl.appendChild(emptyCell);
    }

    // Días del mes
    for (let d = 1; d <= diasEnMes; d++) {
      const fechaDia = new Date(anio, mes, d);
      fechaDia.setHours(0, 0, 0, 0);

      const cell = document.createElement("div");
      cell.className = "bcal-day-cell";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "bcal-day-btn";
      btn.textContent = String(d);

      const timeVal = fechaDia.getTime();
      const hoyTime = hoy.getTime();
      const inTime = fechaIngreso ? fechaIngreso.getTime() : null;
      const outTime = fechaSalida ? fechaSalida.getTime() : null;
      const hoverTime = (campoActivo === "checkout" && fechaHover) ? fechaHover.getTime() : null;

      if (timeVal === hoyTime) {
        btn.classList.add("is-today");
      }

      // Validación de fechas pasadas
      if (timeVal < hoyTime) {
        btn.classList.add("is-disabled");
        btn.disabled = true;
      } else if (campoActivo === "checkout" && inTime && timeVal <= inTime) {
        // En checkout, no se puede salir antes o el mismo día del check-in
        btn.classList.add("is-disabled");
        btn.disabled = true;
      }

      // Marcado de Check-in y Check-out
      const esCheckin = inTime && timeVal === inTime;
      const esCheckout = outTime && timeVal === outTime;

      if (esCheckin) {
        btn.classList.add("is-selected");
        cell.classList.add(outTime ? "is-range-start" : "is-single-select");
      }
      if (esCheckout) {
        btn.classList.add("is-selected");
        cell.classList.add("is-range-end");
      }

      // Rango confirmado
      if (inTime && outTime && timeVal > inTime && timeVal < outTime) {
        cell.classList.add("is-in-range");
      }

      // Rango de vista previa al pasar el cursor
      if (inTime && !outTime && hoverTime && hoverTime > inTime) {
        if (timeVal > inTime && timeVal < hoverTime) {
          cell.classList.add("is-preview-range");
        } else if (timeVal === hoverTime) {
          cell.classList.add("is-range-end");
        }
      }

      // Eventos del día
      if (!btn.disabled) {
        btn.addEventListener("mouseenter", () => {
          if (campoActivo === "checkout" && inTime && timeVal > inTime) {
            fechaHover = fechaDia;
            const noches = calcularNoches(fechaIngreso, fechaDia);
            rangeInfo.textContent = `${formatearDisplay(fechaIngreso)} → ${formatearDisplay(fechaDia)} (${noches} ${noches === 1 ? 'noche' : 'noches'})`;
            renderizarRangosEnDOM();
          }
        });

        btn.addEventListener("click", () => {
          seleccionarFecha(fechaDia);
        });
      }

      cell.appendChild(btn);
      gridEl.appendChild(cell);
    }
  };

  const renderizarRangosEnDOM = () => {
    const inTime = fechaIngreso ? fechaIngreso.getTime() : null;
    const outTime = fechaSalida ? fechaSalida.getTime() : null;
    const hoverTime = (campoActivo === "checkout" && fechaHover) ? fechaHover.getTime() : null;
    const anio = mesVisualizado.getFullYear();
    const mes = mesVisualizado.getMonth();

    const cells = gridEl.querySelectorAll(".bcal-day-cell");
    cells.forEach((cell) => {
      const btn = cell.querySelector(".bcal-day-btn:not(.is-empty)");
      if (!btn) return;
      const d = Number(btn.textContent);
      const timeVal = new Date(anio, mes, d).getTime();

      cell.classList.remove("is-in-range", "is-preview-range", "is-range-start", "is-range-end", "is-single-select");

      const esIn = inTime && timeVal === inTime;
      const esOut = outTime && timeVal === outTime;

      if (esIn) {
        cell.classList.add(outTime || hoverTime ? "is-range-start" : "is-single-select");
      } else if (esOut) {
        cell.classList.add("is-range-end");
      } else if (inTime && outTime && timeVal > inTime && timeVal < outTime) {
        cell.classList.add("is-in-range");
      } else if (inTime && !outTime && hoverTime && hoverTime > inTime) {
        if (timeVal > inTime && timeVal < hoverTime) {
          cell.classList.add("is-preview-range");
        } else if (timeVal === hoverTime) {
          cell.classList.add("is-range-end");
        }
      }
    });
  };

  gridEl.addEventListener("mouseleave", () => {
    if (campoActivo === "checkout" && !fechaSalida) {
      fechaHover = null;
      if (fechaIngreso) {
        rangeInfo.textContent = `Llegada: ${formatearDisplay(fechaIngreso)} · Elegí salida`;
      }
      renderizarRangosEnDOM();
    }
  });

  const seleccionarFecha = (fecha) => {
    if (campoActivo === "checkin") {
      fechaIngreso = fecha;
      checkinInput.value = formatearDisplay(fecha);
      checkinInput.dataset.iso = dateToIso(fecha);

      if (fechaSalida && fechaSalida <= fechaIngreso) {
        fechaSalida = null;
        checkoutInput.value = "";
        checkoutInput.dataset.iso = "";
      }

      // Pasar automáticamente al paso 2: checkout
      campoActivo = "checkout";
      actualizarInputsActivos();
      renderizarCalendario();
    } else {
      // campoActivo === 'checkout'
      if (fechaIngreso && fecha <= fechaIngreso) {
        // Si toca una fecha anterior, reasignar checkin
        fechaIngreso = fecha;
        checkinInput.value = formatearDisplay(fecha);
        checkinInput.dataset.iso = dateToIso(fecha);
        fechaSalida = null;
        checkoutInput.value = "";
        checkoutInput.dataset.iso = "";
        actualizarInputsActivos();
        renderizarCalendario();
        return;
      }

      fechaSalida = fecha;
      checkoutInput.value = formatearDisplay(fecha);
      checkoutInput.dataset.iso = dateToIso(fecha);

      const noches = calcularNoches(fechaIngreso, fechaSalida);
      stepPill.textContent = `✓ Estadía confirmada`;
      rangeInfo.textContent = `${noches} ${noches === 1 ? 'noche' : 'noches'} (${formatearDisplay(fechaIngreso)} al ${formatearDisplay(fechaSalida)})`;
      renderizarCalendario();

      // Cerrar con suave transición tras confirmación
      setTimeout(() => {
        cerrarCalendario();
      }, 420);
    }
  };

  // Botones de navegación de mes
  prevBtn.addEventListener("click", () => {
    mesVisualizado.setMonth(mesVisualizado.getMonth() - 1);
    renderizarCalendario();
  });

  nextBtn.addEventListener("click", () => {
    mesVisualizado.setMonth(mesVisualizado.getMonth() + 1);
    renderizarCalendario();
  });

  // Limpiar selección
  clearBtn.addEventListener("click", () => {
    fechaIngreso = null;
    fechaSalida = null;
    fechaHover = null;
    checkinInput.value = "";
    checkinInput.dataset.iso = "";
    checkoutInput.value = "";
    checkoutInput.dataset.iso = "";
    campoActivo = "checkin";
    actualizarInputsActivos();
    renderizarCalendario();
  });

  doneBtn.addEventListener("click", cerrarCalendario);
  closeBtn.addEventListener("click", cerrarCalendario);

  // Apertura al interactuar con los campos
  checkinInput.addEventListener("click", () => abrirCalendario("checkin"));
  checkoutInput.addEventListener("click", () => abrirCalendario("checkout"));

  $$(".custom-date-icon").forEach((icon) => {
    icon.addEventListener("click", (e) => {
      const input = e.target.closest(".custom-date-wrap")?.querySelector(".custom-date-input");
      if (input) {
        abrirCalendario(input.id === "wa-checkout" ? "checkout" : "checkin");
      }
    });
  });

  // Cerrar al hacer clic fuera del widget
  document.addEventListener("click", (e) => {
    if (!calModal.hidden && !e.target.closest("#selector-consulta") && !e.target.closest(".botanical-cal")) {
      cerrarCalendario();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !calModal.hidden) {
      cerrarCalendario();
    }
  });

  function generarEnlaceWhatsApp() {
    const checkin = checkinInput ? checkinInput.value.trim() : "";
    const checkout = checkoutInput ? checkoutInput.value.trim() : "";
    const guests = guestsSelect ? guestsSelect.value : "4";

    let mensaje;
    if (checkin && checkout) {
      mensaje = `Hola Ignacio, te escribo desde la web de Cabañas El Jardín. Quería consultar disponibilidad para ingresar el ${checkin} y salir el ${checkout} para ${guests} pasajeros.`;
    } else {
      mensaje = `Hola Ignacio, te escribo desde la web de Cabañas El Jardín. Quería consultar disponibilidad para los departamentos de 2 ambientes para ${guests} pasajeros.`;
    }

    const url = `https://wa.me/5491132618849?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (submitBtn) {
    submitBtn.addEventListener("click", generarEnlaceWhatsApp);
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    generarEnlaceWhatsApp();
  });
}


/* =========================================================================
   10. ANIMACIONES AL HACER SCROLL
   ========================================================================= */

function iniciarAnimaciones() {
  const elementos = $$(".reveal");

  elementos.forEach((el) => {
    const hermanos = Array.from(el.parentElement.children).filter((hijo) => hijo.classList.contains("reveal"));
    const posicion = hermanos.indexOf(el);
    el.style.setProperty("--delay", `${posicion * 40}ms`);
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
   10.5 PRELOADER HERO CON REVELACIÓN EN ARCO (ARC PRELOADER HERO)
   ========================================================================= */

function iniciarArcPreloaderHero() {
  const preloader = $("#arc-preloader");
  if (!preloader) return;

  const path = $("#arc-preloader-path");
  const textEl = $("#arc-preloader-text");
  const textWrap = $("#arc-preloader-text-wrap");
  const skipBtn = $("#arc-preloader-skip");

  const cfg = CONFIG.arcPreloader || {};
  const storageKey = cfg.storageKey || "arc_preloader_seen";

  // Verificar si ya se vio en esta sesión o si el usuario prefiere movimiento reducido
  let yaVisto = false;
  try {
    yaVisto = window.sessionStorage ? window.sessionStorage.getItem(storageKey) === "done" : false;
  } catch (e) {}

  if (prefiereMenosMovimiento || yaVisto) {
    preloader.classList.add("is-done");
    return;
  }

  const saludos = cfg.saludos || [
    "Calma.",
    "Bosque.",
    "Naturaleza.",
    "A pasos del mar.",
    "Cabañas El Jardín."
  ];
  const tiempoPalabra = cfg.tiempoPalabra || 520;
  const duracionArco = cfg.duracionArco || 1200;

  let animando = true;
  let animFrameId = null;
  let timeoutId = null;

  function finalizar(inmediato = false) {
    if (!animando) return;
    animando = false;
    clearTimeout(timeoutId);
    if (animFrameId) cancelAnimationFrame(animFrameId);

    try {
      if (window.sessionStorage) window.sessionStorage.setItem(storageKey, "done");
    } catch (e) {}

    if (inmediato) {
      preloader.classList.add("is-done");
    } else {
      preloader.style.transition = "opacity 0.25s ease-out";
      preloader.style.opacity = "0";
      setTimeout(() => {
        preloader.classList.add("is-done");
      }, 260);
    }
  }

  // Interacción de usuario para saltar en cualquier momento
  if (skipBtn) {
    skipBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      finalizar(true);
    });
  }
  preloader.addEventListener("click", () => {
    finalizar(true);
  });

  // Ciclo secuencial de palabras
  function mostrarPalabra(idx) {
    if (!animando) return;
    if (idx >= saludos.length) {
      iniciarRevelacionArco();
      return;
    }

    if (textEl) {
      textEl.textContent = saludos[idx];
      textEl.className = "arc-preloader__text";
      void textEl.offsetWidth; // reiniciar animación CSS
      textEl.classList.add("is-active");
    }

    const tiempoEspera = idx === saludos.length - 1 ? tiempoPalabra + 220 : tiempoPalabra;

    timeoutId = setTimeout(() => {
      if (!animando) return;
      if (textEl) {
        textEl.classList.remove("is-active");
        textEl.classList.add("is-leaving");
      }

      timeoutId = setTimeout(() => {
        mostrarPalabra(idx + 1);
      }, 150);
    }, tiempoEspera);
  }

  // Animación del arco de cortina hacia arriba
  function iniciarRevelacionArco() {
    if (!animando) return;
    if (textWrap) textWrap.style.opacity = "0";
    if (skipBtn) skipBtn.style.opacity = "0";

    // Easing cúbico suave [0.85, 0, 0.15, 1]
    function easeArc(t) {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    const tInicio = performance.now();

    function frame(ahora) {
      if (!animando) return;
      const transcurrido = ahora - tInicio;
      const t = Math.min(1, Math.max(0, transcurrido / duracionArco));
      const p = easeArc(t);

      // t=0 -> edge=115, control=140 (pantalla totalmente cubierta de verde bosque)
      // t=1 -> edge=-30, control=-5 (telón elevado completamente fuera de la vista superior)
      const edge = 115 - p * 145;
      const control = edge + 25;

      if (path) {
        path.setAttribute("d", `M 0 0 L 100 0 L 100 ${edge.toFixed(2)} Q 50 ${control.toFixed(2)} 0 ${edge.toFixed(2)} Z`);
      }

      if (t < 1) {
        animFrameId = requestAnimationFrame(frame);
      } else {
        finalizar(false);
      }
    }

    animFrameId = requestAnimationFrame(frame);
  }

  // Permitir relanzar manualmente desde la consola si se desea probar
  window.reproducirIntroHero = function() {
    try {
      if (window.sessionStorage) window.sessionStorage.removeItem(storageKey);
    } catch (e) {}
    location.reload();
  };

  // Iniciar primer saludo
  mostrarPalabra(0);
}


/* =========================================================================
   10.6 RESEÑAS: CARD STACK 3D EN ABANICO
   ========================================================================= */

function iniciarReviewsCardStack() {
  const container = $("#reviews-card-stack");
  if (!container) return;

  const stage = $("#reviews-stack-stage");
  const track = $("#reviews-stack-track");
  const cards = Array.from(track ? track.querySelectorAll(".review-card--stack") : []);
  const prevBtn = $("#reviews-stack-prev");
  const nextBtn = $("#reviews-stack-next");
  const dotsContainer = $("#reviews-stack-dots");

  if (!cards.length) return;

  const total = cards.length;
  let active = 0;
  let autoTimer = null;
  let isHovering = false;

  function calcularGeometria() {
    const isMobile = window.innerWidth <= 640;
    const cardWidth = isMobile ? Math.min(380, window.innerWidth - 40) : 500;
    const overlap = isMobile ? 0.65 : 0.48;
    const spreadDeg = isMobile ? 24 : 42;
    const depthPx = isMobile ? 80 : 120;
    const maxVisible = 5;
    const maxOffset = Math.floor(maxVisible / 2);
    const cardSpacing = Math.round(cardWidth * (1 - overlap));
    const stepDeg = maxOffset > 0 ? spreadDeg / maxOffset : 0;
    const tiltXDeg = isMobile ? 6 : 10;
    const activeScale = 1.02;
    const inactiveScale = isMobile ? 0.94 : 0.92;
    const activeLiftPx = isMobile ? 12 : 20;

    return { cardSpacing, stepDeg, depthPx, tiltXDeg, activeScale, inactiveScale, activeLiftPx, maxOffset };
  }

  function signedOffset(i, act, len) {
    const raw = i - act;
    if (len <= 1) return raw;
    const alt = raw > 0 ? raw - len : raw + len;
    return Math.abs(alt) < Math.abs(raw) ? alt : raw;
  }

  // Generar botones de puntos (dots)
  if (dotsContainer) {
    dotsContainer.innerHTML = "";
    cards.forEach((_, idx) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `reviews-card-stack__dot${idx === 0 ? " is-active" : ""}`;
      dot.setAttribute("aria-label", `Ver reseña ${idx + 1}`);
      dot.addEventListener("click", () => irA(idx));
      dotsContainer.appendChild(dot);
    });
  }

  function actualizarPosiciones() {
    const geo = calcularGeometria();

    cards.forEach((card, i) => {
      const off = signedOffset(i, active, total);
      const abs = Math.abs(off);
      const visible = abs <= geo.maxOffset;

      if (!visible) {
        card.style.opacity = "0";
        card.style.pointerEvents = "none";
        card.style.transform = `translate3d(calc(-50% + ${off * 200}px), 60px, -400px) scale(0.8)`;
        card.classList.remove("is-active");
        return;
      }

      card.style.pointerEvents = "auto";
      const isActive = off === 0;

      const rotateZ = off * geo.stepDeg;
      const x = off * geo.cardSpacing;
      const y = abs * 8;
      const z = -abs * geo.depthPx;
      const scale = isActive ? geo.activeScale : geo.inactiveScale;
      const lift = isActive ? -geo.activeLiftPx : 0;
      const rotateX = isActive ? 0 : geo.tiltXDeg;
      const zIndex = 100 - abs;

      card.style.zIndex = zIndex;
      card.style.opacity = "1";
      card.style.transform = `translate3d(calc(-50% + ${x}px), ${y + lift}px, ${z}px) rotateZ(${rotateZ}deg) rotateX(${rotateX}deg) scale(${scale})`;

      card.classList.toggle("is-active", isActive);
    });

    if (dotsContainer) {
      const dots = Array.from(dotsContainer.querySelectorAll(".reviews-card-stack__dot"));
      dots.forEach((dot, idx) => {
        dot.classList.toggle("is-active", idx === active);
      });
    }
  }

  function irA(idx) {
    active = ((idx % total) + total) % total;
    actualizarPosiciones();
    reiniciarAutoplay();
  }

  function siguiente() {
    irA(active + 1);
  }

  function anterior() {
    irA(active - 1);
  }

  if (prevBtn) prevBtn.addEventListener("click", anterior);
  if (nextBtn) nextBtn.addEventListener("click", siguiente);

  cards.forEach((card, idx) => {
    card.addEventListener("click", () => {
      if (active !== idx) irA(idx);
    });
  });

  if (stage) {
    stage.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        anterior();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        siguiente();
      }
    });

    // Soporte de arrastre táctil y ratón
    let startX = 0;
    let isDragging = false;

    function onTouchStart(e) {
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      isDragging = true;
    }

    function onTouchEnd(e) {
      if (!isDragging) return;
      isDragging = false;
      const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const diff = endX - startX;
      if (diff > 45) anterior();
      else if (diff < -45) siguiente();
    }

    stage.addEventListener("touchstart", onTouchStart, { passive: true });
    stage.addEventListener("touchend", onTouchEnd, { passive: true });
    stage.addEventListener("mousedown", onTouchStart);
    stage.addEventListener("mouseup", onTouchEnd);
  }

  function reiniciarAutoplay() {
    clearInterval(autoTimer);
    if (prefiereMenosMovimiento || isHovering) return;
    autoTimer = setInterval(siguiente, 3800);
  }

  container.addEventListener("mouseenter", () => {
    isHovering = true;
    clearInterval(autoTimer);
  });

  container.addEventListener("mouseleave", () => {
    isHovering = false;
    reiniciarAutoplay();
  });

  window.addEventListener("resize", () => {
    actualizarPosiciones();
  });

  actualizarPosiciones();
  reiniciarAutoplay();
}


/* =========================================================================
   10. TARJETAS 3D INTERACTIVAS (TILT & PARALLAX CON CURSOR)
   ========================================================================= */

function iniciarTarjetas3D() {
  if (prefiereMenosMovimiento) return;
  // Solo activar si el dispositivo cuenta con puntero preciso / mouse
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  /* 1. Elementos de Sobre Nosotros: cada uno con física 3D 100% independiente */
  const aboutMedia = $(".about__media");
  if (aboutMedia) {
    const imgMain = $(".about__img--main", aboutMedia);
    const imgSecondary = $(".about__img--secondary", aboutMedia);
    const badge = $(".about__badge", aboutMedia);

    function aplicarFisicaElemento(el, conf) {
      if (!el) return;

      let rafId = null;
      let targetRotX = 0, targetRotY = 0, targetShiftX = 0, targetShiftY = 0;
      let currentRotX = 0, currentRotY = 0, currentShiftX = 0, currentShiftY = 0;
      let estaEncima = false;

      const animar = () => {
        const factor = conf.factor || 0.12;
        currentRotX += (targetRotX - currentRotX) * factor;
        currentRotY += (targetRotY - currentRotY) * factor;
        currentShiftX += (targetShiftX - currentShiftX) * factor;
        currentShiftY += (targetShiftY - currentShiftY) * factor;

        el.style.transform = `perspective(${conf.perspective || 1000}px) rotateX(${currentRotX}deg) rotateY(${currentRotY}deg) translate3d(${currentShiftX}px, ${currentShiftY}px, ${conf.translateZ || 0}px)`;

        if (conf.conSombra) {
          el.style.boxShadow = `${-currentShiftX * conf.sombraX}px ${-currentShiftY * conf.sombraY + conf.baseSombraY}px ${conf.sombraBlur}px ${conf.colorSombra}`;
        }

        const diff = Math.abs(targetRotX - currentRotX) + Math.abs(targetRotY - currentRotY) + Math.abs(targetShiftX - currentShiftX);
        if (estaEncima || diff > 0.04) {
          rafId = requestAnimationFrame(animar);
        } else {
          rafId = null;
          el.style.transform = "";
          if (conf.conSombra) el.style.boxShadow = "";
        }
      };

      el.addEventListener("mousemove", (e) => {
        e.stopPropagation();
        const rect = el.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;

        targetRotX = -ny * conf.maxRotX;
        targetRotY = nx * conf.maxRotY;
        targetShiftX = nx * conf.maxShiftX;
        targetShiftY = ny * conf.maxShiftY;

        estaEncima = true;
        if (!rafId) {
          rafId = requestAnimationFrame(animar);
        }
      });

      el.addEventListener("mouseleave", (e) => {
        e.stopPropagation();
        targetRotX = 0;
        targetRotY = 0;
        targetShiftX = 0;
        targetShiftY = 0;
        estaEncima = false;
        if (!rafId) {
          rafId = requestAnimationFrame(animar);
        }
      });
    }

    // Foto de atrás: se mueve únicamente cuando el cursor pasa sobre ella
    aplicarFisicaElemento(imgMain, {
      maxRotX: 14,
      maxRotY: 16,
      maxShiftX: 24,
      maxShiftY: 18,
      perspective: 1100,
      translateZ: 0,
      factor: 0.10,
      conSombra: true,
      sombraX: 0.45,
      sombraY: 0.45,
      baseSombraY: 16,
      sombraBlur: 36,
      colorSombra: "rgba(36, 64, 51, 0.14)"
    });

    // Foto de adelante: se mueve únicamente cuando el cursor pasa sobre ella
    aplicarFisicaElemento(imgSecondary, {
      maxRotX: 16,
      maxRotY: 20,
      maxShiftX: 32,
      maxShiftY: 24,
      perspective: 1000,
      translateZ: 35,
      factor: 0.12,
      conSombra: true,
      sombraX: 0.6,
      sombraY: 0.6,
      baseSombraY: 22,
      sombraBlur: 48,
      colorSombra: "rgba(36, 64, 51, 0.22)"
    });

    // Badge "4 Departamentos": se mueve únicamente cuando el cursor pasa sobre él
    aplicarFisicaElemento(badge, {
      maxRotX: 16,
      maxRotY: 22,
      maxShiftX: 28,
      maxShiftY: 20,
      perspective: 900,
      translateZ: 45,
      factor: 0.14,
      conSombra: true,
      sombraX: 0.5,
      sombraY: 0.5,
      baseSombraY: 15,
      sombraBlur: 32,
      colorSombra: "rgba(36, 64, 51, 0.16)"
    });
  }

  /* 2. Tarjetas interactivas (.amenity-card, .dept-hour-card) */
  const tarjetas = $$(".amenity-card, .dept-hour-card");
  tarjetas.forEach((tarjeta) => {
    let tarjetaRaf = null;
    let tRotX = 0, tRotY = 0, tShiftX = 0, tShiftY = 0;
    let cRotX = 0, cRotY = 0, cShiftX = 0, cShiftY = 0;
    let activa = false;

    const animarTarjeta = () => {
      const f = 0.14;
      cRotX += (tRotX - cRotX) * f;
      cRotY += (tRotY - cRotY) * f;
      cShiftX += (tShiftX - cShiftX) * f;
      cShiftY += (tShiftY - cShiftY) * f;

      tarjeta.style.transform = `perspective(900px) rotateX(${cRotX}deg) rotateY(${cRotY}deg) translate3d(${cShiftX}px, ${cShiftY}px, 12px)`;
      tarjeta.style.boxShadow = `${-cShiftX * 0.8}px ${-cShiftY * 0.8 + 14}px 30px rgba(36, 64, 51, 0.10)`;

      const icon = tarjeta.querySelector(".amenity-card__icon-wrap, .dept-hour-icon");
      if (icon) {
        icon.style.transform = `translate3d(${cShiftX * 0.5}px, ${cShiftY * 0.5}px, 20px)`;
      }

      const d = Math.abs(tRotX - cRotX) + Math.abs(tRotY - cRotY);
      if (activa || d > 0.05) {
        tarjetaRaf = requestAnimationFrame(animarTarjeta);
      } else {
        tarjetaRaf = null;
        tarjeta.style.transform = "";
        tarjeta.style.boxShadow = "";
        if (icon) icon.style.transform = "";
      }
    };

    tarjeta.addEventListener("mousemove", (e) => {
      const rect = tarjeta.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;

      tRotX = -ny * 12;
      tRotY = nx * 14;
      tShiftX = nx * 14; // Movimiento lateral según cursor
      tShiftY = ny * 10;

      activa = true;
      if (!tarjetaRaf) {
        tarjetaRaf = requestAnimationFrame(animarTarjeta);
      }
    });

    tarjeta.addEventListener("mouseleave", () => {
      tRotX = 0;
      tRotY = 0;
      tShiftX = 0;
      tShiftY = 0;
      activa = false;
      if (!tarjetaRaf) {
        tarjetaRaf = requestAnimationFrame(animarTarjeta);
      }
    });
  });
}


/* =========================================================================
   10.7 MOVIMIENTO Y PARALLAX INTERACTIVO DEL HERO
   ========================================================================= */

function iniciarMovimientoHero() {
  const hero = $("#inicio");
  if (!hero || prefiereMenosMovimiento) return;

  const media = $(".hero__media", hero);
  const content = $(".hero__content", hero);
  const ribbon = $(".hero__context-ribbon", hero);

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let animId = null;
  let ratonSobreHero = false;

  const animarParallax = () => {
    const f = 0.055;
    currentX += (targetX - currentX) * f;
    currentY += (targetY - currentY) * f;

    // Desplazamiento sutil opuesto en la capa de fondo
    if (media) {
      media.style.transform = `translate3d(${-currentX * 22}px, ${-currentY * 16}px, 0)`;
    }

    // Desplazamiento y perspectiva tridimensional en el contenido principal
    if (content) {
      const scrollY = window.scrollY;
      const translateY = scrollY > 0 ? scrollY * 0.26 + currentY * 12 : currentY * 12;
      content.style.transform = `perspective(1100px) rotateX(${-currentY * 4.5}deg) rotateY(${currentX * 5.5}deg) translate3d(${currentX * 14}px, ${translateY}px, 0)`;
    }

    // El ribbon tiene una capa adicional flotante de profundidad
    if (ribbon) {
      ribbon.style.transform = `translate3d(${currentX * 8}px, ${currentY * 6}px, 20px)`;
    }

    const diff = Math.abs(targetX - currentX) + Math.abs(targetY - currentY);
    if (ratonSobreHero || diff > 0.001) {
      animId = requestAnimationFrame(animarParallax);
    } else {
      animId = null;
      if (media) media.style.transform = "";
      if (ribbon) ribbon.style.transform = "";
      if (content && window.scrollY === 0) content.style.transform = "";
    }
  };

  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    targetX = (e.clientX - rect.left) / rect.width - 0.5;
    targetY = (e.clientY - rect.top) / rect.height - 0.5;
    ratonSobreHero = true;
    if (!animId) {
      animId = requestAnimationFrame(animarParallax);
    }
  }, { passive: true });

  hero.addEventListener("mouseleave", () => {
    targetX = 0;
    targetY = 0;
    ratonSobreHero = false;
    if (!animId) {
      animId = requestAnimationFrame(animarParallax);
    }
  });

  // Parallax y desvanecimiento suave con el scroll mientras el telón (about) sube
  let pendienteScroll = false;
  const alHacerScrollHero = () => {
    pendienteScroll = false;
    const scrollY = window.scrollY;
    const heroH = hero.offsetHeight || window.innerHeight;
    if (scrollY <= heroH + 60) {
      const progreso = Math.min(1, Math.max(0, scrollY / (heroH * 0.85)));
      if (content) {
        content.style.opacity = String(Math.max(0, 1 - progreso * 1.35));
        if (!ratonSobreHero) {
          content.style.transform = `translate3d(0, ${scrollY * 0.26}px, 0)`;
        }
      }
    } else if (content) {
      content.style.opacity = "0";
    }
  };

  window.addEventListener("scroll", () => {
    if (!pendienteScroll) {
      pendienteScroll = true;
      requestAnimationFrame(alHacerScrollHero);
    }
  }, { passive: true });
}


/* =========================================================================
   11. INICIO
   ========================================================================= */

iniciarArcPreloaderHero();
iniciarRespaldos();
aplicarDatosGenerales();
iniciarNavegacion();
iniciarCabanas();
iniciarGaleria();
iniciarSelectorConsulta();
iniciarReviewsCardStack();
iniciarTarjetas3D();
iniciarMovimientoHero();
iniciarAnimaciones();
