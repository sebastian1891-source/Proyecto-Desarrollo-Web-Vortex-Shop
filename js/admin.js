// =========================================================
// ADMINISTRACIÓN (admin.html)
// ---------------------------------------------------------
// Página protegida: solo la ven usuarios con rol "administrador".
// Un cliente que escriba admin.html en la barra de direcciones es
// redirigido al inicio con un aviso (ver exigirAdministrador en roles.js).
// El panel completo (alta, edición y baja de productos, stock
// y pedidos) se desarrollará en las próximas entregas.
// =========================================================

import { exigirAdministrador } from "./firebase/roles.js";
import { escaparHtml } from "./mensajes.js";

const contenedor = document.querySelector("#admin-container");

function mostrarPanel(usuario) {
    const nombre = usuario.displayName?.split(" ")[0] ?? usuario.email;

    contenedor.innerHTML = `
        <section class="locked-module">
            <div class="locked-icon">🛠️</div>
            <span class="badge rounded-pill text-bg-success mb-2">Rol: administrador</span>
            <h1>Panel administrativo</h1>
            <p class="lead">Hola, ${escaparHtml(nombre)}. Accediste con permisos de administrador.</p>

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

const usuario = await exigirAdministrador("admin.html");
if (usuario) mostrarPanel(usuario);
