// =========================================================
// MENSAJES AL USUARIO
// ---------------------------------------------------------
// Toast reutilizable para los módulos de autenticación y un
// "mensaje pendiente" que sobrevive a una redirección
// (ej: "Cerraste sesión" se muestra en la página a la que se llega).
// =========================================================

const CLAVE_MENSAJE_PENDIENTE = "vortexMensajePendiente";

export function mostrarAviso(mensaje) {
    const toastEl = document.querySelector("#appToast");
    const toastBody = document.querySelector("#toastMessage");
    if (!toastEl || !toastBody || !window.bootstrap) return;

    toastBody.textContent = mensaje;
    bootstrap.Toast.getOrCreateInstance(toastEl).show();
}

export function guardarMensajePendiente(mensaje) {
    sessionStorage.setItem(CLAVE_MENSAJE_PENDIENTE, mensaje);
}

export function mostrarMensajePendiente() {
    const mensaje = sessionStorage.getItem(CLAVE_MENSAJE_PENDIENTE);
    if (!mensaje) return;

    sessionStorage.removeItem(CLAVE_MENSAJE_PENDIENTE);
    mostrarAviso(mensaje);
}

// Escapa texto ingresado por usuarios antes de insertarlo con innerHTML
export function escaparHtml(texto) {
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
}