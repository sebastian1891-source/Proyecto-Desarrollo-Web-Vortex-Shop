// =========================================================
// CARGA INICIAL DE PRODUCTOS (carga-inicial.html)
// ---------------------------------------------------------
// Sube el arreglo local (js/data/productosIniciales.js) a la
// colección "productos" de Firestore. Solo un usuario con
// rol "administrador" puede hacerlo (lo controlan las reglas de Firestore).
// Solo se suben los productos que TODAVÍA NO están en Firestore:
// los que ya existen no se tocan (así no se pierde el stock
// descontado por las compras ni los cambios hechos en la consola).
// =========================================================

import { exigirAdministrador } from "./firebase/roles.js";
import { obtenerProductos, guardarProductos, mensajeErrorProductos } from "./firebase/productos.js";
import { productosIniciales } from "./data/productosIniciales.js";
import { escaparHtml, mostrarAviso } from "./mensajes.js";
import { formatearPrecio } from "./productosUI.js";

const contenedor = document.querySelector("#carga-container");

async function mostrarPanel() {
    let idsEnFirestore;
    try {
        idsEnFirestore = new Set((await obtenerProductos()).map(p => p.id));
    } catch (error) {
        console.error(error);
        contenedor.innerHTML = `
            <section class="locked-module">
                <div class="locked-icon">⚠️</div>
                <h1>No se pudo consultar Firestore</h1>
                <p class="lead">${escaparHtml(mensajeErrorProductos(error))}</p>
                <button class="btn btn-primary mt-3" onclick="location.reload()">Reintentar</button>
            </section>
        `;
        return;
    }

    const faltantes = productosIniciales.filter(p => !idsEnFirestore.has(p.id));

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
                Productos en Firestore: <strong>${idsEnFirestore.size}</strong> ·
                Para cargar: <strong>${faltantes.length}</strong>
            </p>

            <div class="table-responsive">
                <table class="table align-middle mb-4">
                    <thead>
                        <tr><th>ID</th><th>Nombre</th><th>Categoría</th><th class="text-end">Precio</th><th class="text-end">Stock</th><th>Estado</th></tr>
                    </thead>
                    <tbody>
                        ${productosIniciales.map(p => `
                            <tr>
                                <td><code>${escaparHtml(p.id)}</code></td>
                                <td>${escaparHtml(p.nombre)}</td>
                                <td>${escaparHtml(p.categoria)}</td>
                                <td class="text-end">${formatearPrecio(p.precio)}</td>
                                <td class="text-end">${p.stock}</td>
                                <td>${idsEnFirestore.has(p.id)
                                    ? `<span class="badge text-bg-light border">Ya cargado</span>`
                                    : `<span class="badge text-bg-primary">Nuevo</span>`}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>

            <div id="alertaFormulario" class="alert d-none" role="alert"></div>

            <button class="btn btn-primary" id="btnCargarProductos" ${faltantes.length ? "" : "disabled"}>
                ${faltantes.length ? `Cargar ${faltantes.length} productos nuevos` : "No hay productos nuevos para cargar"}
            </button>
            <p class="text-secondary small mt-2 mb-0">
                Los productos que ya están en Firestore no se modifican (se conserva su stock actual).
            </p>
        </div>
    `;

    const boton = contenedor.querySelector("#btnCargarProductos");
    const alerta = contenedor.querySelector("#alertaFormulario");

    boton.addEventListener("click", async () => {
        boton.disabled = true;
        boton.innerHTML = `<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Cargando...`;

        try {
            await guardarProductos(faltantes);
            mostrarAviso(`Se cargaron ${faltantes.length} productos en Firestore.`);
            await mostrarPanel();

            const alertaNueva = contenedor.querySelector("#alertaFormulario");
            alertaNueva.className = "alert alert-success";
            alertaNueva.innerHTML = `Se cargaron ${faltantes.length} productos correctamente. <a href="catalogo.html">Ver el catálogo</a>`;
        } catch (error) {
            console.error(error);
            alerta.className = "alert alert-danger";
            alerta.textContent = mensajeErrorProductos(error);
            boton.disabled = false;
            boton.textContent = `Cargar ${faltantes.length} productos nuevos`;
        }
    });
}

// Si no es administrador se lo redirige (también si escribe la URL a mano)
const usuario = await exigirAdministrador("carga-inicial.html");
if (usuario) await mostrarPanel();
