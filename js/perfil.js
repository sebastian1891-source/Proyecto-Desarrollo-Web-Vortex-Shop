// =========================================================
// PERFIL (página protegida)
// ---------------------------------------------------------
// 1. Espera a que Firebase recupere la sesión.
// 2. Si no hay usuario, redirige a login.html?redirect=perfil.html.
// 3. Si hay usuario, lee su documento usuarios/{uid} en Firestore
//    y muestra sus datos.
// =========================================================

import { obtenerUsuarioActual, obtenerDatosUsuario } from "./firebase/auth.js";
import { guardarMensajePendiente, escaparHtml } from "./mensajes.js";

const contenedor = document.querySelector("#perfil-container");

function formatearFecha(timestamp) {
    if (!timestamp?.toDate) return "—";
    return timestamp.toDate().toLocaleDateString("es-UY", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function crearFilaDato(etiqueta, valor) {
    return `
        <div class="perfil-dato">
            <span>${etiqueta}</span>
            <strong>${escaparHtml(valor)}</strong>
        </div>
    `;
}

function renderizarPerfil(usuario, datos) {
    // Si el documento no existe (ej: usuario creado a mano en la consola)
    // se usan los datos básicos de Authentication.
    const nombre = datos?.nombre ?? usuario.displayName?.split(" ")[0] ?? "";
    const apellido = datos?.apellido ?? usuario.displayName?.split(" ").slice(1).join(" ") ?? "";
    const nombreCompleto = `${nombre} ${apellido}`.trim() || usuario.email;
    const inicial = (nombre || usuario.email).charAt(0).toUpperCase();

    contenedor.innerHTML = `
        <div class="section-heading mb-4">
            <div>
                <span class="eyebrow">Mi cuenta</span>
                <h1 class="fw-bold">Mi perfil</h1>
            </div>
        </div>

        <div class="row g-4">
            <div class="col-lg-4">
                <div class="auth-card text-center h-100">
                    <div class="avatar-grande">${escaparHtml(inicial)}</div>
                    <h2 class="h5 fw-bold mb-1">${escaparHtml(nombreCompleto)}</h2>
                    <p class="text-secondary small mb-3">${escaparHtml(usuario.email)}</p>
                    <span class="badge rounded-pill badge-hero text-capitalize">${escaparHtml(datos?.rol ?? "cliente")}</span>
                </div>
            </div>

            <div class="col-lg-8">
                <div class="auth-card h-100">
                    <h2 class="h5 fw-bold mb-3">Datos de la cuenta</h2>
                    ${crearFilaDato("Nombre", nombre || "—")}
                    ${crearFilaDato("Apellido", apellido || "—")}
                    ${crearFilaDato("Correo electrónico", usuario.email)}
                    ${crearFilaDato("Miembro desde", formatearFecha(datos?.fechaRegistro))}
                    ${datos ? "" : `<p class="text-warning small mt-3 mb-0">No se encontraron datos adicionales de esta cuenta en Firestore.</p>`}
                </div>
            </div>

            <div class="col-12">
                <div class="locked-card mt-0">
                    <h2 class="h5">Historial de pedidos</h2>
                    <p class="mb-0">Todavía no hay pedidos registrados. Esta sección se completará cuando se implemente el checkout.</p>
                </div>
            </div>
        </div>
    `;
}

function renderizarError() {
    contenedor.innerHTML = `
        <section class="locked-module">
            <div class="locked-icon">⚠️</div>
            <h1>No pudimos cargar tu perfil</h1>
            <p class="lead">Revisá tu conexión e intentá de nuevo.</p>
            <button class="btn btn-primary mt-3" onclick="location.reload()">Reintentar</button>
        </section>
    `;
}

const usuario = await obtenerUsuarioActual();

if (!usuario) {
    // Página protegida: sin sesión se manda al login y luego se vuelve acá
    guardarMensajePendiente("Iniciá sesión para ver tu perfil.");
    window.location.replace("login.html?redirect=perfil.html");
} else {
    try {
        const datos = await obtenerDatosUsuario(usuario.uid);
        renderizarPerfil(usuario, datos);
    } catch (error) {
        console.error(error);
        // Si Firestore falla (reglas o conexión) igual se muestran los datos de Authentication
        if (error.code === "permission-denied") {
            renderizarPerfil(usuario, null);
        } else {
            renderizarError();
        }
    }
}