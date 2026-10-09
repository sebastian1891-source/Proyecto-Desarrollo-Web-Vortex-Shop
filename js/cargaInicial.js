// =========================================================
// CARGA INICIAL DE PRODUCTOS (carga-inicial.html)
// ---------------------------------------------------------
// Sube el arreglo local (js/data/productosIniciales.js) a la
// colección "productos" de Firestore. Solo un usuario con
// rol "admin" puede hacerlo (lo controlan las reglas de Firestore).
// Si un producto ya existe con el mismo id, se sobrescribe.
// =========================================================

import { obtenerUsuarioActual, obtenerDatosUsuario } from "./firebase/auth.js";
import { obtenerProductos, guardarProductos, mensajeErrorProductos } from "./firebase/productos.js";
import { productosIniciales } from "./data/productosIniciales.js";
import { guardarMensajePendiente, escaparHtml, mostrarAviso } from "./mensajes.js";
import { formatearPrecio } from "./productosUI.js";

const contenedor = document.querySelector("#carga-container");

function mostrarSinPermiso() {
    contenedor.innerHTML = `
        <section class="locked-module">
            <div class="locked-icon">🛡️</div>
            <h1>Acceso solo para administradores</h1>
            <p class="lead">Tu cuenta no tiene el rol <strong>admin</strong>, necesario para cargar productos.</p>
            <a href="index.html" class="btn btn-outline-primary mt-3">Volver al inicio</a>
        </section>
    `;
}

async function mostrarPanel() {
    let cantidadEnFirestore = "—";
    try {
        cantidadEnFirestore = (await obtenerProductos()).length;
    } catch (error) {
        console.error(error);
    }

    contenedor.innerHTML = `
        <div class="section-heading mb-4">
            <div>
                <span class="eyebrow">Administración</span>
                <h1 class="fw-bold">Carga inicial de productos</h1>
            </div>
        </div>

        <div class="auth-card">
            <p>
                Productos en el arreglo local: <strong>${productosIniciales.length}</strong> ·
                Productos en Firestore: <strong id="cantidadFirestore">${cantidadEnFirestore}</strong>
            </p>

            <div class="table-responsive">
                <table class="table align-middle mb-4">
                    <thead>
                        <tr><th>ID</th><th>Nombre</th><th>Categoría</th><th class="text-end">Precio</th><th class="text-end">Stock</th></tr>
                    </thead>
                    <tbody>
                        ${productosIniciales.map(p => `
                            <tr>
                                <td><code>${escaparHtml(p.id)}</code></td>
                                <td>${escaparHtml(p.nombre)}</td>
                                <td>${escaparHtml(p.categoria)}</td>
                                <td class="text-end">${formatearPrecio(p.precio)}</td>
                                <td class="text-end">${p.stock}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>

            <div id="alertaFormulario" class="alert d-none" role="alert"></div>

            <button class="btn btn-primary" id="btnCargarProductos">Cargar productos en Firestore</button>
            <p class="text-secondary small mt-2 mb-0">
                Si ya existen productos con el mismo ID, se reemplazan por los datos del arreglo local.
            </p>
        </div>
    `;

    const boton = contenedor.querySelector("#btnCargarProductos");
    const alerta = contenedor.querySelector("#alertaFormulario");

    boton.addEventListener("click", async () => {
        boton.disabled = true;
        boton.innerHTML = `<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Cargando...`;

        try {
            await guardarProductos(productosIniciales);
            const cantidad = (await obtenerProductos()).length;
            contenedor.querySelector("#cantidadFirestore").textContent = cantidad;

            alerta.className = "alert alert-success";
            alerta.innerHTML = `Se cargaron ${productosIniciales.length} productos correctamente. <a href="catalogo.html">Ver el catálogo</a>`;
            mostrarAviso("Productos cargados en Firestore.");
        } catch (error) {
            console.error(error);
            alerta.className = "alert alert-danger";
            alerta.textContent = mensajeErrorProductos(error);
        } finally {
            boton.disabled = false;
            boton.textContent = "Cargar productos en Firestore";
        }
    });
}

const usuario = await obtenerUsuarioActual();

if (!usuario) {
    guardarMensajePendiente("Iniciá sesión con una cuenta de administrador.");
    window.location.replace("login.html?redirect=carga-inicial.html");
} else {
    try {
        const datos = await obtenerDatosUsuario(usuario.uid);
        if (datos?.rol === "admin") {
            await mostrarPanel();
        } else {
            mostrarSinPermiso();
        }
    } catch (error) {
        console.error(error);
        mostrarSinPermiso();
    }
}
