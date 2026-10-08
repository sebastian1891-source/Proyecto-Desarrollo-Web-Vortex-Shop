// =========================================================
// NAVBAR SEGÚN EL ESTADO DE LA SESIÓN
// ---------------------------------------------------------
// Se carga en todas las páginas. Cuando Firebase informa si hay
// un usuario logueado (también al recargar), actualiza el navbar:
//   - Sin sesión: botones "Ingresar" y "Crear cuenta".
//   - Con sesión: saludo con el nombre, "Mi perfil" y "Cerrar sesión".
// =========================================================

import { observarSesion, cerrarSesion } from "./firebase/auth.js";
import { mostrarAviso, mostrarMensajePendiente, guardarMensajePendiente, escaparHtml } from "./mensajes.js";

const contenedorSesion = document.querySelector("#navbar-sesion");

function obtenerNombreCorto(usuario) {
    if (usuario.displayName) return usuario.displayName.split(" ")[0];
    return usuario.email.split("@")[0];
}

function dibujarSinSesion() {
    contenedorSesion.innerHTML = `
        <a class="btn btn-outline-light btn-sm" href="login.html">Ingresar</a>
        <a class="btn btn-primary btn-sm" href="registro.html">Crear cuenta</a>
    `;
}

function dibujarConSesion(usuario) {
    contenedorSesion.innerHTML = `
        <a class="navbar-saludo" href="perfil.html" title="Ir a mi perfil">
            <span class="avatar-mini">${escaparHtml(obtenerNombreCorto(usuario).charAt(0).toUpperCase())}</span>
            Hola, <strong>${escaparHtml(obtenerNombreCorto(usuario))}</strong>
        </a>
        <button class="btn btn-outline-light btn-sm" id="btnCerrarSesion">Cerrar sesión</button>
    `;

    contenedorSesion.querySelector("#btnCerrarSesion").addEventListener("click", async () => {
        try {
            await cerrarSesion();

            // En páginas privadas (body con data-protegida) se vuelve al inicio
            if (document.body.hasAttribute("data-protegida")) {
                guardarMensajePendiente("Cerraste sesión correctamente.");
                window.location.href = "index.html";
            } else {
                mostrarAviso("Cerraste sesión correctamente.");
            }
        } catch (error) {
            console.error(error);
            mostrarAviso("No se pudo cerrar la sesión. Intentá de nuevo.");
        }
    });
}

observarSesion(usuario => {
    // Elementos del menú que solo se ven con sesión iniciada (ej: "Mi perfil")
    document.querySelectorAll("[data-requiere-sesion]").forEach(el =>
        el.classList.toggle("d-none", !usuario)
    );

    if (!contenedorSesion) return;

    if (usuario) {
        dibujarConSesion(usuario);
    } else {
        dibujarSinSesion();
    }
});

// Mensaje que quedó guardado antes de una redirección (login, registro, logout)
mostrarMensajePendiente();