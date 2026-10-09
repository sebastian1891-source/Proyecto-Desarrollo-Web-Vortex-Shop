// =========================================================
// DETALLE DE PRODUCTO (producto.html?id=...)
// ---------------------------------------------------------
// Recupera el producto desde Firestore usando el id de la URL
// y arma la ficha: carrusel, información, características,
// valoraciones y productos relacionados (misma categoría).
// =========================================================

import { obtenerProductoPorId, obtenerProductosPorCategoria, sePuedeComprar, mensajeErrorProductos } from "./firebase/productos.js";
import { formatearPrecio, obtenerEstadoStock, crearTarjetaProducto, crearHtmlCargando, crearHtmlEstado, conBotonOcupado } from "./productosUI.js";
import { agregarYNotificar } from "./carrito.js";
import { renderizarValoraciones } from "./valoraciones.js";
import { escaparHtml } from "./mensajes.js";

const contenedor = document.querySelector("#detalle-producto");
const idProducto = new URLSearchParams(window.location.search).get("id");

function crearCarruselHtml(producto) {
    const imagenes = producto.imagenes.length ? producto.imagenes : [producto.imagen];

    const indicadores = imagenes.length > 1
        ? `<div class="carousel-indicators">
            ${imagenes.map((_, i) => `
                <button type="button" data-bs-target="#carruselProducto" data-bs-slide-to="${i}"
                    class="${i === 0 ? "active" : ""}" aria-current="${i === 0 ? "true" : "false"}"
                    aria-label="Imagen ${i + 1}"></button>
            `).join("")}
           </div>`
        : "";

    const controles = imagenes.length > 1
        ? `
            <button class="carousel-control-prev" type="button" data-bs-target="#carruselProducto" data-bs-slide="prev">
                <span class="carousel-control-prev-icon"></span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#carruselProducto" data-bs-slide="next">
                <span class="carousel-control-next-icon"></span>
            </button>
        `
        : "";

    return `
        <div class="hero-card">
            <div class="hero-card-header">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </div>
            <div id="carruselProducto" class="carousel slide">
                <div class="carousel-inner">
                    ${imagenes.map((img, i) => `
                        <div class="carousel-item ${i === 0 ? "active" : ""}">
                            <img src="${escaparHtml(img)}" class="d-block w-100" alt="${escaparHtml(producto.nombre)}">
                        </div>
                    `).join("")}
                </div>
                ${indicadores}
                ${controles}
            </div>
        </div>
    `;
}

// Lista de características técnicas (solo si el producto las tiene cargadas)
function crearCaracteristicasHtml(producto) {
    if (producto.caracteristicas.length === 0) return "";

    return `
        <div class="mt-4">
            <h3 class="h6">Características</h3>
            <ul class="mb-0">
                ${producto.caracteristicas.map(c => `<li>${escaparHtml(c)}</li>`).join("")}
            </ul>
        </div>
    `;
}

function crearFichaProducto(producto) {
    const estado = obtenerEstadoStock(producto);
    const comprable = sePuedeComprar(producto);

    return `
        <div class="row g-5 align-items-start">
            <div class="col-lg-6">
                ${crearCarruselHtml(producto)}
            </div>

            <div class="col-lg-6">
                <span class="eyebrow">${escaparHtml(producto.categoria)}</span>
                <h1 class="fw-bold mt-2">${escaparHtml(producto.nombre)}</h1>
                <p class="lead">${escaparHtml(producto.descripcion)}</p>
                <p class="${estado.clase} mb-3">${estado.texto}</p>
                <h2 class="fw-bold mb-3" style="color: var(--primary);">${formatearPrecio(producto.precio)}</h2>

                <button class="btn btn-primary btn-lg" id="btnAgregarCarrito" ${comprable ? "" : "disabled"}>
                    ${comprable ? "Agregar al carrito" : estado.texto}
                </button>

                <div class="mt-3">
                    <a href="catalogo.html" class="btn btn-outline-dark btn-sm">Volver al catálogo</a>
                </div>

                ${crearCaracteristicasHtml(producto)}
            </div>
        </div>

        <section class="mt-5">
            <div class="section-heading mb-3">
                <div>
                    <span class="eyebrow">Opiniones</span>
                    <h2 class="h4 fw-bold mb-0">Valoraciones del producto</h2>
                </div>
            </div>
            <div id="valoraciones-container"></div>
        </section>

        <section class="mt-5 d-none" id="seccion-relacionados">
            <div class="section-heading mb-3">
                <div>
                    <span class="eyebrow">También te puede interesar</span>
                    <h2 class="h4 fw-bold mb-0">Productos relacionados</h2>
                </div>
            </div>
            <div class="row g-4" id="relacionados-container"></div>
        </section>
    `;
}

function mostrarNoEncontrado() {
    document.title = "Vortex Shop | Producto no encontrado";
    contenedor.innerHTML = `<div class="row">${crearHtmlEstado({
        icono: "🔍",
        titulo: "Producto no encontrado",
        texto: "El producto que buscás no existe o ya no está en el catálogo.",
        boton: `<a href="catalogo.html" class="btn btn-primary mt-2">Ir al catálogo</a>`
    })}</div>`;
}

function mostrarError(error) {
    contenedor.innerHTML = `<div class="row">${crearHtmlEstado({
        icono: "⚠️",
        titulo: "No pudimos cargar el producto",
        texto: mensajeErrorProductos(error),
        boton: `<button class="btn btn-primary mt-2" id="btnReintentarProducto">Reintentar</button>`
    })}</div>`;

    contenedor.querySelector("#btnReintentarProducto").addEventListener("click", cargarProducto);
}

// Productos de la misma categoría (sin el actual). Si la consulta falla,
// simplemente no se muestra la sección: no es información esencial.
async function cargarRelacionados(producto) {
    try {
        const relacionados = (await obtenerProductosPorCategoria(producto.categoria))
            .filter(p => p.id !== producto.id);

        if (relacionados.length === 0) return;

        const contenedorRelacionados = document.querySelector("#relacionados-container");
        relacionados.forEach(p => contenedorRelacionados.appendChild(crearTarjetaProducto(p)));
        document.querySelector("#seccion-relacionados").classList.remove("d-none");

        contenedorRelacionados.addEventListener("click", evento => {
            const boton = evento.target.closest(".btn-agregar-carrito");
            if (boton) conBotonOcupado(boton, () => agregarYNotificar(boton.dataset.id, 1));
        });
    } catch (error) {
        console.error("No se pudieron cargar los productos relacionados:", error);
    }
}

async function cargarProducto() {
    if (!idProducto) {
        mostrarNoEncontrado();
        return;
    }

    contenedor.innerHTML = `<div class="row">${crearHtmlCargando("Cargando producto...")}</div>`;

    let producto;
    try {
        producto = await obtenerProductoPorId(idProducto);
    } catch (error) {
        console.error(error);
        mostrarError(error);
        return;
    }

    if (!producto) {
        mostrarNoEncontrado();
        return;
    }

    document.title = `Vortex Shop | ${producto.nombre}`;
    contenedor.innerHTML = crearFichaProducto(producto);

    const botonAgregar = document.querySelector("#btnAgregarCarrito");
    botonAgregar.addEventListener("click", () =>
        conBotonOcupado(botonAgregar, () => agregarYNotificar(producto.id, 1))
    );

    renderizarValoraciones(producto.id, "valoraciones-container");
    cargarRelacionados(producto);
}

if (contenedor) {
    cargarProducto();
}