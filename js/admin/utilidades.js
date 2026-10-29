// =========================================================
// PANEL · PIEZAS COMPARTIDAS ENTRE PESTAÑAS
// =========================================================

import { escaparHtml } from "../mensajes.js";

export function formatearFecha(timestamp, conHora = false) {
    if (!timestamp?.toDate) return "—";
    return timestamp.toDate().toLocaleString("es-UY", conHora
        ? { dateStyle: "medium", timeStyle: "short" }
        : { dateStyle: "medium" });
}

export function dibujarEstrellas(cantidad) {
    const n = Math.max(0, Math.min(5, Math.round(Number(cantidad) || 0)));
    return `<span class="estrellas-admin" aria-label="${n} de 5 estrellas">${"★".repeat(n)}<span class="estrellas-vacias">${"★".repeat(5 - n)}</span></span>`;
}

export function mensajeCargando(texto) {
    return `
        <div class="text-center py-4 text-secondary">
            <div class="spinner-border spinner-border-sm me-2" aria-hidden="true"></div>${escaparHtml(texto)}
        </div>
    `;
}

// Bloque de error con botón "Reintentar"
export function mostrarErrorCarga(elemento, mensaje, alReintentar) {
    elemento.innerHTML = `
        <div class="alert alert-danger mb-0">
            ${escaparHtml(mensaje)}
            <button type="button" class="btn btn-sm btn-outline-danger ms-2">Reintentar</button>
        </div>
    `;
    elemento.querySelector("button").addEventListener("click", alReintentar);
}

export function mensajeErrorFirestore(error, porDefecto) {
    switch (error?.code) {
        case "permission-denied":
            return "No tenés permiso para esta acción. Verificá que tu cuenta tenga el rol administrador y que las reglas de Firestore estén publicadas.";
        case "unavailable":
        case "deadline-exceeded":
            return "No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.";
        default:
            return error?.name === "ErrorCompra" ? error.message : porDefecto;
    }
}

// Texto normalizado para búsquedas (sin mayúsculas ni tildes)
export function normalizar(texto) {
    return String(texto ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
