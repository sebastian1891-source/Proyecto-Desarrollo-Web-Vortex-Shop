// =========================================================
// ADMINISTRACIÓN (admin.html)
// ---------------------------------------------------------
// Página protegida: solo la ven usuarios con rol "admin".
// El panel completo (alta, edición y baja de productos, stock
// y pedidos) se desarrollará en las próximas entregas.
// =========================================================

import { obtenerUsuarioActual, obtenerDatosUsuario } from "./firebase/auth.js";
import { guardarMensajePendiente } from "./mensajes.js";

const contenedor = document.querySelector("#admin-container");

function mostrarSinPermiso() {
    contenedor.innerHTML = `
        <section class="locked-module">
            <div class="locked-icon">🛡️</div>
            <h1>Acceso solo para administradores</h1>
            <p class="lead">Tu cuenta no tiene permisos para ver esta sección.</p>
            <a href="index.html" class="btn btn-outline-primary mt-3">Volver al inicio</a>
        </section>
    `;
}

function mostrarEnDesarrollo() {
    contenedor.innerHTML = `
        <section class="locked-module">
            <div class="locked-icon">🛠️</div>
            <span class="badge rounded-pill text-bg-warning mb-3">Próximamente</span>
            <h1>Panel administrativo</h1>
            <p class="lead">Sección en desarrollo para próximas entregas.</p>

            <div class="locked-card">
                <h2 class="h5">Funcionalidades previstas</h2>
                <ul>
                    <li>Alta de productos</li>
                    <li>Edición de productos</li>
                    <li>Eliminación o baja</li>
                    <li>Stock y disponibilidad</li>
                    <li>Consulta de pedidos</li>
                </ul>
            </div>

            <div class="d-flex gap-2 justify-content-center flex-wrap mt-3">
                <a class="btn btn-primary" href="carga-inicial.html">Carga inicial de productos</a>
                <a class="btn btn-outline-primary" href="index.html">Volver al inicio</a>
            </div>
        </section>
    `;
}

const usuario = await obtenerUsuarioActual();

if (!usuario) {
    guardarMensajePendiente("Iniciá sesión con una cuenta de administrador.");
    window.location.replace("login.html?redirect=admin.html");
} else {
    try {
        const datos = await obtenerDatosUsuario(usuario.uid);
        if (datos?.rol === "admin") {
            mostrarEnDesarrollo();
        } else {
            mostrarSinPermiso();
        }
    } catch (error) {
        console.error(error);
        mostrarSinPermiso();
    }
}
